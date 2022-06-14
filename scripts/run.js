const main = async () => {
  const [owner, player1, player2, player3] = await hre.ethers.getSigners();

  TokenCon = await ethers.getContractFactory("KemalToken");
  token = await TokenCon.deploy();

  const numbersContractFactory = await hre.ethers.getContractFactory("NumberT");
  const numbersContract = await numbersContractFactory.deploy(
    5271,
    token.address
  );
  await numbersContract.deployed();
  console.log("Contract deployed to:", numbersContract.address);
  console.log("Contract deployed by:", owner.address);
  ExCon = await ethers.getContractFactory("MyExchange");
  ex = await ExCon.deploy(token.address);

  await token.transfer(ex.address, hre.ethers.utils.parseEther("500"));

  contractBalance = await token.balanceOf(owner.address);
  console.log(
    "Owners balance =>",
    hre.ethers.utils.formatEther(contractBalance)
  );

  console.log("player1:", player1.address);
  console.log("player2:", player2.address);
  console.log("player3:", player3.address);

  contractBalance = await token.balanceOf(numbersContract.address);
  console.log(
    "Contract balance when i first deployed:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  await ex
    .connect(player1)
    .buyToken({ value: ethers.utils.parseEther("0.08") });
  await token
    .connect(player1)
    .approve(numbersContract.address, ethers.utils.parseEther("8"));
  await ex
    .connect(player2)
    .buyToken({ value: ethers.utils.parseEther("0.08") });
  await token
    .connect(player2)
    .approve(numbersContract.address, ethers.utils.parseEther("8"));
  await ex
    .connect(player3)
    .buyToken({ value: ethers.utils.parseEther("0.08") });
  await token
    .connect(player3)
    .approve(numbersContract.address, ethers.utils.parseEther("8"));

  let brainTxn = await numbersContract.connect(player1).buyTicket(1);
  await brainTxn.wait();
  //brainTxn = await numbersContract.connect(player1).buyTicket(6);
  //await brainTxn.wait();
  //brainTxn = await numbersContract.connect(player1).buyTicket(10);
  //await brainTxn.wait();
  brainTxn = await numbersContract.connect(player1).buyTicket(2);
  await brainTxn.wait();
  brainTxn = await numbersContract
    .connect(owner)
    .getAddressNums(player1.address);

  console.log("Player 1, 4 KT yolladı");

  console.log("Player1 numbers => 3,10 olmalı", brainTxn);

  contractBalance = await token.balanceOf(player1.address);
  console.log(
    "Player 1, 2 bilet aldıktan sonraki balance 4 olcak:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  contractBalance = await token.balanceOf(numbersContract.address);
  console.log(
    "Contract balance:4 olmalı => ",
    hre.ethers.utils.formatEther(contractBalance)
  );

  //brainTxn = await numbersContract.connect(player2).buyTicket(4);
  //await brainTxn.wait();
  brainTxn = await numbersContract.connect(player2).buyTicket(3);
  await brainTxn.wait();
  brainTxn = await numbersContract.connect(player2).buyTicket(4);
  await brainTxn.wait();
  brainTxn = await numbersContract
    .connect(owner)
    .getAddressNums(player2.address);

  console.log("Player 2, 4 KT yolladı");

  console.log("Player2 numbers => 6,10 olmalı", brainTxn);

  contractBalance = await token.balanceOf(owner.address);
  console.log(
    "Owners balance son bilet alınmadan önce",
    hre.ethers.utils.formatEther(contractBalance)
  );

  contractBalance = await token.balanceOf(numbersContract.address);
  console.log(
    "Contract balance:8 olmalı => ",
    hre.ethers.utils.formatEther(contractBalance)
  );

  brainTxn = await numbersContract.connect(player3).buyTicket(5);
  await brainTxn.wait();
  console.log("Player 3, 5 girdi 2KT yolladı");
  //brainTxn = await numbersContract.connect(player3).buyTicket(6);
  //await brainTxn.wait();

  contractBalance = await token.balanceOf(owner.address);
  console.log(
    "Owners balance =>2",
    hre.ethers.utils.formatEther(contractBalance)
  );

  /*contractBalance = await hre.ethers.provider.getBalance(
      numbersContract.address
    );
      console.log(
        "Contract balance:9 olmalı, son bilet alınmadan önceki durum budur =>",
        hre.ethers.utils.formatEther(contractBalance)
    );

    brainTxn = await numbersContract.connect(player3).buyTicket(10, { value: ethers.utils.parseEther("0.0025") });
    await brainTxn.wait();*/
  brainTxn = await numbersContract
    .connect(owner)
    .getAddressNums(player3.address);

  console.log("Player3 numbers => 5 olmalı", brainTxn);

  contractBalance = await token.balanceOf(numbersContract.address);
  console.log(
    "Contract balance:0 olmalı, 5 bilet alındı, ödül dağıtımı başlar, fee alınır =>",
    hre.ethers.utils.formatEther(contractBalance)
  );

  brainTxn = await numbersContract
    .connect(owner)
    .getAddressDiffs(player1.address);

  console.log("Player1 diffs => 8,1 olmalı", brainTxn);

  brainTxn = await numbersContract
    .connect(owner)
    .getAddressDiffs(player2.address);

  console.log("Player2 diffs => 5,1 olmalı", brainTxn);

  brainTxn = await numbersContract
    .connect(owner)
    .getAddressDiffs(player3.address);

  console.log("Player3 diffs => 6 olmalı", brainTxn);

  contractBalance = await token.balanceOf(player1.address);
  console.log(
    "Player 1, chooseWinners sonrası balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  contractBalance = await token.balanceOf(player2.address);
  console.log(
    "Player 2, chooseWinners sonrası balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  contractBalance = await token.balanceOf(player3.address);
  console.log(
    "Player 3, chooseWinners sonrası balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  contractBalance = await token.balanceOf(owner.address);
  console.log(
    "Owner, chooseWinners sonrası balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  await ex
    .connect(player1)
    .buyToken({ value: ethers.utils.parseEther("0.08") });
  await token
    .connect(player1)
    .approve(numbersContract.address, ethers.utils.parseEther("8"));
  await ex
    .connect(player2)
    .buyToken({ value: ethers.utils.parseEther("0.08") });
  await token
    .connect(player2)
    .approve(numbersContract.address, ethers.utils.parseEther("8"));
  await ex
    .connect(player3)
    .buyToken({ value: ethers.utils.parseEther("0.08") });
  await token
    .connect(player3)
    .approve(numbersContract.address, ethers.utils.parseEther("8"));
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
