// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Action {
    address public seller;
    uint public actionEndTime;
    address public highestBidder;
    uint public highestBid;
    bool public ended;
    bool public isPaidToSeller;

    mapping(address => uint) public pendingReturns;
    mapping(address => uint) public bids;
    address[] public bidders;

    event HighestBidIncreased(address bidder, uint amount);
    event ActionEnded(address winner, uint amount);
    event ItemReceived(address buyer, uint amount);
    event Refunded(address buyer, uint amount);

    constructor(uint _biddingTime) {
        seller = msg.sender;
        actionEndTime = block.timestamp + _biddingTime;
    }

    function bid() external payable {
        require(block.timestamp < actionEndTime, "Auction already ended");
        require(msg.value > highestBid, "Bid not high enough");

        // hoàn tiền cho bidder cũ
        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        if (bids[msg.sender] == 0) {
            bidders.push(msg.sender);
        }

        bids[msg.sender] = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() external returns (bool) {
        uint amount = pendingReturns[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        pendingReturns[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        return true;
    }

    function finalize() external {
        require(block.timestamp >= actionEndTime, "Auction not yet ended");
        require(!ended, "Auction already finalized");

        ended = true;
        emit ActionEnded(highestBidder, highestBid);

        // ⚠️ KHÔNG gửi tiền cho seller ngay
        // tiền sẽ được giữ lại trong contract cho tới khi buyer xác nhận
    }

    // ✅ Buyer xác nhận đã nhận hàng
    function confirmReceived() external {
        require(ended, "Auction not ended");
        require(msg.sender == highestBidder, "Only winner can confirm");
        require(!isPaidToSeller, "Already paid to seller");

        isPaidToSeller = true;
        payable(seller).transfer(highestBid);

        emit ItemReceived(highestBidder, highestBid);
    }

    // ✅ Admin hoặc seller có thể hoàn tiền cho buyer trong trường hợp tranh chấp
    function refundBuyer() external {
        require(ended, "Auction not ended");
        require(!isPaidToSeller, "Already paid to seller");
        require(msg.sender == seller, "Only seller can refund buyer");

        uint amount = highestBid;
        highestBid = 0;
        payable(highestBidder).transfer(amount);

        emit Refunded(highestBidder, amount);
    }

    function getAllBids() public view returns (address[] memory, uint[] memory) {
        uint[] memory amounts = new uint[](bidders.length);
        for (uint i = 0; i < bidders.length; i++) {
            amounts[i] = bids[bidders[i]];
        }
        return (bidders, amounts);
    }
}
