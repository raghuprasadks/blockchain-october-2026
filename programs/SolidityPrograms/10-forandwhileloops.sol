// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Loop {

    function loop() public pure returns (
        uint256 a,
        uint256 b,
        uint256 c,
        uint256 d
    ) {
        uint256 index = 0;

        for (uint256 i = 0; i < 10; i++) {

            if (i == 3) {
                continue;
            }

            if (i == 5) {
                break;
            }

            if (index == 0) a = i;
            if (index == 1) b = i;
            if (index == 2) c = i;
            if (index == 3) d = i;

            index++;
        }
    }

    function whileLoop() public pure returns (uint256) {

        uint256 j = 0;

        while (j < 10) {
            j++;
        }

        return j;
        }
}