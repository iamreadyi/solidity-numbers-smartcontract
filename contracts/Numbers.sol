//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";


import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";



contract Numbers is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;

    uint64 s_subscriptionId;
    address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;
    bytes32 keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
    uint32 callbackGasLimit = 1000000;
    uint16 requestConfirmations = 3;
    uint32 numWords =  1;

    uint256 public s_requestId;


    address public owner;
    IERC20 Token;
    uint smallestDifference = 100;
    uint ticketCount = 0;
    //uint fee;
    uint ticketPrice = 2 * 10 ** 18; //KT
    uint gameCount = 0;

    constructor(uint64 subscriptionId, address _KTaddress) VRFConsumerBaseV2(vrfCoordinator) { 
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        owner = msg.sender;
        s_subscriptionId = subscriptionId;
        Token = IERC20(_KTaddress);
    }

    event NewPlayer(address from, uint message);
    event RandomNumber(uint randomNum);

    struct Player {

        uint[] numbers;
        uint[] diffs;
        bool isExist;
    }

    mapping (address => Player) players;

    address[] playerAddresses;

    address payable[] winners;

    uint public randomNum;

    function requestRandomWords() public {
    // Will revert if subscription is not set and funded.
        s_requestId = COORDINATOR.requestRandomWords(
        keyHash,
        s_subscriptionId,
        requestConfirmations,
        callbackGasLimit,
        numWords
        );
    }
  
    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
        ) internal override {
        uint s_randomRange = (randomWords[0] % 100) + 1;
        randomNum = s_randomRange;
        uint fee = Token.balanceOf(address(this)) / 5;
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
        
        uint prize = Token.balanceOf(address(this)) / winners.length;

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
        emit RandomNumber(s_randomRange);
    }
    
    receive() external payable { 

    }

    function numsAndAddresses() public view returns(uint[25] memory, address[5] memory){
        uint[25] memory playerNumbers ;
        uint[5] memory numbers ;
        address[5] memory addresses;
        uint z = 0;


        for(uint i = 0; i < playerAddresses.length; i++){
            
            numbers = getAddressNums(playerAddresses[i]);
            addresses[i] = playerAddresses[i];

             for(uint j = 0; j < numbers.length; j++){
                playerNumbers[z] = numbers[j];
                z++;
             }
        }
        return (playerNumbers,addresses);
        
    }

    function getAddressNums(address adresim) public view returns(uint[5] memory){
       
        uint[5] memory playerNumbers ;

        for(uint i = 0; i < players[adresim].numbers.length; i++){
            playerNumbers[i] = players[adresim].numbers[i];
        }

        return playerNumbers;
        
    }
    
    function getNumPlayers() public view returns(uint){
        return playerAddresses.length;
    }

    function getTicketCount() public view returns(uint){
        return ticketCount;
    }

    function getRandomNum() public view returns(uint){
        return randomNum;
    }


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

        emit NewPlayer(msg.sender, number);

        if(ticketCount == 5){

            requestRandomWords();

        }

    }

    /*function chooseWinners() public {

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
        
        uint prize = Token.balanceOf(address(this)) / winners.length;

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

    }*/
}

 