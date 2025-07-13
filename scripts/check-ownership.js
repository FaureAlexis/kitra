const { ethers } = require('ethers');
require('dotenv').config();

async function checkOwnership() {
  console.log('🔍 CHECKING CONTRACT OWNERSHIP');
  console.log('='.repeat(50));
  
  const provider = new ethers.JsonRpcProvider(process.env.CHZ_RPC_URL);
  const designCandidateAddress = process.env.DESIGN_CANDIDATE_ADDRESS;
  
  if (!designCandidateAddress) {
    console.log('❌ DESIGN_CANDIDATE_ADDRESS not found in .env');
    return;
  }
  
  console.log('📋 Contract Address:', designCandidateAddress);
  
  const abi = [
    'function owner() view returns (address)',
    'function name() view returns (string)',
    'function symbol() view returns (string)'
  ];
  
  const contract = new ethers.Contract(designCandidateAddress, abi, provider);
  
  try {
    const owner = await contract.owner();
    const name = await contract.name();
    const symbol = await contract.symbol();
    
    console.log('📝 Contract Name:', name);
    console.log('🏷️  Symbol:', symbol);
    console.log('👤 Current Owner:', owner);
    
    // Get your address
    const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY);
    console.log('🔑 Your Address:', wallet.address);
    
    // Check governor addresses
    const governorAddress = process.env.GOVERNOR_ADDRESS || process.env.KITRA_GOVERNOR_ADDRESS;
    console.log('🏛️  Governor Address:', governorAddress || 'Not set');
    
    console.log('\n📊 OWNERSHIP ANALYSIS');
    console.log('-'.repeat(30));
    
    if (owner.toLowerCase() === wallet.address.toLowerCase()) {
      console.log('✅ You own the contract - minting should work');
    } else if (governorAddress && owner.toLowerCase() === governorAddress.toLowerCase()) {
      console.log('🏛️  Governor owns the contract - This is the problem!');
      console.log('💡 Solution: Need to either:');
      console.log('   1. Transfer ownership back to you');
      console.log('   2. Modify minting to go through governance');
      console.log('   3. Deploy new contract without governance transfer');
    } else {
      console.log('❓ Unknown owner - neither you nor governor');
    }
    
  } catch (error) {
    console.error('❌ Error checking ownership:', error.message);
  }
}

checkOwnership().catch(console.error); 