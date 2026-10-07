import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("BCAResults", async function () {
  const { viem } = await network.create();

  it("records a result and exposes its fields", async function () {
    const results = await viem.deployContract("BCAResults");
    const [lecturer] = await viem.getWalletClients();

    await viem.assertions.emitWithArgs(
      results.write.recordResult(["Ananya Rao", "4NH23BC001", "Data Structures", 2, "Internal Test 1", 42n]),
      results,
      "ResultRecorded",
      [0n, "Ananya Rao", "4NH23BC001", "Data Structures", 2, "Internal Test 1", 42n, lecturer.account.address],
    );

    assert.equal(await results.read.resultCount(), 1n);
    const [studentName, usn, subject, semester, testName, marks, recordedBy, recordedAt] =
      await results.read.getResult([0n]);
    assert.equal(studentName, "Ananya Rao");
    assert.equal(usn, "4NH23BC001");
    assert.equal(subject, "Data Structures");
    assert.equal(semester, 2);
    assert.equal(testName, "Internal Test 1");
    assert.equal(marks, 42n);
    assert.equal(recordedBy.toLowerCase(), lecturer.account.address.toLowerCase());
    assert.ok(recordedAt > 0n);
  });

  it("rejects writes from accounts other than the deploying lecturer", async function () {
    const results = await viem.deployContract("BCAResults");
    const [, other] = await viem.getWalletClients();

    await viem.assertions.revertWith(
      results.write.recordResult(
        ["Ananya Rao", "4NH23BC001", "Data Structures", 2, "Internal Test 1", 42n],
        { account: other.account },
      ),
      "Only the lecturer can record results.",
    );
  });

  it("rejects invalid semesters and missing required fields", async function () {
    const results = await viem.deployContract("BCAResults");

    await viem.assertions.revertWith(
      results.write.recordResult(["Ananya Rao", "4NH23BC001", "Data Structures", 7, "Internal Test 1", 42n]),
      "Semester must be between 1 and 6.",
    );
    await viem.assertions.revertWith(
      results.write.recordResult(["", "4NH23BC001", "Data Structures", 2, "Internal Test 1", 42n]),
      "Student name is required.",
    );
  });

  it("rejects reads for results that do not exist", async function () {
    const results = await viem.deployContract("BCAResults");

    await viem.assertions.revertWith(results.read.getResult([0n]), "Result does not exist.");
  });
});
