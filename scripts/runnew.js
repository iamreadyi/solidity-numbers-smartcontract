const main = async () => {
  const [owner, player1, player2, player3] = await hre.ethers.getSigners();

  TokenCon = await ethers.getContractFactory("KemalToken");
  token = await TokenCon.deploy();

  const numbersContractFactory = await hre.ethers.getContractFactory(
    "NumbersT"
  );
  const numbersContract = await numbersContractFactory.deploy(token.address);
  await numbersContract.deployed();

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

  brainTxn = await numbersContract.connect(player2).buyTicket(2);
  await brainTxn.wait();

  brainTxn = await numbersContract.connect(player3).buyTicket(4);
  await brainTxn.wait();

  brainTxn = await numbersContract.connect(player2).buyTicket(3);
  await brainTxn.wait();

  brainTxn = await numbersContract.connect(player2).getPlayerAddresses();
  console.log(brainTxn);
  brainTxn = await numbersContract.connect(player2).getNumPlayers();
  console.log(brainTxn);
  brainTxn = await numbersContract.connect(player2).numsAndAddresses();
  console.log(brainTxn);
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
