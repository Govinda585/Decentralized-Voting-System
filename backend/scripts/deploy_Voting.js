const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(10, process.env.CONTRACT_ADDRESS_TOKEN);
  const address = await voting.waitForDeployment();
  console.log("Deployed address: ", address);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
