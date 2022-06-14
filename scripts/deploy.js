const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account balance: ", accountBalance.toString());

  const brainContractFactory = await hre.ethers.getContractFactory("Numbers");
  const brainContract = await brainContractFactory.deploy(
    5271,
    "0x67B784Bd5C986686A1fD78a2ffF192866D61C6ee"
  );
  await brainContract.deployed();

  console.log("Ex address: ", brainContract.address);
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
