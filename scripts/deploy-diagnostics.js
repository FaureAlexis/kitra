require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 DIAGNOSTIC MODE - Analyzing deployment issues");
  console.log("=".repeat(60));
  
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider;
  
  // 1. Basic network info
  console.log("📊 NETWORK ANALYSIS");
  console.log("-".repeat(40));
  
  const network = await provider.getNetwork();
  console.log("Network name:", network.name || 'unknown');
  console.log("Chain ID:", network.chainId.toString());
  
  const balance = await provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "CHZ");
  
  // 2. Gas price analysis
  console.log("\n⛽ GAS PRICE ANALYSIS");
  console.log("-".repeat(40));
  
  try {
    const feeData = await provider.getFeeData();
    console.log("Raw fee data:", {
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') + ' Gwei' : 'null',
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') + ' Gwei' : 'null',
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') + ' Gwei' : 'null'
    });
    
    const gasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
    console.log("Selected gas price:", ethers.formatUnits(gasPrice, 'gwei'), "Gwei");
    
    // Show what our multiplication would do
    console.log("❌ Our 2x multiplication would be:", ethers.formatUnits(gasPrice * 2n, 'gwei'), "Gwei");
    console.log("❌ Our 3x multiplication would be:", ethers.formatUnits(gasPrice * 3n, 'gwei'), "Gwei");
    
    // Calculate reasonable gas price (cap at 100 Gwei)
    const maxReasonableGasPrice = ethers.parseUnits('100', 'gwei');
    const reasonableGasPrice = gasPrice > maxReasonableGasPrice ? maxReasonableGasPrice : gasPrice;
    console.log("✅ Reasonable gas price should be:", ethers.formatUnits(reasonableGasPrice, 'gwei'), "Gwei");
    
  } catch (error) {
    console.error("❌ Error getting fee data:", error.message);
  }
  
  // 3. Network connectivity test
  console.log("\n🌐 NETWORK CONNECTIVITY TEST");
  console.log("-".repeat(40));
  
  try {
    const startTime = Date.now();
    const blockNumber = await provider.getBlockNumber();
    const endTime = Date.now();
    
    console.log("Current block number:", blockNumber);
    console.log("RPC response time:", (endTime - startTime) + "ms");
    
    // Test multiple block requests to check consistency
    const blockTimes = [];
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await provider.getBlockNumber();
      const end = Date.now();
      blockTimes.push(end - start);
    }
    
    console.log("Multiple RPC response times:", blockTimes.map(t => t + "ms").join(", "));
    const avgTime = blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length;
    console.log("Average RPC response time:", avgTime.toFixed(1) + "ms");
    
    if (avgTime > 2000) {
      console.log("⚠️  WARNING: Slow RPC responses (>2s)");
    }
    
  } catch (error) {
    console.error("❌ Network connectivity error:", error.message);
  }
  
  // 4. Contract size analysis
  console.log("\n📦 CONTRACT SIZE ANALYSIS");
  console.log("-".repeat(40));
  
  try {
    const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
    
    // Get bytecode length
    const bytecodeLength = DesignCandidate.bytecode.length;
    const contractSize = Math.floor(bytecodeLength / 2); // Each byte is 2 hex chars
    
    console.log("Contract bytecode size:", contractSize, "bytes");
    
    // Check if contract is too large (24KB limit)
    const maxContractSize = 24 * 1024; // 24KB
    
    if (contractSize > maxContractSize) {
      console.log("❌ WARNING: Contract too large!", contractSize, "bytes (max:", maxContractSize, "bytes)");
    } else {
      console.log("✅ Contract size OK:", contractSize, "bytes");
    }
    
  } catch (error) {
    console.error("❌ Contract analysis error:", error.message);
  }
  
  // 5. Block time analysis
  console.log("\n🕐 BLOCK TIME ANALYSIS");
  console.log("-".repeat(40));
  
  try {
    const currentBlockNumber = await provider.getBlockNumber();
    const currentBlock = await provider.getBlock(currentBlockNumber);
    const previousBlock = await provider.getBlock(currentBlockNumber - 1);
    
    if (currentBlock && previousBlock) {
      const blockTime = currentBlock.timestamp - previousBlock.timestamp;
      console.log("Last block time:", blockTime, "seconds");
      console.log("Current block timestamp:", new Date(currentBlock.timestamp * 1000).toISOString());
      
      if (blockTime > 60) {
        console.log("⚠️  WARNING: Slow block times (>60s)");
      }
    }
    
  } catch (error) {
    console.error("❌ Block time analysis error:", error.message);
  }
  
  // 6. Test transaction simulation
  console.log("\n🧪 TRANSACTION SIMULATION");
  console.log("-".repeat(40));
  
  try {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
    
    // Cap gas price at reasonable level
    const maxGasPrice = ethers.parseUnits('100', 'gwei');
    const safeGasPrice = gasPrice > maxGasPrice ? maxGasPrice : gasPrice;
    
    console.log("Testing transaction with safe gas price:", ethers.formatUnits(safeGasPrice, 'gwei'), "Gwei");
    
    // Estimate gas for deployment
    const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
    
    // Create deployment transaction data
    const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [deployer.address]);
    const deploymentData = DesignCandidate.bytecode + constructorArgs.slice(2); // Remove '0x' prefix
    
    const gasEstimate = await provider.estimateGas({
      data: deploymentData
    });
    
    console.log("Gas estimate for deployment:", gasEstimate.toString());
    
    const txCost = gasEstimate * safeGasPrice;
    console.log("Estimated transaction cost:", ethers.formatEther(txCost), "CHZ");
    
  } catch (error) {
    console.error("❌ Transaction simulation error:", error.message);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("🔬 DIAGNOSTIC COMPLETE");
  console.log("Check the analysis above to identify the root cause.");
}

main()
  .catch((error) => {
    console.error("❌ Diagnostic failed:", error);
    process.exit(1);
  }); 