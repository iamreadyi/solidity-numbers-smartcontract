// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract MyExchange {

    //exchange contractıma token creator olarak bir miktar token göndereceğim 

    address KTaddress;
    IERC20 Token;
    uint rate = 10 ** 2;
    address payable public owner;

    event Bought(uint256 amount);
    event Sold(uint256 amount);

    //Thus, to approve my contract to spend token for some tokens' holder, the msg.sender in the approve function of ERC20 should be the token holder, hence the token holder should call the function directly on the client side without passing through a contract because the contract can't impersonate that user.

    constructor(address _KTaddress){

        Token = IERC20(_KTaddress);
        KTaddress = _KTaddress;
        owner = payable(msg.sender);
    }

    //bu fonksiyon frontendden gönderdiğim etheri rate'e göre KT'ye çevirip o KT'yi de callera yolluyor
    function buyToken() external payable {
        //1 token == 0.01 ether
        uint amountToBuy = msg.value * rate;
        require(amountToBuy > 0, "You need to send some ether.");
        require(Token.transfer(msg.sender, amountToBuy), "Token transfer failed.");

        emit Bought(amountToBuy);
    }

    //function caller contractı satmak istediği token miktarınca approvelamalı frontendden
    function sellToken(uint amountToSell) external {

        require(amountToSell > 0, "You need to sell at least some tokens.");
        uint etherAmount = amountToSell / rate;
        require(Token.transferFrom(msg.sender, address(this), amountToSell), "Token transfer failed.");

        (bool s, ) = payable(msg.sender).call{value:etherAmount}("");
        require(s, "Can't send ether to token seller address.");

        emit Sold(amountToSell);
    }

    function withdrawEtherBalance() external {
        require(msg.sender == owner, "Only owner can withdraw balance.");
        (bool s, ) = owner.call{value:address(this).balance}("");
        require(s, "Can't send ethers to owner address.");
    }

    function withdrawTokenBalance() external {
        require(msg.sender == owner, "Only owner can withdraw balance.");
        require(Token.transfer(msg.sender, Token.balanceOf(address(this))), "Can't send tokens to owner address.");
    }
}