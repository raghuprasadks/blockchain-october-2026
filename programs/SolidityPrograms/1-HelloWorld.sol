// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12 <0.9.0;

contract HelloWorld {
  function print() public pure returns (string memory) {
    return "Hello World!";
  }
}

//Pure means the function doesn't read or modify blockchain state.
//memory means the string is temporarily stored in memory while the function executes.