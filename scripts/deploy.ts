import { ethers } from "hardhat";
import { DesignCandidate, KitraGovernor } from "../typechain-types";

async function main() {
  console.log("Starting deployment to Chiliz Spicy testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CHZ");
  
  // Deploy DesignCandidate NFT contract
  console.log("\nDeploying DesignCandidate contract...");
  const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
  const designCandidate = await DesignCandidate.deploy(deployer.address);
  await designCandidate.waitForDeployment();
  
  const designCandidateAddress = await designCandidate.getAddress();
  console.log("DesignCandidate deployed to:", designCandidateAddress);
  
  // TODO: Deploy governance token contract
  // For now, we'll use a mock token address
  const mockTokenAddress = "0x0000000000000000000000000000000000000000";
  
  // TODO: Deploy timelock controller
  // For now, we'll use the deployer as the timelock
  const timelockAddress = deployer.address;
  
  // Deploy Governor contract
  console.log("\nDeploying KitraGovernor contract...");
  const KitraGovernor = await ethers.getContractFactory("KitraGovernor");
  const governor = await KitraGovernor.deploy(
    mockTokenAddress,
    timelockAddress,
    designCandidateAddress
  );
  await governor.waitForDeployment();
  
  const governorAddress = await governor.getAddress();
  console.log("KitraGovernor deployed to:", governorAddress);
  
  // Set up contract permissions
  console.log("\nSetting up contract permissions...");
  
  // Transfer ownership of DesignCandidate to Governor
  const transferTx = await designCandidate.transferOwnership(governorAddress);
  await transferTx.wait();
  console.log("DesignCandidate ownership transferred to Governor");
  
  // Output deployment summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network: Chiliz Spicy Testnet");
  console.log("Deployer:", deployer.address);
  console.log("DesignCandidate:", designCandidateAddress);
  console.log("KitraGovernor:", governorAddress);
  console.log("Gas Used: TODO - calculate gas usage");
  
  // Save deployment addresses
  const deploymentInfo = {
    network: "spicy",
    deployer: deployer.address,
    contracts: {
      DesignCandidate: designCandidateAddress,
      KitraGovernor: governorAddress,
    },
    timestamp: new Date().toISOString(),
  };
  
  console.log("\nDeployment info:", JSON.stringify(deploymentInfo, null, 2));
  
  // TODO: Save to file
  // fs.writeFileSync(`deployments/${network}.json`, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\nDeployment completed successfully!");
  console.log("Don't forget to verify the contracts using:");
  console.log(`npm run blockchain:verify -- --network spicy ${designCandidateAddress}`);
  console.log(`npm run blockchain:verify -- --network spicy ${governorAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  }); 