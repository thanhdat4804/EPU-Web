// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Action {
    address public seller;
    uint public actionEndTime;
    address public highestBidder;
    uint public highestBid;
    bool public ended;

    mapping(address => uint) public pendingReturns;
    mapping(address => uint) public bids;
    address[] public bidders;

    event HighestBidIncreased(address bidder, uint amount);
    event ActionEnded(address winner, uint amount);

    constructor(uint _biddingTime) {
        seller = msg.sender;
        actionEndTime = block.timestamp + _biddingTime;
    }

    function bid() external payable {
        require(block.timestamp < actionEndTime, "Action already ended");
        require(msg.value > highestBid, "Bid not high enough");

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
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            payable(msg.sender).transfer(amount);
            return true;
        }
        return false;
    }

    function finalize() external {
        require(block.timestamp >= actionEndTime, "Action not yet ended");
        require(!ended, "Action already finalized");

        ended = true;
        emit ActionEnded(highestBidder, highestBid);

        payable(seller).transfer(highestBid);
    }

    function getAllBids() public view returns (address[] memory, uint[] memory) {
        uint[] memory amounts = new uint[](bidders.length);
        for (uint i = 0; i < bidders.length; i++) {
            amounts[i] = bids[bidders[i]];
        }
        return (bidders, amounts);
    }
}
