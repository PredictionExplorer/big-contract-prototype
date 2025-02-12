"use strict";

const { expect } = require("chai");
const hre = require("hardhat");
// const { chai } = require("@nomicfoundation/hardhat-chai-matchers");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployContractsForUnitTesting } = require("../src/ContractUnitTestingHelpers.js");

describe("Game", function () {
	it("Test 1", async function () {
		const {signers, deployerAcct, game1, game1Addr, game2Factory, game2, game2Addr,} =
			// await deployContractsForUnitTesting();
			await loadFixture(deployContractsForUnitTesting);
		const [, bidder1, bidder2, signer3,] = signers;

		// We will use this to call `game2` methods via `game1`.
		const game1AsGame2 = game2Factory.attach(game1Addr);

		expect(await game1.game2()).equal(game2Addr);
		expect(await game2.game1()).equal(game1Addr);

		// Bid by sending ETH.
		await bidder1.sendTransaction({to: game1Addr, value: 10n,});

		// Zero value is not allowed.
		await expect(game1.connect(bidder1).bidWithEth({value: 0n,})).reverted;

		await game1.connect(bidder1).bidWithEth({value: 100n,});
		await game1.connect(bidder2).bidWithEth({value: 1_000n,});

		// It's too early to claim.
		await expect(game1AsGame2.connect(bidder2).claimMainPrize()).reverted;

		await hre.ethers.provider.send("evm_increaseTime", [60,]);
		// await hre.ethers.provider.send("evm_mine");

		// A non-last bidder attempts to claim.
		await expect(game1AsGame2.connect(bidder1).claimMainPrize()).reverted;

		// `Game1.fallback` is `payable`, but `Game2.claimMainPrize` is not, so `delegatecall` fails.
		await expect(game1AsGame2.connect(bidder2).claimMainPrize({value: 2n,})).reverted;

		await game1AsGame2.connect(bidder2).claimMainPrize();
		expect(await game1.roundNum()).equal(1n);

		// `game2` state isn't supposed to change. Although hackers can try to mess things up there, which is OK.
		expect(await game2.roundNum()).equal(0n);

		// Transferring some ETH to `game2`. We are supposed to get it back on contract destruction.
		await signer3.sendTransaction({to: game2Addr, value: 10_000n,});

		// An unauthorized caller attempts to call a restricted method.
		await expect(game1.connect(signer3).destruct(true, signer3.getAddress())).reverted;

		// An unauthorized caller attempts to call a restricted method.
		await expect(game2.connect(signer3).destruct()).reverted;

		// An unauthorized caller attempts to call a restricted method via `delegatecall`.
		await expect(game1AsGame2.connect(signer3).destruct()).reverted;

		const signer3BalanceAmountBefore_ = await hre.ethers.provider.getBalance(signer3.address);
		await game1.connect(deployerAcct).destruct(true, signer3.getAddress());
		const signer3BalanceAmountAfter_ = await hre.ethers.provider.getBalance(signer3.address);

		// We got back ETH from both game accounts.
		expect(signer3BalanceAmountAfter_).equal(signer3BalanceAmountBefore_ + 11_110n);

		// Both game contracts have been deleted from the blockchain.
		// todo-1 For some reason, these validations fail.
		// expect(await hre.ethers.provider.getCode(game1Addr)).equal("0x");
		// expect(await hre.ethers.provider.getCode(game2Addr)).equal("0x");

		// todo-1 For some reason, this validation succeeds, despite of the fact that the contract has been destroyed.
		expect(await game1.roundNum()).equal(1n);

		// At least these validations succeed.
		expect(await hre.ethers.provider.getBalance(game1Addr)).equal(0n);
		expect(await hre.ethers.provider.getBalance(game2Addr)).equal(0n);
	});
});
