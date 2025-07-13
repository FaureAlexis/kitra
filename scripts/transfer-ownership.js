const { ethers } = require('ethers');
require('dotenv').config();

async function transferOwnership() {
  console.log('🔄 TRANSFERRING DESIGNCANDIDATE OWNERSHIP');
  console.log('='.repeat(60));
  
  const provider = new ethers.JsonRpcProvider(process.env.CHZ_RPC_URL);
  const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
  
  const designCandidateAddress = process.env.DESIGN_CANDIDATE_ADDRESS;
  const governorAddress = process.env.GOVERNOR_ADDRESS || process.env.KITRA_GOVERNOR_ADDRESS;
  
  if (!designCandidateAddress) {
    console.error('❌ DESIGN_CANDIDATE_ADDRESS not found in .env');
    return;
  }
  
  if (!governorAddress) {
    console.error('❌ Governor address not found in .env');
    console.log('💡 Set GOVERNOR_ADDRESS or KITRA_GOVERNOR_ADDRESS in .env');
    return;
  }
  
  console.log('🏛️  Governor Address:', governorAddress);
  console.log('📋 DesignCandidate Address:', designCandidateAddress);
  console.log('🔑 Your Address:', wallet.address);
  
  // Check current ownership status
  console.log('\n🔍 CHECKING CURRENT OWNERSHIP');
  console.log('-'.repeat(40));
  
  const designCandidateAbi = [
    'function owner() view returns (address)',
    'function transferOwnership(address newOwner) external'
  ];
  
  const governorAbi = [
    'function owner() view returns (address)',
    'function updateDesignCandidate(address _designCandidate) external'
  ];
  
  const designContract = new ethers.Contract(designCandidateAddress, designCandidateAbi, provider);
  const governorContract = new ethers.Contract(governorAddress, governorAbi, wallet);
  
  try {
    const designOwner = await designContract.owner();
    const governorOwner = await governorContract.owner();
    
    console.log('📝 DesignCandidate owner:', designOwner);
    console.log('🏛️  Governor owner:', governorOwner);
    
    // Check if you own the Governor
    if (governorOwner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error('❌ You do not own the Governor contract!');
      console.log('💡 Current Governor owner:', governorOwner);
      console.log('💡 Your address:', wallet.address);
      return;
    }
    
    console.log('✅ You own the Governor contract');
    
    // Check if Governor owns DesignCandidate
    if (designOwner.toLowerCase() !== governorAddress.toLowerCase()) {
      console.log('⚠️  Governor does not own DesignCandidate');
      console.log('💡 Current DesignCandidate owner:', designOwner);
      
      if (designOwner.toLowerCase() === wallet.address.toLowerCase()) {
        console.log('✅ You already own DesignCandidate - no transfer needed!');
        return;
      } else {
        console.log('❌ Neither you nor Governor owns DesignCandidate');
        return;
      }
    }
    
    console.log('✅ Governor owns DesignCandidate - transfer is needed');
    
  } catch (error) {
    console.error('❌ Error checking ownership:', error.message);
    return;
  }
  
  // The problem: Governor contract doesn't have a function to transfer DesignCandidate ownership
  console.log('\n🚨 OWNERSHIP TRANSFER ISSUE');
  console.log('-'.repeat(40));
  console.log('❌ The Governor contract does not have a function to transfer');
  console.log('   DesignCandidate ownership back to you.');
  console.log('');
  console.log('💡 SOLUTIONS:');
  console.log('');
  console.log('1. 🚀 DEPLOY NEW CONTRACT (Recommended)');
  console.log('   - Deploy new DesignCandidate without governance');
  console.log('   - Keep ownership with your address');
  console.log('   - Run: node scripts/deploy-designcandidate-only.js');
  console.log('');
  console.log('2. 🔧 MODIFY CONTRACT (Requires redeployment)');
  console.log('   - Remove onlyOwner from mintDesign function');
  console.log('   - Allow public minting');
  console.log('');
  console.log('3. 🏛️  ADD GOVERNOR FUNCTION (Requires redeployment)');
  console.log('   - Add transferDesignCandidateOwnership function to Governor');
  console.log('   - Redeploy Governor contract');
  
  console.log('\n🎯 RECOMMENDED ACTION: Deploy new DesignCandidate');
  console.log('This will be fastest and cleanest solution.');
}

transferOwnership().catch(console.error); 