require('dotenv').config();

async function testBlockchainServiceSingleton() {
  console.log('🔍 TESTING BLOCKCHAIN SERVICE SINGLETON');
  console.log('='.repeat(60));
  
  // Show environment at script start
  console.log('📋 Environment at script start:');
  console.log('  BLOCKCHAIN_PRIVATE_KEY exists:', !!process.env.BLOCKCHAIN_PRIVATE_KEY);
  console.log('  NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS:', process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS);
  
  // Test 1: Create BlockchainService manually with debug
  console.log('\n🧪 TEST 1: Manual BlockchainService Creation');
  
  // Create the class manually to see what happens
  const { EthersService } = require('../src/infra/blockchain/ethers-service.ts');
  
  console.log('Creating EthersService with config:');
  const config = {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://spicy-rpc.chiliz.com',
    designCandidateAddress: process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS || '',
    governorAddress: process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS || '',
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
  };
  
  console.log('  rpcUrl:', config.rpcUrl);
  console.log('  designCandidateAddress:', config.designCandidateAddress);
  console.log('  governorAddress:', config.governorAddress);
  console.log('  privateKey exists:', !!config.privateKey);
  console.log('  privateKey length:', config.privateKey?.length);
  
  if (!config.privateKey) {
    console.error('❌ PRIVATE KEY IS MISSING!');
    console.log('💡 This explains why no signer is available for minting');
    return;
  }
  
  try {
    const ethersService = new EthersService(config);
    console.log('✅ EthersService created successfully');
    
    // Try a mint operation to test signer
    try {
      await ethersService.mintDesign(
        '0x6b0dFdD17Dc0ECA9f4802e2589F653e90F405B6C',
        'Singleton Test',
        'ipfs://singleton-test',
        false
      );
    } catch (mintError) {
      console.log('🔍 Mint attempt result:', mintError.message);
      
      if (mintError.message.includes('No signer available')) {
        console.error('❌ SIGNER INITIALIZATION FAILED');
        console.log('💡 Private key was passed but signer creation failed');
      } else {
        console.log('✅ Signer is available (got different error as expected)');
      }
    }
    
  } catch (serviceError) {
    console.error('❌ EthersService creation failed:', serviceError.message);
  }
  
  // Test 2: Test import of blockchain service singleton
  console.log('\n🧪 TEST 2: Import Blockchain Service Singleton');
  try {
    // This will trigger the singleton creation
    const blockchainModule = require('../src/lib/services/blockchain.service.ts');
    console.log('✅ Blockchain service module imported');
    
    if (blockchainModule.blockchainService) {
      console.log('✅ blockchainService singleton exists');
      
      // Test minting with the singleton
      try {
        await blockchainModule.blockchainService.mintDesignCandidate(
          '0x6b0dFdD17Dc0ECA9f4802e2589F653e90F405B6C',
          'Singleton Test Design',
          'ipfs://singleton-test-metadata',
          false
        );
      } catch (singletonError) {
        console.log('🔍 Singleton mint error:', singletonError.message);
        
        if (singletonError.message.includes('No signer available')) {
          console.error('❌ SINGLETON HAS NO SIGNER!');
          console.log('🔧 This is why your minting isn\'t working');
          console.log('💡 The singleton was created without the private key');
        } else {
          console.log('✅ Singleton signer works (different error expected)');
        }
      }
    } else {
      console.error('❌ blockchainService singleton not found');
    }
    
  } catch (importError) {
    console.error('❌ Failed to import blockchain service:', importError.message);
  }
}

testBlockchainServiceSingleton().catch(console.error); 