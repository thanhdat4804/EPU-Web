// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Action.sol";

contract ActionFactory {
    address[] public allActions;

    event ActionCreated(address indexed seller, address actionAddress, uint endTime);

    function createAction(uint _biddingTime) external {
        // ✅ Sinh ra 1 contract Action mới
        Action newAction = new Action(_biddingTime);
        allActions.push(address(newAction));

        emit ActionCreated(msg.sender, address(newAction), block.timestamp + _biddingTime);
    }

    function getAllActions() external view returns (address[] memory) {
        return allActions;
    }
}
