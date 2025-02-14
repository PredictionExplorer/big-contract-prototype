// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

import { GameBase } from "./GameBase.sol";

contract Game2 is GameBase {
	constructor() {
	}

	/// @notice `Game1` calls this method the normal way (not via `delegatecall`).
	function destruct() external /*onlyOwner*/ {
		require(_msgSender() == game1, "Game2.destruct caller is unauthorized.");
		selfdestruct(payable(_msgSender()));
	}

	/// @notice The deployment script calls this method the normal way (not via `delegatecal`).
	/// It will call this method again if it deploys a new version of `Game1` and keeps the existing `Game2`.
	function setGame1(address newValue_) external onlyOwner {
		require(newValue_ != address(0));
		game1 = newValue_;

		// todo-1 In the production, emit an event here.
	}

	/// @notice We need this method to test that on contract destruction we will get back any ETH
	/// that somehow ended up in the `Game2` account.
	/// The test script calls this method the normal way (not via `delegatecal`).
	receive() external payable {
	}

	/// @notice An example game logic method.
	/// `Game1` calls this method via `delegatecall`.
	/// Obviously, hackers can call it the normal way as well, which could mess up `Game2` state, which is OK.
	function claimMainPrize() external {
		require(_msgSender() == lastBidderAddress, "The caller is not the last bidder.");
		require(block.timestamp >= mainPrizeTime, "Early claim.");
		++ roundNum;
		lastBidderAddress = address(0);
	}
}
