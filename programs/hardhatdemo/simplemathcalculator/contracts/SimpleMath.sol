// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

contract SimpleMath {
  int256 public result;

  function add(int256 a, int256 b) public returns (int256) {
    result = a + b;
    return result;
  }

  function subtract(int256 a, int256 b) public returns (int256) {
    result = a - b;
    return result;
  }
  /**
   * Create multiply and divide function.
   * Also write the test case
   */

  function multiply(int256 a, int256 b) public returns (int256) {
    result = a * b;
    return result;
  }

  function divide(int256 a, int256 b) public returns (int256) {
    result = a / b;
    return result;
  }
}
