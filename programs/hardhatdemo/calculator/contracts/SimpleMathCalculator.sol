// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

contract SimpleMathCalculator {
  uint256 public lastAddResult;
  uint256 public lastMultiplyResult;

  function add(uint256 a, uint256 b) public returns (uint256) {
    lastAddResult = a + b;
    return lastAddResult;
  }

  function multiply(uint256 a, uint256 b) public returns (uint256) {
    lastMultiplyResult = a * b;
    return lastMultiplyResult;
  }
}
