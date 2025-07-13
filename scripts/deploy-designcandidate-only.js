const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('🎯 DEPLOYING DESIGNCANDIDATE ONLY (No Governance Transfer)');
  console.log('='.repeat(70));
  
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider;
  
  console.log('🚀 Deploying DesignCandidate with:');
  console.log('  Deployer:', deployer.address);
  console.log('  Network:', (await provider.getNetwork()).name || 'chiliz-spicy');
  
  const balance = await provider.getBalance(deployer.address);
  console.log('  Balance:', ethers.formatEther(balance), 'CHZ');
  
  // Get optimal gas pricing for Chiliz
  const feeData = await provider.getFeeData();
  const networkGasPrice = feeData.gasPrice || ethers.parseUnits('2501', 'gwei');
  
  // Use ultra-high priority for guaranteed confirmation
  let gasConfig;
  if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
    // EIP-1559 pricing
    gasConfig = {
      gasLimit: 3000000,
      maxFeePerGas: ethers.parseUnits('4000', 'gwei'), // High max fee
      maxPriorityFeePerGas: ethers.parseUnits('500', 'gwei'), // Ultra high priority
    };
    console.log('  Using EIP-1559 gas:');
    console.log('    Max Fee:', ethers.formatUnits(gasConfig.maxFeePerGas, 'gwei'), 'gwei');
    console.log('    Priority Fee:', ethers.formatUnits(gasConfig.maxPriorityFeePerGas, 'gwei'), 'gwei');
  } else {
    // Legacy pricing
    const ultraHighGasPrice = networkGasPrice > ethers.parseUnits('2501', 'gwei') 
      ? (networkGasPrice * BigInt(150)) / BigInt(100) // 150% of network if network is high
      : ethers.parseUnits('3500', 'gwei'); // Fixed high price for low network prices
    
    gasConfig = {
      gasLimit: 3000000,
      gasPrice: ultraHighGasPrice,
    };
    console.log('  Using Legacy gas:', ethers.formatUnits(gasConfig.gasPrice, 'gwei'), 'gwei');
  }
  
  // Calculate estimated cost
  const gasPrice = gasConfig.gasPrice || gasConfig.maxFeePerGas;
  const estimatedCost = BigInt(gasConfig.gasLimit) * gasPrice;
  console.log('  Estimated cost:', ethers.formatEther(estimatedCost), 'CHZ');
  
  if (estimatedCost > balance) {
    console.error('❌ Insufficient balance for deployment!');
    console.log('Need:', ethers.formatEther(estimatedCost), 'CHZ');
    console.log('Have:', ethers.formatEther(balance), 'CHZ');
    console.log('💡 Get more CHZ from: https://spicy-faucet.chiliz.com/');
    process.exit(1);
  }
  
  // Deploy DesignCandidate contract
  console.log('\n🏗️  DEPLOYING DESIGNCANDIDATE CONTRACT');
  console.log('-'.repeat(50));
  
  const DesignCandidate = await ethers.getContractFactory('DesignCandidate');
  
  console.log('⏳ Deploying with ultra-high priority gas...');
  const startTime = Date.now();
  
  const designCandidate = await DesignCandidate.deploy(
    deployer.address, // Royalty recipient (you)
    gasConfig
  );
  
  console.log('📋 Transaction hash:', designCandidate.deploymentTransaction().hash);
  console.log('⏳ Waiting for confirmation...');
  
  // Wait for deployment with timeout
  const deploymentPromise = designCandidate.waitForDeployment();
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Deployment timeout after 3 minutes')), 180000)
  );
  
  try {
    await Promise.race([deploymentPromise, timeoutPromise]);
    const endTime = Date.now();
    
    const designCandidateAddress = await designCandidate.getAddress();
    console.log('✅ DesignCandidate deployed to:', designCandidateAddress);
    console.log('⏱️  Deployment time:', Math.round((endTime - startTime) / 1000), 'seconds');
    
    // Get actual deployment cost
    const receipt = await provider.getTransactionReceipt(designCandidate.deploymentTransaction().hash);
    if (receipt) {
      const actualCost = receipt.gasUsed * gasPrice;
      console.log('💰 Actual cost:', ethers.formatEther(actualCost), 'CHZ');
      console.log('⛽ Gas used:', receipt.gasUsed.toString());
    }
    
    // Verify contract functionality
    console.log('\n🧪 TESTING CONTRACT');
    console.log('-'.repeat(30));
    
    try {
      const name = await designCandidate.name();
      const symbol = await designCandidate.symbol();
      const owner = await designCandidate.owner();
      
      console.log('✅ Contract name:', name);
      console.log('✅ Symbol:', symbol);
      console.log('✅ Owner:', owner);
      console.log('✅ You own the contract:', owner.toLowerCase() === deployer.address.toLowerCase());
      
    } catch (testError) {
      console.log('⚠️  Could not test contract functions:', testError.message);
    }
    
    // Output results
    console.log('\n🎉 DEPLOYMENT SUCCESSFUL');
    console.log('='.repeat(50));
    console.log('📋 Contract Address:', designCandidateAddress);
    console.log('👤 Owner:', deployer.address);
    console.log('🔗 Explorer:', `https://testnet.chiliscan.com/address/${designCandidateAddress}`);
    
    console.log('\n🔧 ENVIRONMENT VARIABLES');
    console.log('-'.repeat(30));
    console.log('Update your .env file:');
    console.log(`DESIGN_CANDIDATE_ADDRESS=${designCandidateAddress}`);
    console.log(`NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS=${designCandidateAddress}`);
    
    console.log('\n✅ READY FOR MINTING');
    console.log('-'.repeat(30));
    console.log('🎯 Your app can now mint NFTs directly');
    console.log('🏛️  No governance approval needed');
    console.log('🚀 Voting system still works with existing Governor');
    
    return designCandidateAddress;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('\n🚨 Deployment timed out. Possible solutions:');
      console.log('- Check transaction hash on explorer');
      console.log('- Increase gas price');
      console.log('- Try again when network is less congested');
    }
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💰 Insufficient funds for deployment');
      console.log('Get more CHZ from: https://spicy-faucet.chiliz.com/');
    }
    
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main; 