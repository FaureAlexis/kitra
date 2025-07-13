const { ethers } = require('ethers');
require('dotenv').config();

async function testMintWithReasonableGas() {
  console.log('🧪 TESTING MINT WITH REASONABLE GAS PRICES');
  console.log('='.repeat(60));
  
  const provider = new ethers.JsonRpcProvider(process.env.CHZ_RPC_URL);
  const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
  
  const designCandidateAddress = process.env.DESIGN_CANDIDATE_ADDRESS;
  
  console.log('👤 Wallet:', wallet.address);
  console.log('📋 Contract:', designCandidateAddress);
  
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'CHZ');
  
  // Get network fees
  const feeData = await provider.getFeeData();
  console.log('🌐 Network fees:');
  console.log('  Gas Price:', ethers.formatUnits(feeData.gasPrice || 0, 'gwei'), 'gwei');
  console.log('  Max Fee:', ethers.formatUnits(feeData.maxFeePerGas || 0, 'gwei'), 'gwei');
  console.log('  Priority Fee:', ethers.formatUnits(feeData.maxPriorityFeePerGas || 0, 'gwei'), 'gwei');
  
  // Use REASONABLE gas prices for testing
  const reasonableMaxFee = ethers.parseUnits('3000', 'gwei'); // 3000 gwei (still above Chiliz minimum)
  const reasonablePriorityFee = ethers.parseUnits('50', 'gwei'); // 50 gwei priority
  
  console.log('\n🎯 Using REASONABLE gas prices:');
  console.log('  Max Fee:', ethers.formatUnits(reasonableMaxFee, 'gwei'), 'gwei');
  console.log('  Priority Fee:', ethers.formatUnits(reasonablePriorityFee, 'gwei'), 'gwei');
  
  // Calculate estimated cost
  const gasEstimate = 250000; // Conservative estimate
  const estimatedCost = BigInt(gasEstimate) * reasonableMaxFee;
  console.log('  Estimated cost:', ethers.formatEther(estimatedCost), 'CHZ');
  
  if (estimatedCost > balance) {
    console.error('❌ Still insufficient funds with reasonable gas prices');
    console.log('Need:', ethers.formatEther(estimatedCost), 'CHZ');
    console.log('Have:', ethers.formatEther(balance), 'CHZ');
    return;
  }
  
  console.log('✅ Sufficient funds for reasonable gas transaction');
  
  // Test contract interaction
  const abi = [
    'function mintDesign(address to, string memory name, string memory tokenURI) external returns (uint256)'
  ];
  
  const contract = new ethers.Contract(designCandidateAddress, abi, wallet);
  
  const gasConfig = {
    gasLimit: gasEstimate,
    maxFeePerGas: reasonableMaxFee,
    maxPriorityFeePerGas: reasonablePriorityFee,
  };
  
  console.log('\n🪙 ATTEMPTING MINT WITH REASONABLE GAS...');
  console.log('-'.repeat(50));
  
  try {
    const tx = await contract.mintDesign(
      wallet.address,
      'Test Design - Reasonable Gas',
      'ipfs://test-metadata-reasonable',
      gasConfig
    );
    
    console.log('✅ Transaction sent!');
    console.log('📋 Hash:', tx.hash);
    console.log('🔗 Explorer:', `https://testnet.chiliscan.com/tx/${tx.hash}`);
    
    console.log('⏳ Waiting for confirmation (30s timeout)...');
    
    // Wait with shorter timeout
    const receiptPromise = tx.wait();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Confirmation timeout')), 30000)
    );
    
    try {
      const receipt = await Promise.race([receiptPromise, timeoutPromise]);
      
      console.log('🎉 TRANSACTION CONFIRMED!');
      console.log('✅ Status:', receipt.status === 1 ? 'Success' : 'Failed');
      console.log('⛽ Gas used:', receipt.gasUsed.toString());
      
      const actualCost = receipt.gasUsed * reasonableMaxFee;
      console.log('💰 Actual cost:', ethers.formatEther(actualCost), 'CHZ');
      
      console.log('\n🏆 MINTING IS WORKING!');
      console.log('The issue was ultra-high gas prices, not contract ownership.');
      
    } catch (timeoutError) {
      console.log('⏰ Confirmation timed out, but transaction may still succeed');
      console.log('Check the explorer link above for updates');
    }
    
  } catch (error) {
    console.error('❌ Minting failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('💡 Still insufficient funds - try with even lower gas prices');
    } else if (error.message.includes('onlyOwner')) {
      console.log('💡 Ownership issue detected despite diagnostics');
    } else {
      console.log('💡 Unexpected error - check network connectivity');
    }
  }
}

testMintWithReasonableGas().catch(console.error); 