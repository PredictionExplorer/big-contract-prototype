// #region

"use strict";

// #endregion
// #region

const hre = require("hardhat");
const { basicDeployment } = require("./Deploy.js");

// #endregion
// #region `deployContractsForTesting`

/// This function is to be used for unit tests. It's to be passed to `loadFixture`.
async function deployContractsForTesting() {
	const signers = await hre.ethers.getSigners();
	const deployerAcct = signers[19];
	const contracts =
		await basicDeployment(deployerAcct, "");
	contracts.signers = signers;
	contracts.deployerAcct = deployerAcct;
	return contracts;
}

// #endregion
// #region

module.exports = {
	deployContractsForTesting,
};

// #endregion
