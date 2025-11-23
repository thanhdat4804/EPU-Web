// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Action.sol";

contract ActionFactory {
    address[] public allActions;

    event ActionCreated(
        address indexed seller,
        address actionAddress,
        uint startingPrice,
        uint sellerDeposit,
        uint endTime
    );

    /**
     * @dev Tạo auction mới – BẮT BUỘC seller gửi cọc 20% của startingPrice
     * @param _biddingTime Thời gian đấu giá (giây)
     * @param _seller Địa chỉ người bán
     * @param _startingPrice Giá khởi điểm (wei)
     */
    function createAction(
        uint _biddingTime,
        address _seller,
        uint _startingPrice
    ) external payable {
        require(_seller != address(0), "Invalid seller address");
        require(_startingPrice > 0, "Starting price must be > 0");

        // TÍNH CỌC: 20% của startingPrice
        uint requiredDeposit = (_startingPrice * 20) / 100;
        require(msg.value >= requiredDeposit, "Seller must deposit 20% of starting price");

        // DEPLOY CONTRACT MỚI VỚI ETH (cọc)
        Action newAction = (new Action){value: msg.value}(
            _biddingTime,
            _seller,
            _startingPrice
        );

        allActions.push(address(newAction));

        emit ActionCreated(
            _seller,
            address(newAction),
            _startingPrice,
            msg.value,
            block.timestamp + _biddingTime
        );
    }

    function getAllActions() external view returns (address[] memory) {
        return allActions;
    }

    function getActionCount() external view returns (uint) {
        return allActions.length;
    }
}