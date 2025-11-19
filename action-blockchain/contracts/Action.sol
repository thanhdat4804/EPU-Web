// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Action {
    address public immutable seller;
    uint public immutable actionEndTime;
    uint public startingPrice;
    uint public sellerDeposit;

    address public highestBidder;
    uint public highestBid;

    bool public ended;
    bool public buyerPaid;        // Buyer đã thanh toán
    bool public sellerShipped;    // Seller đã xác nhận giao hàng
    bool public buyerConfirmed;   // Buyer đã xác nhận nhận hàng OK

    uint public constant BUYER_DEPOSIT_RATE = 10;           // 10% của bid
    uint public constant SELLER_DEPOSIT_RATE = 20;          // 20% của startingPrice
    uint public constant CONFIRM_WINDOW = 60;           // Buyer có 7 ngày để confirm sau khi seller shipped
    uint public constant DELIVERY_WINDOW = 60;         // Seller có 14 ngày để ship sau khi buyer paid

    uint public buyerPaidAt;      // Timestamp buyer thanh toán
    uint public sellerShippedAt;  // Timestamp seller xác nhận giao

    struct Bid {
        uint amount;
        uint deposit;
        bool refunded;
    }
    mapping(address => Bid) public bids;
    address[] public bidders;

    // ==================== EVENTS ====================
    event BidPlaced(address indexed bidder, uint amount);
    event AuctionEnded(address winner, uint finalPrice);
    event BuyerPaid(address indexed buyer, uint amount);
    event SellerShipped(address indexed seller);
    event BuyerConfirmed(address indexed buyer, uint amountReceivedBySeller);
    event SellerPenalized(address indexed seller, uint penaltyToBuyer, uint burned);
    event AutoReleasedToSeller(address indexed seller, uint amount);
    event DepositWithdrawn(address indexed bidder, uint amount);

    constructor(uint _biddingTime, address _seller, uint _startingPrice) payable {
        require(_seller != address(0), "Invalid seller");
        require(_startingPrice > 0, "Price > 0");
        uint required = (_startingPrice * SELLER_DEPOSIT_RATE) / 100;
        require(msg.value >= required, "Seller deposit insufficient");

        seller = _seller;
        startingPrice = _startingPrice;
        sellerDeposit = msg.value;
        actionEndTime = block.timestamp + _biddingTime;
    }

    // ==================== ĐẤU GIÁ ====================
    function placeBid(uint _amount) external payable {
        require(block.timestamp < actionEndTime, "Ended");
        require(_amount > highestBid, "Bid too low");

        uint requiredDeposit = (_amount * BUYER_DEPOSIT_RATE) / 100;
        Bid storage b = bids[msg.sender];

        uint extra = requiredDeposit > b.deposit ? requiredDeposit - b.deposit : 0;
        require(msg.value >= extra, "Deposit insufficient");
        if (msg.value > extra) payable(msg.sender).transfer(msg.value - extra);

        if (b.amount == 0) bidders.push(msg.sender);

        b.amount = _amount;
        b.deposit = requiredDeposit;

        highestBidder = msg.sender;
        highestBid = _amount;

        emit BidPlaced(msg.sender, _amount);
    }

    function finalize() external {
        require(block.timestamp >= actionEndTime, "Not ended");
        require(!ended, "Already ended");
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
    }

    // ==================== 1. BUYER THANH TOÁN ====================
    function payWinningBid() external payable {
        require(ended, "Not ended");
        require(msg.sender == highestBidder, "Not winner");
        require(!buyerPaid, "Already paid");

        uint remaining = highestBid - bids[msg.sender].deposit;
        require(msg.value == remaining, "Wrong amount");

        buyerPaid = true;
        buyerPaidAt = block.timestamp;

        emit BuyerPaid(msg.sender, highestBid);
    }

    // ==================== 2. SELLER XÁC NHẬN ĐÃ GIAO HÀNG ====================
    function confirmShipped() external {
        require(msg.sender == seller, "Not seller");
        require(buyerPaid, "Buyer not paid");
        require(!sellerShipped, "Already shipped");
        require(block.timestamp <= buyerPaidAt + DELIVERY_WINDOW, "Too late to ship");

        sellerShipped = true;
        sellerShippedAt = block.timestamp;

        emit SellerShipped(seller);
    }

    // ==================== 3. BUYER XÁC NHẬN ĐÃ NHẬN HÀNG OK → TIỀN CHUYỂN CHO SELLER ====================
    function confirmReceived() external {
        require(msg.sender == highestBidder, "Not buyer");
        require(sellerShipped, "Seller not shipped");
        require(!buyerConfirmed, "Already confirmed");

        buyerConfirmed = true;

        uint totalToSeller = highestBid + sellerDeposit;
        payable(seller).transfer(totalToSeller);

        emit BuyerConfirmed(msg.sender, totalToSeller);
    }

    // ==================== 4. TỰ ĐỘNG CHUYỂN TIỀN CHO SELLER NẾU BUYER QUÊN CONFIRM ====================
    function releaseToSeller() external {
        require(sellerShipped, "Not shipped");
        require(!buyerConfirmed, "Already confirmed");
        require(block.timestamp > sellerShippedAt + CONFIRM_WINDOW, "Still in confirm window");

        buyerConfirmed = true; // đánh dấu để không gọi lại
        uint totalToSeller = highestBid + sellerDeposit;
        payable(seller).transfer(totalToSeller);
        emit AutoReleasedToSeller(seller, totalToSeller);
    }

    // ==================== 5. PHẠT SELLER NẾU KHÔNG GIAO HÀNG ====================
    function penalizeSeller() external {
        require(buyerPaid, "Buyer not paid");
        require(!sellerShipped, "Already shipped");
        require(block.timestamp > buyerPaidAt + DELIVERY_WINDOW, "Still in delivery window");

        uint half = sellerDeposit / 2;
        payable(highestBidder).transfer(highestBid + half);      // trả tiền bid + 50% cọc seller
        payable(address(0xdead)).transfer(half);                 // đốt 50%

        emit SellerPenalized(seller, half + highestBid, half);
    }

    // ==================== RÚT CỌC NGƯỜI THUA ====================
    function withdrawDeposit() external {
        require(ended, "Not ended");
        Bid storage b = bids[msg.sender];
        require(b.deposit > 0, "No deposit");
        require(b.refunded == false, "Already withdrawn");

        if (msg.sender == highestBidder) {
            require(buyerConfirmed || sellerShipped == false, "Winner can't withdraw now");
        }

        b.refunded = true;
        payable(msg.sender).transfer(b.deposit);
        emit DepositWithdrawn(msg.sender, b.deposit);
    }

    // ==================== VIEW ====================
    function getStatus() external view returns (string memory) {
        if (!ended) return "Active";
        if (!buyerPaid) return "Ended - Awaiting Payment";
        if (!sellerShipped) return "Paid - Awaiting Shipment";
        if (!buyerConfirmed) return "Shipped - Awaiting Confirmation";
        return "Completed";
    }
}