const { expect } = require("chai");
const { ethers } = require("hardhat");

//devirli sayılar devreye girince olmayan bi gwei mi yaratılıyor ya da veri kaybı mı yaşanıyor?


describe("Numbers contract", function () {
  let owner, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11, user12, user13, 
  user14, user15, user16, user17, user18, user19, user20;

  let NumbersCon, ExCon, TokenCon, numbers, ex, token;

  before(async function () {
    NumbersCon = await ethers.getContractFactory("NumbersT");
    ExCon = await ethers.getContractFactory("MyExchange");
    TokenCon = await ethers.getContractFactory("KemalToken");

    [owner, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11, user12, user13, 
    user14, user15, user16, user17, user18, user19, user20] = await ethers.getSigners();

    token = await TokenCon.deploy();
    numbers = await NumbersCon.deploy(token.address);
    ex = await ExCon.deploy(token.address);
    
  });

  describe("Deployment", function () {

    it("Should set the right owner for all contracts", async function () {
      
      expect(await numbers.owner()).to.equal(owner.address);
      expect(await ex.owner()).to.equal(owner.address);
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Trade through exchange", function () {
    it("Exchange balance should be 500", async function () {
      //send token to exchange with owner
      await token.transfer(ex.address, hre.ethers.utils.parseEther("500"));
      const exBalance = await token.balanceOf(ex.address);
      expect(Number(hre.ethers.utils.formatEther(exBalance))).to.equal(500);
    });

    it("buyToken on ex should be successful", async function () {
      //send token to exchange with owner
      let txResp = await ex.connect(user1).buyToken({ value: ethers.utils.parseEther("0.02") });
      let txReceipt = await txResp.wait();

      let user1TokenBalance = await token.balanceOf(user1.address);
      let user1Balance = await ethers.provider.getBalance(user1.address);

      let gas = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);
      let balanceAfterGas = 5 - (Number(hre.ethers.utils.formatEther(gas)) + 0.02);

      console.log(Number(hre.ethers.utils.formatEther(gas)));

      expect(Number(hre.ethers.utils.formatEther(user1TokenBalance))).to.equal(2);
      expect(Number(hre.ethers.utils.formatEther(user1Balance))).to.equal(balanceAfterGas);

      //sell tokenı kullanmak içi exchange'e allowance vermeliyim ki benim yerime kendisie yollasın tokeni
      //karşılığında ether vermek için
      let tx = await token.connect(user1).approve(ex.address, ethers.utils.parseEther("2"));
      let Receipt = await tx.wait();

      let gas1 = Receipt.gasUsed.mul(Receipt.effectiveGasPrice);
      
      let txResp1 = await ex.connect(user1).sellToken(ethers.utils.parseEther("2"));
      let txReceipt1 = await txResp1.wait();

      let gas2 = txReceipt1.gasUsed.mul(txReceipt1.effectiveGasPrice);

      user1TokenBalance = await token.balanceOf(user1.address);
      user1Balance = await ethers.provider.getBalance(user1.address);
      
      let balanceAfterGas1 = 5 - (Number(hre.ethers.utils.formatEther(gas1)) + Number(hre.ethers.utils.formatEther(gas2)) + Number(hre.ethers.utils.formatEther(gas)));

      //console.log(Number(hre.ethers.utils.formatEther(balanceAfterGas1)));

      expect(Number(hre.ethers.utils.formatEther(user1TokenBalance))).to.equal(0);
      expect(Number(hre.ethers.utils.formatEther(user1Balance))).to.equal(balanceAfterGas1);
    });
  });

  describe("Games with various player numbers", function () {

    it("2 Players 1 Winner", async function () {

      await ex.connect(user1).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user2).buyToken({ value: ethers.utils.parseEther("0.06") });

      let player1TokenBalance = await token.balanceOf(user1.address);
      let player2TokenBalance = await token.balanceOf(user2.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(6);

      await token.connect(user1).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user2).approve(numbers.address, ethers.utils.parseEther("6"));

      await numbers.connect(user1).buyTicket(41);
      await numbers.connect(user1).buyTicket(81);

      player1TokenBalance = await token.balanceOf(user1.address);
      player2TokenBalance = await token.balanceOf(user2.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(2);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(6);
      
      await numbers.connect(user2).buyTicket(45);
      await numbers.connect(user2).buyTicket(71);
      await numbers.connect(user2).buyTicket(1);

      player1TokenBalance = await token.balanceOf(user1.address);
      player2TokenBalance = await token.balanceOf(user2.address);
      ownerTokenBalance = await token.balanceOf(owner.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(2);
      expect(Number(hre.ethers.utils.formatEther(ownerTokenBalance))).to.equal(502);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(8);
    });

    it("2 Players 2 Winners with new players", async function () {

      await ex.connect(user3).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user4).buyToken({ value: ethers.utils.parseEther("0.06") });

      let player1TokenBalance = await token.balanceOf(user3.address);
      let player2TokenBalance = await token.balanceOf(user4.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(6);

      await token.connect(user3).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user4).approve(numbers.address, ethers.utils.parseEther("6"));

      await numbers.connect(user3).buyTicket(3);
      await numbers.connect(user3).buyTicket(58);

      player1TokenBalance = await token.balanceOf(user3.address);
      player2TokenBalance = await token.balanceOf(user4.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(2);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(6);
      
      await numbers.connect(user4).buyTicket(30);
      await numbers.connect(user4).buyTicket(41);
      await numbers.connect(user4).buyTicket(19);

      player1TokenBalance = await token.balanceOf(user3.address);
      player2TokenBalance = await token.balanceOf(user4.address);
      ownerTokenBalance = await token.balanceOf(owner.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(ownerTokenBalance))).to.equal(504);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(4);
    });

    it("2 Players 1 Winner with same first two players u1 and u2", async function () {

      await ex.connect(user1).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user2).buyToken({ value: ethers.utils.parseEther("0.06") });

      let player1TokenBalance = await token.balanceOf(user1.address);
      let player2TokenBalance = await token.balanceOf(user2.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(8);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(14);

      await token.connect(user1).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user2).approve(numbers.address, ethers.utils.parseEther("6"));

      await numbers.connect(user1).buyTicket(17);
      await numbers.connect(user1).buyTicket(51);

      player1TokenBalance = await token.balanceOf(user1.address);
      player2TokenBalance = await token.balanceOf(user2.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(4);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(14);
      
      await numbers.connect(user2).buyTicket(14);
      await numbers.connect(user2).buyTicket(91);//11 yapıp yeni test aç aynı sayıyı girmek
      await numbers.connect(user2).buyTicket(8);

      player1TokenBalance = await token.balanceOf(user1.address);
      player2TokenBalance = await token.balanceOf(user2.address);
      ownerTokenBalance = await token.balanceOf(owner.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(4);
      expect(Number(hre.ethers.utils.formatEther(ownerTokenBalance))).to.equal(506);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(16);
    });

    it("4 players 3 winners with new players", async function () {
      await ex.connect(user5).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user6).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user7).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user8).buyToken({ value: ethers.utils.parseEther("0.06") });


      let player1TokenBalance = await token.balanceOf(user5.address);
      let player2TokenBalance = await token.balanceOf(user6.address);
      let player3TokenBalance = await token.balanceOf(user7.address);
      let player4TokenBalance = await token.balanceOf(user8.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player3TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player4TokenBalance))).to.equal(6);

      await token.connect(user5).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user6).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user7).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user8).approve(numbers.address, ethers.utils.parseEther("6"));

      await numbers.connect(user5).buyTicket(4);
      await numbers.connect(user6).buyTicket(5);
      await numbers.connect(user7).buyTicket(5);
      await numbers.connect(user8).buyTicket(5);

      player1TokenBalance = await token.balanceOf(user5.address);
      player2TokenBalance = await token.balanceOf(user6.address);
      player3TokenBalance = await token.balanceOf(user7.address);
      player4TokenBalance = await token.balanceOf(user8.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(4);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(4);
      expect(Number(hre.ethers.utils.formatEther(player3TokenBalance))).to.equal(4);
      expect(Number(hre.ethers.utils.formatEther(player4TokenBalance))).to.equal(4);
      
      await numbers.connect(user6).buyTicket(5);
  
      player1TokenBalance = await token.balanceOf(user5.address);
      player2TokenBalance = await token.balanceOf(user6.address);
      player3TokenBalance = await token.balanceOf(user7.address);
      player4TokenBalance = await token.balanceOf(user8.address);
      ownerTokenBalance = await token.balanceOf(owner.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(4);
      expect(Number(hre.ethers.utils.formatEther(ownerTokenBalance))).to.equal(508);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player3TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player4TokenBalance))).to.equal(6);
    });

    it("5 players 5 winners with new players", async function () {
      await ex.connect(user9).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user10).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user11).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user12).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user13).buyToken({ value: ethers.utils.parseEther("0.06") });


      let player1TokenBalance = await token.balanceOf(user9.address);
      let player2TokenBalance = await token.balanceOf(user10.address);
      let player3TokenBalance = await token.balanceOf(user11.address);
      let player4TokenBalance = await token.balanceOf(user12.address);
      let player5TokenBalance = await token.balanceOf(user13.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player3TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player4TokenBalance))).to.equal(6);
      expect(Number(hre.ethers.utils.formatEther(player5TokenBalance))).to.equal(6);

      await token.connect(user9).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user10).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user11).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user12).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user13).approve(numbers.address, ethers.utils.parseEther("6"));


      await numbers.connect(user9).buyTicket(1);
      await numbers.connect(user10).buyTicket(2);
      await numbers.connect(user11).buyTicket(3);
      await numbers.connect(user12).buyTicket(4);
      await numbers.connect(user13).buyTicket(5);
  
      player1TokenBalance = await token.balanceOf(user9.address);
      player2TokenBalance = await token.balanceOf(user10.address);
      player3TokenBalance = await token.balanceOf(user11.address);
      player4TokenBalance = await token.balanceOf(user12.address);
      player5TokenBalance = await token.balanceOf(user13.address);
      ownerTokenBalance = await token.balanceOf(owner.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(4);
      expect(Number(hre.ethers.utils.formatEther(ownerTokenBalance))).to.equal(510);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(4);
      expect(Number(hre.ethers.utils.formatEther(player3TokenBalance))).to.equal(4);
      expect(Number(hre.ethers.utils.formatEther(player4TokenBalance))).to.equal(4);
      expect(Number(hre.ethers.utils.formatEther(player5TokenBalance))).to.equal(12);
    });

    it("5 players 5 winners with previous players", async function () {
      await ex.connect(user9).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user10).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user11).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user12).buyToken({ value: ethers.utils.parseEther("0.06") });
      await ex.connect(user13).buyToken({ value: ethers.utils.parseEther("0.06") });


      let player1TokenBalance = await token.balanceOf(user9.address);
      let player2TokenBalance = await token.balanceOf(user10.address);
      let player3TokenBalance = await token.balanceOf(user11.address);
      let player4TokenBalance = await token.balanceOf(user12.address);
      let player5TokenBalance = await token.balanceOf(user13.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(10);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(10);
      expect(Number(hre.ethers.utils.formatEther(player3TokenBalance))).to.equal(10);
      expect(Number(hre.ethers.utils.formatEther(player4TokenBalance))).to.equal(10);
      expect(Number(hre.ethers.utils.formatEther(player5TokenBalance))).to.equal(18);

      await token.connect(user9).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user10).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user11).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user12).approve(numbers.address, ethers.utils.parseEther("6"));
      await token.connect(user13).approve(numbers.address, ethers.utils.parseEther("6"));


      await numbers.connect(user9).buyTicket(21);
      await numbers.connect(user10).buyTicket(21);
      await numbers.connect(user11).buyTicket(21);
      await numbers.connect(user12).buyTicket(21);
      await numbers.connect(user13).buyTicket(21);
  
      player1TokenBalance = await token.balanceOf(user9.address);
      player2TokenBalance = await token.balanceOf(user10.address);
      player3TokenBalance = await token.balanceOf(user11.address);
      player4TokenBalance = await token.balanceOf(user12.address);
      player5TokenBalance = await token.balanceOf(user13.address);
      ownerTokenBalance = await token.balanceOf(owner.address);

      expect(Number(hre.ethers.utils.formatEther(player1TokenBalance))).to.equal(8 + 1.6);
      expect(Number(hre.ethers.utils.formatEther(ownerTokenBalance))).to.equal(512);
      expect(Number(hre.ethers.utils.formatEther(player2TokenBalance))).to.equal(8 + 1.6);
      expect(Number(hre.ethers.utils.formatEther(player3TokenBalance))).to.equal(8 + 1.6);
      expect(Number(hre.ethers.utils.formatEther(player4TokenBalance))).to.equal(8 + 1.6);
      expect(Number(hre.ethers.utils.formatEther(player5TokenBalance))).to.equal(16 + 1.6);
    });


    //devirli sayılar devreye girince olmayan bi gwei mi yaratılıyor ya da veri kaybı mı yaşanıyor?
    


  });

});
