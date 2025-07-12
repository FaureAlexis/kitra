require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment to Chiliz Spicy testnet...");
  
  // Check for required environment variables
  if (!process.env.BLOCKCHAIN_PRIVATE_KEY) {
    console.error("❌ Error: BLOCKCHAIN_PRIVATE_KEY environment variable is required!");
    console.log("\n📝 To fix this:");
    console.log("1. Create a .env file in the project root");
    console.log("2. Add your private key: BLOCKCHAIN_PRIVATE_KEY=your_private_key_here");
    console.log("3. Ensure your wallet has CHZ tokens for gas fees");
    console.log("\n⚠️  Warning: Never commit your private key to version control!");
    process.exit(1);
  }
  
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.error("❌ Error: No signers available. Check your private key configuration.");
    process.exit(1);
  }
  
  const [deployer] = signers;
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
  
  // For testing, we'll use the deployer address as the voting token
  // In production, this should be a proper ERC20Votes token
  const mockTokenAddress = deployer.address;
  
  // Deploy Governor contract  
  console.log("\nDeploying KitraGovernor contract...");
  const KitraGovernor = await ethers.getContractFactory("KitraGovernor");
  const governor = await KitraGovernor.deploy(
    mockTokenAddress, // IVotes token - using deployer for testing
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
  
  // Mint a test design for demonstration
  console.log("\nMinting test design...");
  try {
    // Note: This will fail because Governor is now the owner, but we'll try for demo
    const mintTx = await designCandidate.mintDesign(
      deployer.address,
      "Test Jersey Design",
      "ipfs://QmTestHash123456789"
    );
    await mintTx.wait();
    console.log("Test design minted successfully");
  } catch (error) {
    console.log("Expected error: Governor is now owner, minting must be done through governance");
  }
  
  // Output deployment summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network: Chiliz Spicy Testnet");
  console.log("Deployer:", deployer.address);
  console.log("DesignCandidate:", designCandidateAddress);
  console.log("KitraGovernor:", governorAddress);
  
  // Save deployment addresses
  const deploymentInfo = {
    network: "spicy",
    deployer: deployer.address,
    contracts: {
      DesignCandidate: designCandidateAddress,
      KitraGovernor: governorAddress,
    },
    blockNumber: await deployer.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };
  
  console.log("\nDeployment info:", JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\nDeployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Set environment variables in your .env file:");
  console.log(`   DESIGN_CANDIDATE_ADDRESS=${designCandidateAddress}`);
  console.log(`   GOVERNOR_ADDRESS=${governorAddress}`);
  console.log("2. Verify contracts (optional):");
  console.log(`   npx hardhat verify --network spicy ${designCandidateAddress} "${deployer.address}"`);
  console.log(`   npx hardhat verify --network spicy ${governorAddress} "${mockTokenAddress}" "${designCandidateAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  }); 