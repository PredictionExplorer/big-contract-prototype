// #region

"use strict";

// #endregion
// #region

const { HardhatContext } = require("hardhat/internal/context");

// #endregion
// #region `deployContracts`

/**
 * @param {import("ethers").BaseWallet} deployerAcct 
 * @param {string} game2Addr May be empty.
 * @returns 
 */
const deployContracts = async function (
	deployerAcct,
   game2Addr
) {
	const hre = HardhatContext.getHardhatContext().environment;

	const game2Factory = await hre.ethers.getContractFactory("Game2", deployerAcct);
   let game2;
   if (game2Addr.length === 0) {
      game2 = await game2Factory.deploy();
      await game2.waitForDeployment();
      game2Addr = await game2.getAddress();
   } else {
      game2 = game2Factory.attach(game2Addr);
   }

	const game1Factory = await hre.ethers.getContractFactory("Game1", deployerAcct);
	const game1 = await game1Factory.deploy(game2Addr);
	await game1.waitForDeployment();
	const game1Addr = await game1.getAddress();

   await game2.prepare(game1Addr);

	return {
      game1Factory,
      game1,
      game1Addr,
      game2Factory,
      game2,
      game2Addr,
   };
}

// #endregion
// #region

module.exports = { deployContracts, };

// #endregion
