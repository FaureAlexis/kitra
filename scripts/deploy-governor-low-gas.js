require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🐌 LOW GAS GOVERNOR DEPLOYMENT - Using minimal gas price");
  console.log("=".repeat(60));
  
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider;
  
  console.log("Deployer:", deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "CHZ");
  
  // Check if DesignCandidate is deployed
  const designCandidateAddress = process.env.DESIGN_CANDIDATE_ADDRESS;
  if (!designCandidateAddress) {
    console.error("❌ DESIGN_CANDIDATE_ADDRESS not found in environment");
    process.exit(1);
  }
  
  // Check CHZ Token
  const chzTokenAddress = process.env.CHZ_TOKEN_ADDRESS;
  if (!chzTokenAddress) {
    console.error("❌ CHZ_TOKEN_ADDRESS not found in environment");
    process.exit(1);
  }
  
  console.log("🎯 DesignCandidate address:", designCandidateAddress);
  console.log("🎯 CHZ token address:", chzTokenAddress);
  
  // Get current network conditions
  const feeData = await provider.getFeeData();
  const networkGasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
  const networkNonce = await provider.getTransactionCount(deployer.address, "latest");
  const pendingNonce = await provider.getTransactionCount(deployer.address, "pending");
  
  console.log("Network gas price:", ethers.formatUnits(networkGasPrice, 'gwei'), "Gwei");
  console.log("Network nonce:", networkNonce);
  console.log("Pending nonce:", pendingNonce);
  console.log("Stuck transactions:", pendingNonce - networkNonce);
  
  // Use ultra-low gas price to avoid balance issues
  const ultraLowGasPrice = ethers.parseUnits('50', 'gwei'); // Fixed 50 Gwei
  console.log("🐌 Using ultra-low gas price:", ethers.formatUnits(ultraLowGasPrice, 'gwei'), "Gwei");
  
  // Calculate cost with low gas
  const gasEstimate = 4000000; // Governor contract estimate
  const deploymentCost = BigInt(gasEstimate) * ultraLowGasPrice;
  console.log("💰 Estimated deployment cost:", ethers.formatEther(deploymentCost), "CHZ");
  
  if (deploymentCost > balance) {
    console.error("❌ Still insufficient balance even with low gas!");
    console.log("Need:", ethers.formatEther(deploymentCost), "CHZ");
    console.log("Have:", ethers.formatEther(balance), "CHZ");
    console.log("💡 Get more CHZ from faucet or wait for stuck transactions to clear");
    process.exit(1);
  }
  
  // Warning about slow deployment
  console.log("\n🐌 WARNING: This deployment will be VERY SLOW!");
  console.log("With low gas price, it might take 10-30 minutes to confirm");
  console.log("But it will avoid the balance issue from stuck transactions");
  console.log("Cost:", ethers.formatEther(deploymentCost), "CHZ");
  console.log("Press Ctrl+C to cancel or wait 5 seconds to proceed...");
  
  // 5 second delay to allow cancellation
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Deploy Governor with ultra-low gas price
  console.log("\n🐌 Deploying KitraGovernor with ultra-low gas...");
  
  const KitraGovernor = await ethers.getContractFactory("KitraGovernor");
  
  // Use next available nonce to avoid conflicts
  const deploymentTx = await KitraGovernor.deploy(
    chzTokenAddress,
    designCandidateAddress,
    {
      gasLimit: 5000000,
      gasPrice: ultraLowGasPrice, // Ultra-low gas price
      nonce: pendingNonce, // Use next available nonce after stuck transactions
    }
  );
  
  console.log("📋 Transaction hash:", deploymentTx.deploymentTransaction().hash);
  console.log("⏳ Waiting for confirmation (this will be slow)...");
  console.log("💡 You can check status at: https://testnet.chiliscan.com/tx/" + deploymentTx.deploymentTransaction().hash);
  
  // Monitor progress with longer timeout
  const startTime = Date.now();
  
  try {
    // Wait with 30 minute timeout
    await deploymentTx.waitForDeployment();
    const endTime = Date.now();
    const deploymentTime = Math.round((endTime - startTime) / 1000);
    
    const address = await deploymentTx.getAddress();
    console.log("🎉 KitraGovernor deployed successfully!");
    console.log("📍 Contract address:", address);
    console.log("⏱️  Deployment time:", deploymentTime, "seconds");
    
    // Get actual gas used
    const receipt = await provider.getTransactionReceipt(deploymentTx.deploymentTransaction().hash);
    if (receipt) {
      const actualCost = receipt.gasUsed * ultraLowGasPrice;
      console.log("💰 Actual cost:", ethers.formatEther(actualCost), "CHZ");
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
    }
    
    // Test contract functionality
    console.log("\n🧪 Testing deployed contract...");
    try {
      const name = await deploymentTx.name();
      const token = await deploymentTx.token();
      console.log("✅ Name:", name);
      console.log("✅ Token:", token);
    } catch (error) {
      console.log("⚠️  Contract test failed:", error.message.split('(')[0]);
    }
    
    // Check nonce status after deployment
    const newNetworkNonce = await provider.getTransactionCount(deployer.address, "latest");
    const newPendingNonce = await provider.getTransactionCount(deployer.address, "pending");
    
    console.log("\n📊 Post-deployment status:");
    console.log("Network nonce:", newNetworkNonce);
    console.log("Pending nonce:", newPendingNonce);
    console.log("Remaining stuck transactions:", newPendingNonce - newNetworkNonce);
    
    console.log("\n🔧 Add to your .env file:");
    console.log(`KITRA_GOVERNOR_ADDRESS=${address}`);
    console.log(`NEXT_PUBLIC_KITRA_GOVERNOR_ADDRESS=${address}`);
    
    console.log("\n🎯 Next steps:");
    console.log("1. Governor deployed successfully with low gas");
    console.log("2. Update .env with the governor contract address");
    console.log("3. Connect frontend to deployed contracts");
    console.log("4. Test governance functionality");
    
    return address;
    
  } catch (error) {
    console.error("❌ Low gas deployment failed:", error.message);
    
    if (error.message.includes("timeout")) {
      console.log("\n⏰ Deployment timed out");
      console.log("Check transaction status: https://testnet.chiliscan.com/tx/" + deploymentTx.deploymentTransaction().hash);
      console.log("It might still be pending - wait and check later");
    }
    
    throw error;
  }
}

main()
  .then((address) => {
    console.log("\n🎉 LOW GAS SUCCESS! Governor deployed at:", address);
    console.log("Slow but successful deployment complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Low gas deployment failed:", error);
    
    console.log("\n🆘 Alternative solutions:");
    console.log("1. Wait for stuck transactions to clear naturally");
    console.log("2. Get more CHZ from faucet");
    console.log("3. Try again when network gas prices drop");
    
    process.exit(1);
  }); 