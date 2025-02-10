"use strict";

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		version: "0.8.28",

		settings: {
			evmVersion: "cancun",
			viaIR: true,
			optimizer: {
				enabled: true,
				runs: 20000,
			},
			outputSelection: {
				"*": {
					"*": [
						"storageLayout"
					],
				},
			},
		},
	},
};
