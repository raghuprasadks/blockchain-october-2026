import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("eKaushalya", async function () {
  const { viem } = await network.create();
  const [deployer, recipient] = await viem.getWalletClients();
  const initialSupply = 10_000n * 10n ** 18n;

  it("creates a fixed supply for the deploying wallet", async function () {
    const token = await viem.deployContract("EKaushalya");

    assert.equal(await token.read.name(), "eKaushalya");
    assert.equal(await token.read.symbol(), "EKA");
    assert.equal(await token.read.decimals(), 18);
    assert.equal(await token.read.totalSupply(), initialSupply);
    assert.equal(
      await token.read.balanceOf([deployer.account.address]),
      initialSupply,
    );
  });

  it("transfers tokens using the ERC-20 standard", async function () {
    const token = await viem.deployContract("EKaushalya");
    const transferAmount = 250n * 10n ** 18n;

    await viem.assertions.emitWithArgs(
      token.write.transfer([recipient.account.address, transferAmount]),
      token,
      "Transfer",
      [deployer.account.address, recipient.account.address, transferAmount],
    );

    assert.equal(
      await token.read.balanceOf([recipient.account.address]),
      transferAmount,
    );
    assert.equal(
      await token.read.balanceOf([deployer.account.address]),
      initialSupply - transferAmount,
    );
    assert.equal(await token.read.totalSupply(), initialSupply);
  });
});
