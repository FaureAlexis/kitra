require('dotenv').config();
const { ethers } = require('ethers');

async function checkToken() {
  try {
    const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com/');
    const tokenAddress = process.env.CHZ_TOKEN_ADDRESS;
    
    console.log('🔍 Checking token at:', tokenAddress);
    
    // Check if contract exists
    const code = await provider.getCode(tokenAddress);
    if (code === '0x') {
      console.log('❌ No contract found at this address');
      return;
    }
    
    console.log('✅ Contract exists');
    
    // Try basic ERC20 interface
    const erc20Abi = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
    ];
    
    const erc20 = new ethers.Contract(tokenAddress, erc20Abi, provider);
    
    try {
      const name = await erc20.name();
      const symbol = await erc20.symbol();
      const decimals = await erc20.decimals();
      const supply = await erc20.totalSupply();
      
      console.log('📋 Token info:');
      console.log('  Name:', name);
      console.log('  Symbol:', symbol);
      console.log('  Decimals:', decimals);
      console.log('  Total Supply:', ethers.formatUnits(supply, decimals));
    } catch (error) {
      console.log('❌ Failed to read ERC20 info:', error.message);
    }
    
    // Try voting interface
    const votingAbi = [
      'function clock() view returns (uint48)',
      'function CLOCK_MODE() view returns (string)',
      'function delegates(address account) view returns (address)',
      'function getVotes(address account) view returns (uint256)',
    ];
    
    const voting = new ethers.Contract(tokenAddress, votingAbi, provider);
    
    try {
      const clock = await voting.clock();
      console.log('✅ Has voting interface');
      console.log('  Clock:', clock.toString());
      
      const clockMode = await voting.CLOCK_MODE();
      console.log('  Clock Mode:', clockMode);
    } catch (error) {
      console.log('❌ No voting interface:', error.message);
      console.log('💡 This token cannot be used for governance');
      console.log('💡 Need to deploy a proper ERC20Votes token');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkToken(); 