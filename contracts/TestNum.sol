//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";


import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";



contract NumberTest {
    

    uint256 public s_randomRange = 11;
    uint64 s_subscriptionId;


    address public owner;
    IERC20 Token;
    uint smallestDifference = 100;
    uint ticketCount = 0;
    uint fee;
    uint ticketPrice = 2 * 10 ** 18; //KT

    constructor(uint64 subscriptionId, address _KTaddress) { 
        owner = msg.sender;
        s_subscriptionId = subscriptionId;
        Token = IERC20(_KTaddress);
    }

    struct Player {

        uint[] numbers;
        uint[] diffs;
        bool isExist;
    }

    mapping (address => Player) players;

    address[] playerAddresses;

    address payable[] winners;

    function getOwner() view public {
        console.log("%s Contract deployed by", owner);
        
    }

    function getVar() public view returns(address[] memory){
        return playerAddresses;
    }

    function getAddressNums(address adresim) public view returns(uint[4] memory){
       
        uint[4] memory playerNumbers ;

        for(uint i = 0; i < players[adresim].numbers.length; i++){
            playerNumbers[i] = players[adresim].numbers[i];
        }

        return playerNumbers;
        
    }

    function getAddressDiffs(address adresim) public view returns(uint[4] memory){
        
        uint[4] memory playerDiffs ;

        for(uint i = 0; i < players[adresim].diffs.length; i++){
            playerDiffs[i] = players[adresim].diffs[i];
        }

        return playerDiffs;
        
    }
    
    receive() external payable { 

    }
    
    //ticket price kadar approvelamalı buyTicket'ı çağıran kişi ki transferfrom gerçekleşsin
    function buyTicket(uint number) public {

        require(number <= 100 && 1 <= number, "Only numbers between 1 and 100 is acceptable");
        require(Token.balanceOf(msg.sender) >= ticketPrice, "Not enough KT to buy a ticket");
        require(Token.transferFrom(msg.sender, address(this), ticketPrice), "Token transfer to numbers failed.");
        

        if(players[msg.sender].isExist){

            players[msg.sender].numbers.push(number); 
        
        }

        else{

            players[msg.sender].numbers.push(number);
            players[msg.sender].isExist = true;
            playerAddresses.push(msg.sender);

        }

        ticketCount++;

        if(ticketCount == 5){

            chooseWinners();
        }

    }

    function chooseWinners() public {

        fee = Token.balanceOf(address(this)) / 5;
        require(Token.transfer(owner, fee), "Fee transfer failed");

        for(uint i = 0; i < playerAddresses.length; i++){

            for(uint j = 0; j < players[playerAddresses[i]].numbers.length; j++){

                if(players[playerAddresses[i]].numbers[j] > s_randomRange){
                    
                    players[playerAddresses[i]].diffs.push(players[playerAddresses[i]].numbers[j] - s_randomRange);
                }
            
                else{

                    players[playerAddresses[i]].diffs.push(s_randomRange - players[playerAddresses[i]].numbers[j]);
                }
            }
        }

        for(uint i = 0; i < playerAddresses.length; i++){

            for(uint j = 0; j < players[playerAddresses[i]].diffs.length; j++){
                
                if(players[playerAddresses[i]].diffs[j] < smallestDifference){
                    
                    smallestDifference = players[playerAddresses[i]].diffs[j];
                }
            
            }
        }

        for(uint i = 0; i < playerAddresses.length; i++){

            for(uint j = 0; j < players[playerAddresses[i]].diffs.length; j++){
                
                if(players[playerAddresses[i]].diffs[j] == smallestDifference){
                    
                    
                    winners.push(payable(playerAddresses[i]));
                    
                } 
            
            }
        }
        console.log(winners.length);
        
        uint prize = Token.balanceOf(address(this)) / winners.length;

        console.log(prize);

        for(uint i = 0; i < winners.length; i++){

            require(Token.transfer(winners[i], prize), "Prize transfer failed");

        }

        for(uint i = 0; i < playerAddresses.length; i++){
            delete players[playerAddresses[i]];
        }
        
        delete winners;
        delete playerAddresses;
        delete ticketCount;
        smallestDifference = 100;
        
        //address x = winners[1];
        //console.log(winners.length);
        //console.log(playerAddresses.length);
        //console.log(x);
    }
}