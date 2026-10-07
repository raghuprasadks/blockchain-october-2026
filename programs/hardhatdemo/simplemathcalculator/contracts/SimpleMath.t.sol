// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

import {SimpleMath} from "./SimpleMath.sol";
import {Test} from "forge-std/Test.sol";

contract SimpleMathTest is Test {
  SimpleMath simpleMath;

  function setUp() public {
    simpleMath = new SimpleMath();
  }

  function test_AddStoresResult() public {
    int256 calculated = simpleMath.add(5, 3);

    assertEq(calculated, 8);
    assertEq(simpleMath.result(), 8);
  }

  function test_SubtractStoresResult() public {
    int256 calculated = simpleMath.subtract(5, 8);

    assertEq(calculated, -3);
    assertEq(simpleMath.result(), -3);
  }

  function test_MultiplyStoresResult() public {
    int256 calculated = simpleMath.multiply(5, 3);

    assertEq(calculated, 15);
    assertEq(simpleMath.result(), 15);
  }

  function test_DivideStoresResult() public {
    int256 calculated = simpleMath.divide(15, 3);

    assertEq(calculated, 5);
    assertEq(simpleMath.result(), 5);
  }
}
