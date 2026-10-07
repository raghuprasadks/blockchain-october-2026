// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EKaushalya is ERC20 {
  uint256 public constant INITIAL_SUPPLY = 10_000 * 10 ** 18;

  constructor() ERC20("eKaushalya", "EKA") {
    _mint(msg.sender, INITIAL_SUPPLY);
  }
}
