require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Quick deployment - DesignCandidate only");
  
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "CHZ");
  
  // Get current gas price but cap it at reasonable level
  const feeData = await deployer.provider.getFeeData();
  const networkGasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
  
  console.log("Network gas price:", ethers.formatUnits(networkGasPrice, 'gwei'), "Gwei");
  
  // Cap gas price at reasonable level (don't multiply crazy high prices)
  const maxReasonableGasPrice = ethers.parseUnits('100', 'gwei');
  const safeGasPrice = networkGasPrice > maxReasonableGasPrice ? maxReasonableGasPrice : networkGasPrice;
  
  console.log("Using safe gas price:", ethers.formatUnits(safeGasPrice, 'gwei'), "Gwei");
  
  // Deploy just DesignCandidate first
  console.log("\n⏳ Deploying DesignCandidate...");
  const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
  
  const designCandidate = await DesignCandidate.deploy(
    deployer.address,
    {
      gasLimit: 2500000,
      gasPrice: safeGasPrice, // Use safe gas price (no multiplication)
    }
  );
  
  console.log("📋 TX:", designCandidate.deploymentTransaction().hash);
  console.log("⏳ Waiting 60 seconds max...");
  
  // Longer timeout since we're using reasonable gas price
  const deployment = designCandidate.waitForDeployment();
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("60 second timeout")), 60000)
  );
  
  await Promise.race([deployment, timeout]);
  
  const address = await designCandidate.getAddress();
  console.log("✅ DesignCandidate deployed:", address);
  
  // Test basic functionality
  console.log("\n🧪 Testing contract...");
  const name = await designCandidate.name();
  const symbol = await designCandidate.symbol();
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  
  console.log("\n✅ Quick deployment successful!");
  console.log("Contract address:", address);
  
  return address;
}

main()
  .then((address) => {
    console.log("\n🔧 Add to .env:");
    console.log(`DESIGN_CANDIDATE_ADDRESS=${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Quick deployment failed:", error.message);
    process.exit(1);
  }); 