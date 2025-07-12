require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("☢️  NUCLEAR DEPLOYMENT - Using full network gas price");
  console.log("=".repeat(60));
  
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider;
  
  console.log("Deployer:", deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "CHZ");
  
  // Get current network conditions
  const feeData = await provider.getFeeData();
  const networkGasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
  const networkNonce = await provider.getTransactionCount(deployer.address, "latest");
  const pendingNonce = await provider.getTransactionCount(deployer.address, "pending");
  
  console.log("Network gas price:", ethers.formatUnits(networkGasPrice, 'gwei'), "Gwei");
  console.log("Network nonce:", networkNonce);
  console.log("Pending nonce:", pendingNonce);
  console.log("Stuck transactions:", pendingNonce - networkNonce);
  
  // Use full network gas price (guaranteed to be competitive)
  console.log("⚠️  Using FULL network gas price:", ethers.formatUnits(networkGasPrice, 'gwei'), "Gwei");
  
  // Calculate cost
  const gasEstimate = 1910579; // From diagnostic
  const deploymentCost = BigInt(gasEstimate) * networkGasPrice;
  console.log("💰 Estimated deployment cost:", ethers.formatEther(deploymentCost), "CHZ");
  
  if (deploymentCost > balance) {
    console.error("❌ Insufficient balance for deployment!");
    console.log("Need:", ethers.formatEther(deploymentCost), "CHZ");
    console.log("Have:", ethers.formatEther(balance), "CHZ");
    console.log("\n💡 Consider:");
    console.log("1. Wait for network gas prices to drop");
    console.log("2. Get more CHZ tokens from faucet");
    console.log("3. Use a different deployment strategy");
    process.exit(1);
  }
  
  // Warning about cost
  console.log("\n⚠️  WARNING: This deployment will be expensive!");
  console.log("Cost:", ethers.formatEther(deploymentCost), "CHZ");
  console.log("Press Ctrl+C to cancel or wait 5 seconds to proceed...");
  
  // 5 second delay to allow cancellation
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Deploy DesignCandidate with full network gas price
  console.log("\n☢️  Deploying DesignCandidate with full network gas...");
  
  const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
  
  // Use explicit nonce to ensure we replace the pending transaction
  const deploymentTx = await DesignCandidate.deploy(
    deployer.address,
    {
      gasLimit: 3000000,
      gasPrice: networkGasPrice, // Full network gas price
      nonce: networkNonce, // Use next available nonce
    }
  );
  
  console.log("📋 Transaction hash:", deploymentTx.deploymentTransaction().hash);
  console.log("⏳ Waiting for confirmation (should be very fast)...");
  
  // Monitor progress
  const startTime = Date.now();
  
  try {
    await deploymentTx.waitForDeployment();
    const endTime = Date.now();
    const deploymentTime = Math.round((endTime - startTime) / 1000);
    
    const address = await deploymentTx.getAddress();
    console.log("🎉 DesignCandidate deployed successfully!");
    console.log("📍 Contract address:", address);
    console.log("⏱️  Deployment time:", deploymentTime, "seconds");
    
    // Get actual gas used
    const receipt = await provider.getTransactionReceipt(deploymentTx.deploymentTransaction().hash);
    if (receipt) {
      const actualCost = receipt.gasUsed * networkGasPrice;
      console.log("💰 Actual cost:", ethers.formatEther(actualCost), "CHZ");
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
    }
    
    // Test contract functionality
    console.log("\n🧪 Testing deployed contract...");
    const name = await deploymentTx.name();
    const symbol = await deploymentTx.symbol();
    const owner = await deploymentTx.owner();
    
    console.log("✅ Name:", name);
    console.log("✅ Symbol:", symbol);
    console.log("✅ Owner:", owner);
    
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
    
    console.log("\n🎯 Next steps:");
    console.log("1. Update .env with the contract address");
    console.log("2. Deploy Governor contract (if needed)");
    console.log("3. Start connecting frontend to deployed contract");
    
    return address;
    
  } catch (error) {
    console.error("❌ Nuclear deployment failed:", error.message);
    
    // This should almost never happen with full network gas price
    console.log("\n🤔 Unexpected failure with full network gas price!");
    console.log("Check transaction hash:", deploymentTx.deploymentTransaction().hash);
    console.log("Run: pnpm run blockchain:monitor", deploymentTx.deploymentTransaction().hash);
    
    throw error;
  }
}

main()
  .then((address) => {
    console.log("\n🎉 NUCLEAR SUCCESS! Contract deployed at:", address);
    console.log("Expensive but guaranteed deployment complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Nuclear deployment failed:", error);
    
    console.log("\n🆘 If nuclear deployment fails, the issue is likely:");
    console.log("1. Network/RPC problems");
    console.log("2. Contract compilation issues");
    console.log("3. Insufficient balance");
    console.log("4. Private key/wallet issues");
    
    process.exit(1);
  }); 