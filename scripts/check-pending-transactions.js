require('dotenv').config();
const { ethers } = require('ethers');

async function checkPendingTransactions() {
  try {
    const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com/');
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('❌ BLOCKCHAIN_PRIVATE_KEY not found');
      console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('BLOCKCHAIN')));
      return;
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const address = wallet.address;
    
    console.log('🔍 Checking account:', address);
    
    // Get current balance
    const balance = await provider.getBalance(address);
    console.log('💰 Current balance:', ethers.formatEther(balance), 'CHZ');
    
    // Get current nonce from network (confirmed transactions)
    const networkNonce = await provider.getTransactionCount(address, 'latest');
    console.log('📊 Network nonce (confirmed):', networkNonce);
    
    // Get pending nonce (including pending transactions)
    const pendingNonce = await provider.getTransactionCount(address, 'pending');
    console.log('⏳ Pending nonce (with pending):', pendingNonce);
    
    const pendingCount = pendingNonce - networkNonce;
    console.log('🔄 Pending transactions count:', pendingCount);
    
    if (pendingCount > 0) {
      console.log('\n🚨 You have', pendingCount, 'pending transactions!');
      console.log('This is likely why you have insufficient funds.');
      console.log('Solutions:');
      console.log('1. Wait for pending transactions to complete');
      console.log('2. Cancel/replace them with higher gas fees');
      console.log('3. Use much lower gas settings for new transactions');
    } else {
      console.log('✅ No pending transactions found');
    }
    
    // Get recent block to check gas prices
    const feeData = await provider.getFeeData();
    console.log('\n⛽ Current network fees:');
    if (feeData.maxFeePerGas) {
      console.log('Max Fee Per Gas:', ethers.formatUnits(feeData.maxFeePerGas, 'gwei'), 'gwei');
    }
    if (feeData.maxPriorityFeePerGas) {
      console.log('Max Priority Fee:', ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei'), 'gwei');
    }
    if (feeData.gasPrice) {
      console.log('Gas Price:', ethers.formatUnits(feeData.gasPrice, 'gwei'), 'gwei');
    }
    
  } catch (error) {
    console.error('❌ Error checking transactions:', error.message);
  }
}

checkPendingTransactions(); 