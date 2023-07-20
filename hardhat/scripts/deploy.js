// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const nftContract = await hre.ethers.deployContract("CryptoDevsNFT");
  await nftContract.waitForDeployment();
  console.log("CryptoDevsNFT deployed to: ", nftContract.target);

  const fakeNftMarketplaceContract = await hre.ethers.deployContract(
    "FakeNFTMarketplace"
  );
  await fakeNftMarketplaceContract.waitForDeployment();
  console.log(
    "FakeNFTMarketplace deployed to:",
    fakeNftMarketplaceContract.target
  );
  // Deploy the DAO Contract
  const amount = hre.ethers.parseEther("0.01"); // You can change this value from 1 ETH to something else
  const daoContract = hre.ethers.deployContract(
    "CryptoDevsDAO",
    [fakeNftMarketplaceContract.target, nftContract.target],
    { value: amount }
  );
  (await daoContract).waitForDeployment;

  console.log("CryptoDevsDAO deployed to:", daoContract.target);

  await sleep(30 * 1000);

  await hre.run("verify:verify", {
    address: nftContract.target,
    constructorArguments: [],
  });

  await hre.run("verify:verify", {
    address: fakeNftMarketplaceContract.target,
    constructorArguments: [],
  });

  await hre.run("verify:verify", {
    address: (await daoContract).target,
    constructorArguments: [
      fakeNftMarketplaceContract.target,
      nftContract.target,
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
