// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

import { GameBase } from "./GameBase.sol";
import { Game2 } from "./Game2.sol";

contract Game1 is GameBase {
	// @notice The `Game2` contract address.
	Game2 public immutable game2;

	constructor(Game2 game2_) {
		require(address(game2_) != address(0));
		game2 = game2_;
	}

	/// @notice The contract owner calls this method to destroy both `Game1` and `Game2`
	/// and transfer ETH to a new version of `Game1`.
	/// This method has a different signature than its `Game2` counterpart,
	/// which makes it possible for someone to attempt to call the `Game2` counterpart via `delegatecall`.
	/// todo-1 In the production, require `onlyRoundIsInactive`.
	function destruct(bool destructGame2_, address payable newGame1_) external onlyOwner {
		require(newGame1_ != address(0));
		if (destructGame2_) {
			game2.destruct();
		}
		selfdestruct(newGame1_);
	}

	/// @notice This method forwards an unrecognized call to `game2`.
	/// todo-1 In the production, this method not necessarily needs to be `payable`.
	/// todo-1 I have found this code online. Is it correct?
	fallback() external payable {
		address game2_ = address(game2);
		assembly {
			calldatacopy(0, 0, calldatasize())
			let result_ := delegatecall(gas(), game2_, 0, calldatasize(), 0, 0)
			returndatacopy(0, 0, returndatasize())
			switch result_
				case 0 {
					revert(0, returndatasize())
				}
				default {
					return(0, returndatasize())
				}
		}
	}

	receive() external payable {
		// Interpreting any incoming ETH transfer as a bid.
		_bidWithEth();
	}

	/// @notice An example game logic method.
	function bidWithEth() external payable {
		_bidWithEth();
	}

	/// @notice An example game logic method.
	function _bidWithEth() private {
		require(msg.value > 0);

		if (lastBidderAddress == address(0)) {
			mainPrizeTime = block.timestamp + (20 seconds);
		} else {
			mainPrizeTime += (5 seconds);
		}

		lastBidderAddress = _msgSender();
	}
}
