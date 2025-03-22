const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const JournalStorage = await hre.ethers.getContractFactory("JournalStorage");
  
  console.log("Deploying JournalStorage contract...");
  
  // Deploy the contract
  const journalStorage = await JournalStorage.deploy(); 

  // Wait for the contract to be mined
  await journalStorage.waitForDeployment(); // Fix: Replace `.deployed()` with `.waitForDeployment()`

  // Get the contract address
  const contractAddress = await journalStorage.getAddress();

  console.log(`JournalStorage deployed to: ${contractAddress}`);
}

// Execute the deployment function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
