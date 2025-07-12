require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔥 AGGRESSIVE DEPLOYMENT - Using competitive gas prices");
  console.log("=".repeat(60));
  
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider;
  
  console.log("Deployer:", deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "CHZ");
  
  // Check current network conditions
  const feeData = await provider.getFeeData();
  const networkGasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
  const networkNonce = await provider.getTransactionCount(deployer.address, "latest");
  const pendingNonce = await provider.getTransactionCount(deployer.address, "pending");
  
  console.log("Network gas price:", ethers.formatUnits(networkGasPrice, 'gwei'), "Gwei");
  console.log("Network nonce:", networkNonce);
  console.log("Pending nonce:", pendingNonce);
  console.log("Stuck transactions:", pendingNonce - networkNonce);
  
  // Use competitive gas price (60% of network price, still expensive but cheaper than full price)
  const competitiveGasPrice = (networkGasPrice * 60n) / 100n; // 60% of network price
  console.log("Using competitive gas price:", ethers.formatUnits(competitiveGasPrice, 'gwei'), "Gwei");
  
  // Calculate cost
  const gasEstimate = 1910579; // From diagnostic
  const deploymentCost = BigInt(gasEstimate) * competitiveGasPrice;
  console.log("Estimated deployment cost:", ethers.formatEther(deploymentCost), "CHZ");
  
  if (deploymentCost > balance) {
    console.error("❌ Insufficient balance for deployment!");
    console.log("Need:", ethers.formatEther(deploymentCost), "CHZ");
    console.log("Have:", ethers.formatEther(balance), "CHZ");
    process.exit(1);
  }
  
  // Deploy DesignCandidate with aggressive gas pricing
  console.log("\n🚀 Deploying DesignCandidate with competitive gas...");
  
  const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
  
  // Use explicit nonce to ensure we replace the pending transaction
  const deploymentTx = await DesignCandidate.deploy(
    deployer.address,
    {
      gasLimit: 3000000,
      gasPrice: competitiveGasPrice,
      nonce: networkNonce, // Use next available nonce
    }
  );
  
  console.log("📋 Transaction hash:", deploymentTx.deploymentTransaction().hash);
  console.log("⏳ Waiting for confirmation (this should be faster)...");
  
  // Monitor progress
  const startTime = Date.now();
  
  try {
    await deploymentTx.waitForDeployment();
    const endTime = Date.now();
    const deploymentTime = Math.round((endTime - startTime) / 1000);
    
    const address = await deploymentTx.getAddress();
    console.log("✅ DesignCandidate deployed successfully!");
    console.log("📍 Contract address:", address);
    console.log("⏱️  Deployment time:", deploymentTime, "seconds");
    
    // Get actual gas used
    const receipt = await provider.getTransactionReceipt(deploymentTx.deploymentTransaction().hash);
    if (receipt) {
      const actualCost = receipt.gasUsed * competitiveGasPrice;
      console.log("💰 Actual cost:", ethers.formatEther(actualCost), "CHZ");
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
    }
    
    // Test contract functionality
    console.log("\n🧪 Testing deployed contract...");
    const name = await deploymentTx.name();
    const symbol = await deploymentTx.symbol();
    const owner = await deploymentTx.owner();
    
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Owner:", owner);
    
    // Check nonce status after deployment
    const newNetworkNonce = await provider.getTransactionCount(deployer.address, "latest");
    const newPendingNonce = await provider.getTransactionCount(deployer.address, "pending");
    
    console.log("\n📊 Post-deployment status:");
    console.log("Network nonce:", newNetworkNonce);
    console.log("Pending nonce:", newPendingNonce);
    console.log("Remaining stuck transactions:", newPendingNonce - newNetworkNonce);
    
    if (newPendingNonce > newNetworkNonce) {
      console.log("⚠️  Still have pending transactions. Consider clearing them.");
    } else {
      console.log("✅ All transactions cleared!");
    }
    
    console.log("\n🔧 Add to your .env file:");
    console.log(`DESIGN_CANDIDATE_ADDRESS=${address}`);
    
    return address;
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    // Check if it's still a timeout issue
    if (error.message.includes("timeout")) {
      console.log("\n🤔 Still timing out? Let's check the transaction:");
      console.log("Transaction hash:", deploymentTx.deploymentTransaction().hash);
      console.log("Run: pnpm run blockchain:monitor", deploymentTx.deploymentTransaction().hash);
    }
    
    throw error;
  }
}

main()
  .then((address) => {
    console.log("\n🎉 SUCCESS! Contract deployed at:", address);
    console.log("Next step: Deploy Governor contract (if needed)");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Aggressive deployment failed:", error);
    
    // Suggest alternatives
    console.log("\n🔄 Alternative approaches:");
    console.log("1. Wait for network gas prices to drop");
    console.log("2. Use full network gas price (expensive but guaranteed)");
    console.log("3. Clear pending transactions manually");
    
    process.exit(1);
  }); 