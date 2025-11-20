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
    bool public buyerPaid;
    bool public sellerShipped;
    bool public buyerConfirmed;

    uint public constant BUYER_DEPOSIT_RATE = 10;   // 10% của bid
    uint public constant SELLER_DEPOSIT_RATE = 20;  // 20% của startingPrice
    uint public constant CONFIRM_WINDOW = 60;       // test: 60s (live: 7 days)
    uint public constant DELIVERY_WINDOW = 60;      // test: 60s (live: 14 days)
    uint public constant PAYMENT_WINDOW = 60;       // thời gian winner phải thanh toán (test: 60s)

    uint public buyerPaidAt;
    uint public sellerShippedAt;

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
    event WinnerPenalized100Percent(address indexed winner, address indexed seller, uint compensationToSeller, uint sellerDepositRefunded);

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

    // ==================== 2. SELLER XÁC NHẬN GIAO HÀNG ====================
    function confirmShipped() external {
        require(msg.sender == seller, "Not seller");
        require(buyerPaid, "Buyer not paid");
        require(!sellerShipped, "Already shipped");
        require(block.timestamp <= buyerPaidAt + DELIVERY_WINDOW, "Too late");

        sellerShipped = true;
        sellerShippedAt = block.timestamp;
        emit SellerShipped(seller);
    }

    // ==================== 3. BUYER XÁC NHẬN NHẬN HÀNG ====================
    function confirmReceived() external {
        require(msg.sender == highestBidder, "Not buyer");
        require(sellerShipped, "Not shipped");
        require(!buyerConfirmed, "Already confirmed");

        buyerConfirmed = true;
        uint totalToSeller = highestBid + sellerDeposit;

        (bool sent, ) = payable(seller).call{value: totalToSeller}("");
        require(sent, "Transfer to seller failed");

        emit BuyerConfirmed(msg.sender, totalToSeller);
    }

    // ==================== 4. TỰ ĐỘNG CHUYỂN TIỀN CHO SELLER NẾU BUYER QUÊN CONFIRM ====================
    function releaseToSeller() external {
        require(sellerShipped, "Not shipped");
        require(!buyerConfirmed, "Already confirmed");
        require(block.timestamp > sellerShippedAt + CONFIRM_WINDOW, "Still in window");

        buyerConfirmed = true;
        uint totalToSeller = highestBid + sellerDeposit;

        (bool sent, ) = payable(seller).call{value: totalToSeller}("");
        require(sent, "Transfer failed");

        emit AutoReleasedToSeller(seller, totalToSeller);
    }

    // ==================== 5. PHẠT SELLER KHÔNG GIAO HÀNG ====================
    function penalizeSeller() external {
        require(buyerPaid, "Buyer not paid");
        require(!sellerShipped, "Already shipped");
        require(block.timestamp > buyerPaidAt + DELIVERY_WINDOW, "Still in window");

        uint half = sellerDeposit / 2;

        (bool sent1, ) = payable(highestBidder).call{value: highestBid + half}("");
        require(sent1, "Refund to buyer failed");

        (bool sent2, ) = payable(address(0xdead)).call{value: half}("");
        require(sent2, "Burn failed");

        emit SellerPenalized(seller, highestBid + half, half);
    }

    // ==================== 6. PHẠT WINNER KHÔNG THANH TOÁN – 100% CỌC → SELLER ====================
    function penalizeWinner() external {
        require(ended, "Auction not ended");
        require(!buyerPaid, "Buyer already paid");
        require(block.timestamp > actionEndTime + PAYMENT_WINDOW, "Still in payment window");

        Bid storage winnerBid = bids[highestBidder];
        uint winnerDeposit = winnerBid.deposit;

        // 100% cọc của winner → chuyển hết cho seller
        if (winnerDeposit > 0) {
            winnerBid.refunded = true;
            (bool sent1, ) = payable(seller).call{value: winnerDeposit}("");
            require(sent1, "Transfer winner deposit to seller failed");
        }

        // Hoàn lại 100% cọc gốc của seller
        (bool sent2, ) = payable(seller).call{value: sellerDeposit}("");
        require(sent2, "Refund seller deposit failed");

        // Đánh dấu để chặn các hàm khác
        buyerPaid = true;
        buyerConfirmed = true;

        emit WinnerPenalized100Percent(highestBidder, seller, winnerDeposit, sellerDeposit);
    }

    // ==================== RÚT CỌC NGƯỜI THUA ====================
    function withdrawDeposit() external {
        require(ended, "Not ended");
        Bid storage b = bids[msg.sender];
        require(b.deposit > 0, "No deposit");
        require(!b.refunded, "Already withdrawn");

        if (msg.sender == highestBidder) {
            require(buyerConfirmed || !sellerShipped, "Winner can't withdraw now");
        }

        b.refunded = true;
        (bool sent, ) = payable(msg.sender).call{value: b.deposit}("");
        require(sent, "Transfer failed");

        emit DepositWithdrawn(msg.sender, b.deposit);
    }

    // ==================== AUTO HOÀN CỌC NGƯỜI THUA ====================
    function autoRefundLosers() external {
        require(ended, "Auction not ended");

        for (uint i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];
            Bid storage b = bids[bidder];

            if (bidder != highestBidder && b.deposit > 0 && !b.refunded) {
                b.refunded = true;
                (bool sent, ) = payable(bidder).call{value: b.deposit}("");
                require(sent, "Refund failed");
                emit DepositWithdrawn(bidder, b.deposit);
            }
        }
    }

    // ==================== VIEW ====================
    function getStatus() external view returns (string memory) {
        if (!ended) return "Active";
        if (!buyerPaid) return "Ended - Awaiting Payment";
        if (!sellerShipped) return "Paid - Awaiting Shipment";
        if (!buyerConfirmed) return "Shipped - Awaiting Confirmation";
        return "Completed";
    }

    function getAllBids() external view returns (
        address[] memory addresses,
        uint[] memory amounts,
        uint[] memory deposits,
        bool[] memory refunded
    ) {
        uint total = bidders.length;
        addresses = new address[](total);
        amounts = new uint[](total);
        deposits = new uint[](total);
        refunded = new bool[](total);

        for (uint i = 0; i < total; i++) {
            address bidder = bidders[i];
            Bid memory b = bids[bidder];
            addresses[i] = bidder;
            amounts[i] = b.amount;
            deposits[i] = b.deposit;
            refunded[i] = b.refunded;
        }
    }
}