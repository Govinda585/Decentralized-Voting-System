const { ethers } = require("hardhat");

async function main() {
  const name = "Solana";
  const symbol = "SOL";
  const totalSupply = 1000000;

  // Get the contract factory
  const ERC20 = await ethers.getContractFactory("ERC20");

  // Deploy the contract with parameters for constructor
  const eRC20 = await ERC20.deploy(name, symbol, totalSupply);

  // Wait for the contract to be deployed
  const deployedAddress = await eRC20.waitForDeployment();

  // Output the deployed contract's address
  console.log("Deployed Address:", deployedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
