// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Action.sol";

contract ActionFactory {
    address[] public allActions;

    event ActionCreated(address indexed seller, address actionAddress, uint endTime);

    function createAction(uint _biddingTime, address _seller) external {
        require(_seller != address(0), "Invalid seller");

        // ✅ Truyền địa chỉ seller vào constructor
        Action newAction = new Action(_biddingTime, _seller);
        allActions.push(address(newAction));

        emit ActionCreated(_seller, address(newAction), block.timestamp + _biddingTime);
    }

    function getAllActions() external view returns (address[] memory) {
        return allActions;
    }
}
