// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { GameStorage } from "./GameStorage.sol";

/// @notice Base contract of `Game1` and `Game2`.
abstract contract GameBase is Ownable, GameStorage {
	constructor() Ownable(_msgSender()) {
	}
}
