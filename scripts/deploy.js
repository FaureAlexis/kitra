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
  
  // Check network details
  const network = await deployer.provider.getNetwork();
  console.log("Network:", network.name || 'unknown', "Chain ID:", network.chainId.toString());
  
  // Get current gas price but cap it at reasonable level
  const feeData = await deployer.provider.getFeeData();
  const networkGasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
  
  console.log("Network gas price:", ethers.formatUnits(networkGasPrice, 'gwei'), "Gwei");
  
  // Cap gas price at reasonable level (don't multiply crazy high prices)
  const maxReasonableGasPrice = ethers.parseUnits('100', 'gwei');
  const safeGasPrice = networkGasPrice > maxReasonableGasPrice ? maxReasonableGasPrice : networkGasPrice;
  
  console.log("Using safe gas price:", ethers.formatUnits(safeGasPrice, 'gwei'), "Gwei");
  
  // Deploy DesignCandidate NFT contract
  console.log("\nDeploying DesignCandidate contract...");
  console.log("⏳ This may take 30-60 seconds...");
  
  const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
  
  // Deploy with safe gas settings
  const designCandidate = await DesignCandidate.deploy(
    deployer.address,
    {
      gasLimit: 3000000,
      gasPrice: safeGasPrice, // Use safe gas price (no multiplication)
    }
  );
  
  console.log("📋 Transaction hash:", designCandidate.deploymentTransaction().hash);
  console.log("⏳ Waiting for deployment confirmation...");
  
  // Wait for deployment with timeout
  const deploymentPromise = designCandidate.waitForDeployment();
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Deployment timeout after 2 minutes")), 120000)
  );
  
  await Promise.race([deploymentPromise, timeoutPromise]);
  
  const designCandidateAddress = await designCandidate.getAddress();
  console.log("✅ DesignCandidate deployed to:", designCandidateAddress);
  
  // For testing, we'll use the deployer address as the voting token
  // In production, this should be a proper ERC20Votes token
  const mockTokenAddress = deployer.address;
  
  // Deploy Governor contract  
  console.log("\nDeploying KitraGovernor contract...");
  console.log("⏳ This may take 30-60 seconds...");
  
  const KitraGovernor = await ethers.getContractFactory("KitraGovernor");
  const governor = await KitraGovernor.deploy(
    mockTokenAddress, // IVotes token - using deployer for testing
    designCandidateAddress,
    {
      gasLimit: 4000000,
      gasPrice: safeGasPrice, // Use safe gas price (no multiplication)
    }
  );
  
  console.log("📋 Transaction hash:", governor.deploymentTransaction().hash);
  console.log("⏳ Waiting for deployment confirmation...");
  
  // Wait for deployment with timeout
  const governorDeploymentPromise = governor.waitForDeployment();
  const governorTimeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Governor deployment timeout after 2 minutes")), 120000)
  );
  
  await Promise.race([governorDeploymentPromise, governorTimeoutPromise]);
  
  const governorAddress = await governor.getAddress();
  console.log("✅ KitraGovernor deployed to:", governorAddress);
  
  // Set up contract permissions
  console.log("\nSetting up contract permissions...");
  console.log("⏳ Transferring ownership...");
  
  // Transfer ownership of DesignCandidate to Governor
  const transferTx = await designCandidate.transferOwnership(governorAddress, {
    gasLimit: 100000,
    gasPrice: safeGasPrice,
  });
  
  console.log("📋 Transfer transaction hash:", transferTx.hash);
  await transferTx.wait();
  console.log("✅ DesignCandidate ownership transferred to Governor");
  
  // Output deployment summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network: Chiliz Spicy Testnet");
  console.log("Deployer:", deployer.address);
  console.log("DesignCandidate:", designCandidateAddress);
  console.log("KitraGovernor:", governorAddress);
  console.log("Block number:", await deployer.provider.getBlockNumber());
  
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
  
  console.log("\n✅ Deployment completed successfully!");
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
    console.error("💥 Deployment failed:", error);
    
    // More helpful error messages
    if (error.message.includes("timeout")) {
      console.log("\n🚨 Deployment timed out. This can happen due to:");
      console.log("- Network congestion");
      console.log("- Low gas price");
      console.log("- RPC endpoint issues");
      console.log("\n🔧 Try:");
      console.log("1. Wait a few minutes and try again");
      console.log("2. Check https://spicy-rpc.chiliz.com for network status");
      console.log("3. Increase gas price in hardhat.config.cjs");
    }
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💰 Insufficient funds. You need CHZ tokens for gas fees.");
      console.log("Get testnet CHZ from: https://spicy-faucet.chiliz.com/");
    }
    
    process.exit(1);
  }); 