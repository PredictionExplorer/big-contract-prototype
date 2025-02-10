// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

/// @notice Game state variables.
abstract contract GameStorage {
	uint256 public roundNum;
	address public lastBidderAddress;
	uint256 public mainPrizeTime;
}
