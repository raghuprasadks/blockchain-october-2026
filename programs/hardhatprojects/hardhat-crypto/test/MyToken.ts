import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("MyToken", async function () {
  const { viem } = await network.create();
  const [owner, recipient, spender] = await viem.getWalletClients();
  const initialSupply = 1_000_000n * 10n ** 18n;

  it("assigns the fixed initial supply to the deployer", async function () {
    const token = await viem.deployContract("MyToken");

    assert.equal(await token.read.name(), "MyToken");
    assert.equal(await token.read.symbol(), "MTK");
    assert.equal(await token.read.decimals(), 18);
    assert.equal(await token.read.totalSupply(), initialSupply);
    assert.equal(
      await token.read.balanceOf([owner.account.address]),
      initialSupply,
    );
  });

  it("transfers tokens between accounts", async function () {
    const token = await viem.deployContract("MyToken");
    const transferAmount = 250n * 10n ** 18n;

    await viem.assertions.emitWithArgs(
      token.write.transfer([recipient.account.address, transferAmount]),
      token,
      "Transfer",
      [owner.account.address, recipient.account.address, transferAmount],
    );

    assert.equal(await token.read.balanceOf([recipient.account.address]), transferAmount);
    assert.equal(
      await token.read.balanceOf([owner.account.address]),
      initialSupply - transferAmount,
    );
    assert.equal(await token.read.totalSupply(), initialSupply);
  });

  it("supports approvals and delegated transfers", async function () {
    const token = await viem.deployContract("MyToken");
    const transferAmount = 50n * 10n ** 18n;

    await token.write.approve([spender.account.address, transferAmount]);
    await token.write.transferFrom(
      [owner.account.address, recipient.account.address, transferAmount],
      { account: spender.account },
    );

    assert.equal(await token.read.balanceOf([recipient.account.address]), transferAmount);
    assert.equal(await token.read.allowance([owner.account.address, spender.account.address]), 0n);
  });
});
