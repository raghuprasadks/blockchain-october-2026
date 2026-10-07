// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

import {Counter} from "./Counter.sol";
import {Test} from "forge-std/Test.sol";

contract CounterTest is Test {
  Counter private counter;

  event Increment(uint by);

  function setUp() public {
    counter = new Counter();
  }

  function test_InitialValueIsZero() public view {
    assertEq(counter.x(), 0);
  }

  function test_IncIncrementsByOneAndEmitsEvent() public {
    vm.expectEmit(false, false, false, true, address(counter));
    emit Increment(1);

    counter.inc();

    assertEq(counter.x(), 1);
  }

  function test_IncByIncrementsByAmountAndEmitsEvent() public {
    vm.expectEmit(false, false, false, true, address(counter));
    emit Increment(7);

    counter.incBy(7);

    assertEq(counter.x(), 7);
  }

  function test_IncByZeroReverts() public {
    vm.expectRevert(
      abi.encodeWithSignature(
        "Error(string)", "incBy: increment should be positive"
      )
    );

    counter.incBy(0);
  }

  function testFuzz_IncBy(uint256 amount) public {
    vm.assume(amount > 0);

    counter.incBy(amount);

    assertEq(counter.x(), amount);
  }
}
