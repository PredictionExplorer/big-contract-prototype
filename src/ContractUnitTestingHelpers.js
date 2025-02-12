// #region

"use strict";

// #endregion
// #region

const hre = require("hardhat");
const { deployContracts } = require("./ContractDeploymentHelpers.js");

// #endregion
// #region `deployContractsForUnitTesting`

/// This function is to be used for unit tests. It's to be passed to `loadFixture`.
async function deployContractsForUnitTesting() {
	const signers = await hre.ethers.getSigners();
	const deployerAcct = signers[19];
	const contracts = await deployContracts(deployerAcct, "");
	contracts.signers = signers;
	contracts.deployerAcct = deployerAcct;
	return contracts;
}

// #endregion
// #region

module.exports = {
	deployContractsForUnitTesting,
};

// #endregion
