import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("MathsCalculator", async function () {
  const { viem } = await network.create();

  it("calculates basic operations", async function () {
    const calculator = await viem.deployContract("MathsCalculator");

    const sum = await calculator.read.add([2n, 3n]);
    const difference = await calculator.read.subtract([8n, 3n]);
    const product = await calculator.read.multiply([4n, 3n]);
    const quotient = await calculator.read.divide([12n, 3n]);

    console.log(`add(2, 3) = ${sum}`);
    console.log(`subtract(8, 3) = ${difference}`);
    console.log(`multiply(4, 3) = ${product}`);
    console.log(`divide(12, 3) = ${quotient}`);

    assert.equal(sum, 5n);
    assert.equal(difference, 5n);
    assert.equal(product, 12n);
    assert.equal(quotient, 4n);
  });
});