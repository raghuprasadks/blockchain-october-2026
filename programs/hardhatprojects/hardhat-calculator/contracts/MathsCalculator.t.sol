// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

import {MathsCalculator} from "./MathsCalculator.sol";
import {Test} from "forge-std/Test.sol";
import {console} from "hardhat/console.sol";

contract MathsCalculatorTest is Test {
  MathsCalculator calculator;

  function setUp() public {
    calculator = new MathsCalculator();
  }

  function test_Add() public view {
    uint256 result = calculator.add(2, 3);
    console.log("add(2, 3) =", result);
    assertEq(result, 5);
  }

  function test_Subtract() public view {
    uint256 result = calculator.subtract(8, 3);
    console.log("subtract(8, 3) =", result);
    assertEq(result, 5);
  }

  function test_SubtractRevertsWhenResultWouldBeNegative() public {
    vm.expectRevert("a must be >= b");
    calculator.subtract(3, 8);
  }

  function test_Multiply() public view {
    uint256 result = calculator.multiply(4, 3);
    console.log("multiply(4, 3) =", result);
    assertEq(result, 12);
  }

  function test_Divide() public view {
    uint256 result = calculator.divide(12, 3);
    console.log("divide(12, 3) =", result);
    assertEq(result, 4);
  }

  function test_DivideRevertsWhenDivisorIsZero() public {
    vm.expectRevert("Cannot divide by zero");
    calculator.divide(12, 0);
  }
}
