// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

/// @notice Game state variables.
abstract contract GameStorage {
	/// @notice The `Game1` contract address.
	/// It's assigned a nonzero value only in `Game2`.
	/// @dev It's possible to declare this `immutable`if `Game1` constructor deployed `Game2`,
	/// but doing so would probably not result in a significant efficiency improvement.
	address public game1;

	/// @notice The `Game2` contract address.
	/// It's assigned a nonzero value only in `Game1`.
	address public immutable game2;

	uint256 public roundNum;
	address public lastBidderAddress;
	uint256 public mainPrizeTime;
}
