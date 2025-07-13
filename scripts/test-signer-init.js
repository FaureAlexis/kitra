const { ethers } = require('ethers');
require('dotenv').config();

async function testSignerInitialization() {
  console.log('🔍 TESTING SIGNER INITIALIZATION');
  console.log('='.repeat(50));
  
  console.log('📋 Environment Variables:');
  console.log('  NEXT_PUBLIC_RPC_URL:', process.env.NEXT_PUBLIC_RPC_URL);
  console.log('  NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS:', process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS);
  console.log('  BLOCKCHAIN_PRIVATE_KEY exists:', !!process.env.BLOCKCHAIN_PRIVATE_KEY);
  console.log('  BLOCKCHAIN_PRIVATE_KEY length:', process.env.BLOCKCHAIN_PRIVATE_KEY?.length);
  
  if (!process.env.BLOCKCHAIN_PRIVATE_KEY) {
    console.error('❌ BLOCKCHAIN_PRIVATE_KEY not found in environment');
    return;
  }
  
  // Test 1: Manual signer creation
  console.log('\n🧪 TEST 1: Manual Signer Creation');
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
    
    console.log('✅ Provider created');
    console.log('✅ Wallet created');
    console.log('📍 Wallet address:', wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Wallet balance:', ethers.formatEther(balance), 'CHZ');
    
  } catch (error) {
    console.error('❌ Manual signer creation failed:', error.message);
    return;
  }
  
  // Test 2: Blockchain Service Initialization
  console.log('\n🧪 TEST 2: Blockchain Service Initialization');
  try {
    // Import blockchain service dynamically to test initialization
    const { EthersService } = await import('../src/infra/blockchain/ethers-service.js');
    
    const ethersService = new EthersService({
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
      designCandidateAddress: process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS,
      governorAddress: process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS || '',
      privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
    });
    
    console.log('✅ EthersService created');
    
    // Test if we can call mintDesign (should not throw "No signer" error)
    try {
      // This should fail with a different error, not "No signer available"
      await ethersService.mintDesign(
        '0x6b0dFdD17Dc0ECA9f4802e2589F653e90F405B6C',
        'Test Design',
        'ipfs://test',
        false
      );
    } catch (mintError) {
      console.log('🔍 Mint error:', mintError.message);
      
      if (mintError.message.includes('No signer available')) {
        console.error('❌ SIGNER NOT INITIALIZED - This is the problem!');
        console.log('🔧 The private key is not being loaded into the EthersService');
      } else {
        console.log('✅ Signer is initialized (different error expected)');
      }
    }
    
  } catch (serviceError) {
    console.error('❌ EthersService creation failed:', serviceError.message);
  }
  
  // Test 3: Direct contract interaction
  console.log('\n🧪 TEST 3: Direct Contract Interaction');
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
    
    const abi = [
      'function mintDesign(address to, string memory name, string memory tokenURI) external returns (uint256)'
    ];
    
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS,
      abi,
      wallet
    );
    
    console.log('✅ Contract instance created with signer');
    console.log('🎯 This proves signer initialization works manually');
    
    // Quick gas estimation test
    try {
      const gasEstimate = await contract.mintDesign.estimateGas(
        wallet.address,
        'Test Design',
        'ipfs://test'
      );
      console.log('✅ Gas estimation successful:', gasEstimate.toString());
      console.log('🎉 CONTRACT AND SIGNER ARE WORKING!');
      console.log('💡 The issue must be in BlockchainService initialization');
    } catch (gasError) {
      console.log('⚠️  Gas estimation failed:', gasError.message);
      if (gasError.message.includes('insufficient funds')) {
        console.log('✅ Signer works, just insufficient gas funds');
      }
    }
    
  } catch (contractError) {
    console.error('❌ Direct contract interaction failed:', contractError.message);
  }
}

testSignerInitialization().catch(console.error); 