require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 TRANSACTION MONITOR - Diagnosing pending transactions");
  console.log("=".repeat(60));
  
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider;
  
  // Transaction hash from the failed deployment (can be overridden via command line)
  const txHash = process.argv[2] || "0x9a4c08b3ea2cad53116b3047a0506665fb00e3aa893ff240ceade3c85f5bf932";
  
  console.log("📋 Monitoring transaction:", txHash);
  console.log("👤 Deployer address:", deployer.address);
  console.log("💡 Usage: pnpm run blockchain:monitor [transaction_hash]");
  
  // 1. Check transaction status
  console.log("\n📡 TRANSACTION STATUS CHECK");
  console.log("-".repeat(40));
  
  try {
    const tx = await provider.getTransaction(txHash);
    if (tx) {
      console.log("✅ Transaction found on network:");
      console.log("  From:", tx.from);
      console.log("  To:", tx.to || "Contract Creation");
      console.log("  Value:", ethers.formatEther(tx.value || 0), "CHZ");
      console.log("  Gas Limit:", tx.gasLimit?.toString() || "unknown");
      console.log("  Gas Price:", tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') + " Gwei" : "unknown");
      console.log("  Nonce:", tx.nonce);
      console.log("  Block Number:", tx.blockNumber || "PENDING");
      
      // Check if transaction is confirmed
      const receipt = await provider.getTransactionReceipt(txHash);
      if (receipt) {
        console.log("✅ Transaction CONFIRMED:");
        console.log("  Block:", receipt.blockNumber);
        console.log("  Gas Used:", receipt.gasUsed?.toString());
        console.log("  Status:", receipt.status === 1 ? "SUCCESS" : "FAILED");
      } else {
        console.log("⏳ Transaction PENDING - not yet mined");
      }
    } else {
      console.log("❌ Transaction not found on network");
    }
  } catch (error) {
    console.error("❌ Error checking transaction:", error.message);
  }
  
  // 2. Check account nonce status
  console.log("\n🔢 NONCE ANALYSIS");
  console.log("-".repeat(40));
  
  try {
    const networkNonce = await provider.getTransactionCount(deployer.address, "latest");
    const pendingNonce = await provider.getTransactionCount(deployer.address, "pending");
    
    console.log("Network nonce (latest):", networkNonce);
    console.log("Pending nonce:", pendingNonce);
    
    if (pendingNonce > networkNonce) {
      console.log("⚠️  WARNING: Pending transactions detected!");
      console.log("  Pending transactions:", pendingNonce - networkNonce);
    } else {
      console.log("✅ No pending transactions");
    }
  } catch (error) {
    console.error("❌ Error checking nonce:", error.message);
  }
  
  // 3. Current network conditions
  console.log("\n⛽ CURRENT NETWORK CONDITIONS");
  console.log("-".repeat(40));
  
  try {
    const feeData = await provider.getFeeData();
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    
    console.log("Current block:", blockNumber);
    console.log("Block gas limit:", block?.gasLimit?.toString() || "unknown");
    console.log("Block gas used:", block?.gasUsed?.toString() || "unknown");
    
    if (block?.gasLimit && block?.gasUsed) {
      const usage = (Number(block.gasUsed) / Number(block.gasLimit)) * 100;
      console.log("Block utilization:", usage.toFixed(1) + "%");
      
      if (usage > 95) {
        console.log("🚨 HIGH CONGESTION: Block >95% full");
      }
    }
    
    console.log("Network gas price:", feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') + " Gwei" : "unknown");
    
  } catch (error) {
    console.error("❌ Error checking network conditions:", error.message);
  }
  
  // 4. Test different gas prices
  console.log("\n🧪 GAS PRICE TESTING");
  console.log("-".repeat(40));
  
  try {
    const feeData = await provider.getFeeData();
    const networkGasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
    
    console.log("Network suggests:", ethers.formatUnits(networkGasPrice, 'gwei'), "Gwei");
    
    // Test different gas price strategies
    const strategies = [
      { name: "Conservative (100 Gwei)", gasPrice: ethers.parseUnits('100', 'gwei') },
      { name: "Moderate (500 Gwei)", gasPrice: ethers.parseUnits('500', 'gwei') },
      { name: "Aggressive (1000 Gwei)", gasPrice: ethers.parseUnits('1000', 'gwei') },
      { name: "Network Price", gasPrice: networkGasPrice },
    ];
    
    for (const strategy of strategies) {
      const gasEstimate = 1910579; // From diagnostic
      const txCost = BigInt(gasEstimate) * strategy.gasPrice;
      const costInCHZ = ethers.formatEther(txCost);
      
      console.log(`${strategy.name}: ${ethers.formatUnits(strategy.gasPrice, 'gwei')} Gwei = ${costInCHZ} CHZ`);
    }
    
  } catch (error) {
    console.error("❌ Error testing gas prices:", error.message);
  }
  
  // 5. Check for failed transactions
  console.log("\n🔍 RECENT TRANSACTION HISTORY");
  console.log("-".repeat(40));
  
  try {
    const currentBlock = await provider.getBlockNumber();
    const startBlock = currentBlock - 100; // Check last 100 blocks
    
    console.log(`Checking blocks ${startBlock} to ${currentBlock}...`);
    
    let foundTransactions = 0;
    for (let i = currentBlock; i >= startBlock && foundTransactions < 5; i--) {
      const block = await provider.getBlock(i, true);
      if (block?.transactions) {
        for (const tx of block.transactions) {
          if (typeof tx === 'object' && tx.from === deployer.address) {
            foundTransactions++;
            console.log(`Found tx in block ${i}: ${tx.hash}`);
            
            const receipt = await provider.getTransactionReceipt(tx.hash);
            if (receipt) {
              console.log(`  Status: ${receipt.status === 1 ? "SUCCESS" : "FAILED"}`);
            }
          }
        }
      }
    }
    
    if (foundTransactions === 0) {
      console.log("No recent transactions found from deployer address");
    }
    
  } catch (error) {
    console.error("❌ Error checking transaction history:", error.message);
  }
  
  // 6. Recommendations
  console.log("\n💡 RECOMMENDATIONS");
  console.log("-".repeat(40));
  
  const feeData = await provider.getFeeData();
  const networkGasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
  
  if (networkGasPrice > ethers.parseUnits('1000', 'gwei')) {
    console.log("🚨 Network gas price is extremely high!");
    console.log("   Consider waiting for lower network activity");
  }
  
  const pendingNonce = await provider.getTransactionCount(deployer.address, "pending");
  const networkNonce = await provider.getTransactionCount(deployer.address, "latest");
  
  if (pendingNonce > networkNonce) {
    console.log("⚠️  Clear pending transactions first");
    console.log("   Send a transaction with higher gas to replace pending ones");
  }
  
  console.log("\n🎯 SUGGESTED NEXT STEPS:");
  console.log("1. If transaction is PENDING: Wait or increase gas price");
  console.log("2. If transaction is FAILED: Check gas limit and revert reason");
  console.log("3. If transaction is NOT FOUND: Network propagation issue");
  console.log("4. If nonce issues: Clear pending transactions");
  
  console.log("\n" + "=".repeat(60));
  console.log("🔬 MONITORING COMPLETE");
}

main()
  .catch((error) => {
    console.error("❌ Monitoring failed:", error);
    process.exit(1);
  }); 