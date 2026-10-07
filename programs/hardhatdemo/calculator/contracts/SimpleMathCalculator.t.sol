// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

import {SimpleMathCalculator} from "./SimpleMathCalculator.sol";
import {Test} from "forge-std/Test.sol";
import {console} from "hardhat/console.sol";

contract SimpleMathCalculatorTest is Test {
  SimpleMathCalculator private calculator;

  function setUp() public {
    calculator = new SimpleMathCalculator();
  }

  function test_AddStoresResult() public {
    uint256 result = calculator.add(7, 5);

    console.log("Addition result:", result);
    assertEq(result, 12);
    assertEq(calculator.lastAddResult(), result);
  }

  function test_MultiplyStoresResult() public {
    uint256 result = calculator.multiply(7, 5);

    console.log("Multiplication result:", result);
    assertEq(result, 35);
    assertEq(calculator.lastMultiplyResult(), result);
  }

  function test_ResultsAreStoredIndependently() public {
    uint256 additionResult = calculator.add(7, 5);
    uint256 multiplicationResult = calculator.multiply(7, 5);

    console.log("Addition result:", additionResult);
    console.log("Multiplication result:", multiplicationResult);
    assertEq(calculator.lastAddResult(), additionResult);
    assertEq(calculator.lastMultiplyResult(), multiplicationResult);
  }
}
