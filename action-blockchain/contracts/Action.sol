// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Action (Auction Contract with Deposit & Penalty)
 * @notice Mô phỏng một cuộc đấu giá kiểu escrow:
 *  - Khi người dùng đặt giá: chỉ lưu dữ liệu, không trừ tiền
 *  - Nhưng yêu cầu gửi một khoản deposit nhỏ (ví dụ 10%) để tránh spam
 *  - Sau khi hết hạn, người thắng phải thanh toán đủ (trừ phần deposit)
 *  - Nếu không thanh toán, deposit bị phạt & seller có thể thu tiền phạt
 */

contract Action {
    address public seller;            // Người tạo cuộc đấu giá
    uint public actionEndTime;        // Thời gian kết thúc đấu giá
    address public highestBidder;     // Người đang giữ giá cao nhất
    uint public highestBid;           // Mức giá cao nhất
    bool public ended;                // Đấu giá đã kết thúc hay chưa
    bool public isPaidToSeller;       // Đã thanh toán cho người bán chưa
    bool public isDisputed;           // Có tranh chấp không

    uint public constant DEPOSIT_RATE = 10; // 10% đặt cọc bắt buộc

    struct Bid {
        uint amount;       // Số tiền người mua đặt
        uint deposit;      // Tiền cọc họ gửi khi đặt giá
        bool refunded;     // Đã được hoàn tiền chưa
    }

    mapping(address => Bid) public bids;
    address[] public bidders;

    event BidPlaced(address bidder, uint amount, uint deposit);
    event ActionEnded(address winner, uint amount);
    event PaymentMade(address buyer, uint totalPaid);
    event ItemReceived(address buyer, uint amount);
    event Refunded(address buyer, uint amount);
    event Penalized(address bidder, uint deposit);
    event Disputed(address buyer, uint amount);

    /**
     * @dev Khởi tạo cuộc đấu giá
     * @param _biddingTime thời gian diễn ra đấu giá (tính bằng giây)
     * @param _seller địa chỉ người bán
     */
    constructor(uint _biddingTime, address _seller) {
        require(_seller != address(0), "Invalid seller address");
        seller = _seller;
        actionEndTime = block.timestamp + _biddingTime;
    }

    /**
     * @dev Người dùng đặt giá (chỉ cần đặt cọc 10%)
     * @param _amount số tiền muốn đấu giá (ETH)
     */
    function placeBid(uint _amount) external payable {
        require(block.timestamp < actionEndTime, "Auction already ended");
        require(_amount > highestBid, "Bid not high enough");

        uint requiredDeposit = (_amount * DEPOSIT_RATE) / 100;
        Bid storage userBid = bids[msg.sender];

        // ✅ Tính số tiền cần gửi thêm để đủ cọc 10% mới
        uint additionalDeposit = 0;
        if (requiredDeposit > userBid.deposit) {
            additionalDeposit = requiredDeposit - userBid.deposit;
            require(msg.value >= additionalDeposit, "Not enough additional deposit");
            userBid.deposit += additionalDeposit;
        } else {
            // Nếu deposit hiện tại đã đủ (do đã gửi dư từ trước)
            require(msg.value == 0, "No need to send more deposit");
        }

        // ✅ Cập nhật thông tin bid
        userBid.amount = _amount;
        userBid.refunded = false;

        // ✅ Nếu đây là lần đầu đặt thì thêm vào danh sách bidders
        if (bids[msg.sender].amount == 0) {
            bidders.push(msg.sender);
        }

        // ✅ Cập nhật người dẫn đầu
        highestBidder = msg.sender;
        highestBid = _amount;

        emit BidPlaced(msg.sender, _amount, userBid.deposit);
    }


    /**
     * @dev Kết thúc đấu giá (chỉ seller hoặc admin gọi)
     */
    function finalize() external {
        require(block.timestamp >= actionEndTime, "Auction not yet ended");
        require(!ended, "Already finalized");
        ended = true;

        emit ActionEnded(highestBidder, highestBid);
    }

    /**
     * @dev Người thắng thanh toán phần còn lại (trừ tiền đặt cọc)
     */
    function payWinningBid() external payable {
        require(ended, "Auction not ended");
        require(msg.sender == highestBidder, "Only winner can pay");
        require(!isPaidToSeller, "Already paid");
        require(!isDisputed, "Under dispute");

        uint deposit = bids[msg.sender].deposit;
        uint remaining = highestBid - deposit;
        require(msg.value == remaining, "Must pay remaining balance");

        // 💰 Tiền được giữ lại trong contract, chưa gửi cho seller
        isPaidToSeller = false; // vẫn giữ là false
        emit PaymentMade(msg.sender, highestBid);
    }

    function confirmReceived() external {
        require(msg.sender == highestBidder, "Only buyer can confirm");
        require(!isDisputed, "Disputed transaction");
        require(!isPaidToSeller, "Already paid");

        // 💸 Bây giờ mới chuyển tiền cho seller
        isPaidToSeller = true;
        payable(seller).transfer(highestBid);

        emit ItemReceived(highestBidder, highestBid);
    }

    /**
     * @dev Seller hoặc hệ thống có thể mở tranh chấp nếu hàng không đúng
     */
    function openDispute() external {
        require(ended, "Auction not ended");
        require(msg.sender == highestBidder || msg.sender == seller, "Not allowed");
        require(!isDisputed, "Already disputed");

        isDisputed = true;
        emit Disputed(highestBidder, highestBid);
    }

    /**
     * @dev Seller hoàn tiền nếu tranh chấp thành công
     */
    function refundBuyer() external {
        require(isDisputed, "No dispute");
        require(msg.sender == seller, "Only seller can refund buyer");

        payable(highestBidder).transfer(highestBid);
        emit Refunded(highestBidder, highestBid);
    }

    /**
     * @dev Nếu người thắng không thanh toán sau 24h -> mất cọc
     */
    function penalizeWinner() external {
        require(ended, "Auction not ended");
        require(!isPaidToSeller, "Already paid");
        require(block.timestamp > actionEndTime + 1 days, "Too early");

        Bid storage bidInfo = bids[highestBidder];
        uint penalty = bidInfo.deposit;
        require(penalty > 0, "No deposit to penalize");

        bidInfo.deposit = 0;
        payable(seller).transfer(penalty);

        emit Penalized(highestBidder, penalty);
    }

    /**
     * @dev Người thua có thể rút lại tiền cọc sau khi đấu giá kết thúc
     */
    function withdrawDeposit() external {
        require(ended, "Auction not ended");
        require(msg.sender != highestBidder, "Winner cannot withdraw");
        Bid storage bidInfo = bids[msg.sender];
        require(!bidInfo.refunded, "Already refunded");
        require(bidInfo.deposit > 0, "No deposit found");

        uint amount = bidInfo.deposit;
        bidInfo.deposit = 0;
        bidInfo.refunded = true;

        payable(msg.sender).transfer(amount);
        emit Refunded(msg.sender, amount);
    }

    /**
     * @dev Lấy toàn bộ danh sách người đặt giá & số tiền họ đặt
     */
    function getAllBids() public view returns (address[] memory, uint[] memory, uint[] memory) {
        uint[] memory amounts = new uint[](bidders.length);
        uint[] memory deposits = new uint[](bidders.length);

        for (uint i = 0; i < bidders.length; i++) {
            amounts[i] = bids[bidders[i]].amount;
            deposits[i] = bids[bidders[i]].deposit;
        }

        return (bidders, amounts, deposits);
    }
}
