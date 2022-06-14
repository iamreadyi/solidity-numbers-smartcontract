// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract KemalToken is ERC20 {

    address public owner;

    constructor() ERC20("Kemal", "KT"){
        _mint(msg.sender, 1000 * 10 ** decimals());
        owner = msg.sender;
    }

}