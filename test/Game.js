"use strict";

const { expect } = require("chai");
const hre = require("hardhat");
// const { chai } = require("@nomicfoundation/hardhat-chai-matchers");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployContractsForUnitTesting } = require("../src/ContractUnitTestingHelpers.js");

describe("Game", function () {
	it("Test 1", async function () {
		const {signers, /*deployerAcct,*/ game1, game1Addr, game2Factory, game2, game2Addr,} =
			// await deployContractsForUnitTesting();
			await loadFixture(deployContractsForUnitTesting);
		const [signer0, bidder1, bidder2, signer3,] = signers;

		// We use this to call `game2` methods via `delegatecall`.
		const game2Proxy = game2Factory.attach(game1Addr);

		expect(await game1.game1()).equal(hre.ethers.ZeroAddress);
		expect(await game1.game2()).equal(game2Addr);
		expect(await game2.game1()).equal(game1Addr);
		expect(await game2.game2()).equal(hre.ethers.ZeroAddress);
		await expect(game2.connect(signer3).setGame1(signer3.address)).revertedWithCustomError(game2, "OwnableUnauthorizedAccount");
		await expect(game2Proxy.connect(signer3).setGame1(signer3.address)).revertedWithCustomError(game2Proxy, "OwnableUnauthorizedAccount");

		// Bidding by sending ETH.
		await bidder1.sendTransaction({to: game1Addr, value: 10n,});

		await expect(game1.connect(bidder1).bidWithEth({value: 0n,})).revertedWith("Zero value.");
		await game1.connect(bidder1).bidWithEth({value: 100n,});
		await game1.connect(bidder2).bidWithEth({value: 1_000n,});
		await expect(game2Proxy.connect(bidder2).claimMainPrize()).revertedWith("Early claim.");
		await hre.ethers.provider.send("evm_increaseTime", [60,]);
		// await hre.ethers.provider.send("evm_mine");
		await expect(game2Proxy.connect(bidder1).claimMainPrize()).revertedWith("The caller is not the last bidder.");

		// `Game1.fallback` is `payable`, but `Game2.claimMainPrize` is not, so `delegatecall` fails.
		// This reverts with "non-payable function was called with value 2".
		await expect(game2Proxy.connect(bidder2).claimMainPrize({value: 2n,})).reverted;

		await game2Proxy.connect(bidder2).claimMainPrize();
		expect(await game1.roundNum()).equal(1n);

		// `game2` state isn't supposed to change. Although hackers can try to mess things up there, which is OK.
		expect(await game2.roundNum()).equal(0n);

		// Transferring some ETH to `game2`. We are supposed to get it back on contract destruction.
		await signer3.sendTransaction({to: game2Addr, value: 10_000n,});

		await expect(game1.connect(signer3).destruct(true, signer3.address)).revertedWithCustomError(game1, "OwnableUnauthorizedAccount");
		await expect(game2.connect(signer3).destruct()).revertedWith("Game2.destruct caller is unauthorized.");
		await expect(game2Proxy.connect(signer3).destruct()).revertedWith("Game2.destruct caller is unauthorized.");
		let signer3BalanceAmountChange = await hre.ethers.provider.getBalance(signer3.address);

		// This call is made by `deployerAcct`.
		await game1.destruct(true, signer3.address);

		signer3BalanceAmountChange = await hre.ethers.provider.getBalance(signer3.address) - signer3BalanceAmountChange;

		// We got back ETH from both game accounts.
		expect(signer3BalanceAmountChange).equal(11_110n);
		expect(await hre.ethers.provider.getBalance(game1Addr)).equal(0n);
		expect(await hre.ethers.provider.getBalance(game2Addr)).equal(0n);

		// expect(await hre.ethers.provider.getCode(signer3.address)).equal("0x");

		// Surprisingly, bytecode and storage of both game contracts have not been deleted from the blockchain,
		// which is how stuff currently works by design.
		expect(await hre.ethers.provider.getCode(game1Addr)).not.equal("0x");
		expect(await hre.ethers.provider.getCode(game2Addr)).not.equal("0x");
		expect(await game1.roundNum()).equal(1n);
	});
});
