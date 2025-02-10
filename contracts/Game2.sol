// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

import { GameBase } from "./GameBase.sol";

contract Game2 is GameBase {
	// @notice The `Game1` contract address.
	address public game1;

	constructor() {
	}

	/// @notice The deployment script calls this method.
	/// It's possible to call this method again if we deploy a new version of `Game1` and leave the old `Game2`.
	function prepare(address game1_) external onlyOwner {
		require(game1_ != address(0));
		game1 = game1_;
	}

	/// @notice `Game1` calls this method the normal way (not via `delegatecall`).
	function destruct() external /*onlyOwner*/ {
		require(_msgSender() == game1);
		selfdestruct(payable(_msgSender()));
	}

	/// @notice We need this method to test that on contract destruction we will get back any ETH
	/// that somehow ended up in the `Game2` account.
	receive() external payable {
	}

	/// @notice An example game logic method.
	/// `Game1` calls this method via `delegatecall`.
	/// Obviously, hackers can call it the normal way as well, which could mess up `Game2` state, which is OK.
	function claimMainPrize() external {
		require(_msgSender() == lastBidderAddress);
		require(block.timestamp >= mainPrizeTime);
		++ roundNum;
		lastBidderAddress = address(0);
	}
}
