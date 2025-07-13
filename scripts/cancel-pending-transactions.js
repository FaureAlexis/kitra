require('dotenv').config();
const { ethers } = require('ethers');

async function cancelPendingTransactions() {
  try {
    const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com/');
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('❌ BLOCKCHAIN_PRIVATE_KEY not found');
      return;
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const address = wallet.address;
    
    console.log('🔍 Checking account:', address);
    
    // Get current balance
    const balance = await provider.getBalance(address);
    console.log('💰 Current balance:', ethers.formatEther(balance), 'CHZ');
    
    // Get nonce information
    const networkNonce = await provider.getTransactionCount(address, 'latest');
    const pendingNonce = await provider.getTransactionCount(address, 'pending');
    const pendingCount = pendingNonce - networkNonce;
    
    console.log('📊 Network nonce (confirmed):', networkNonce);
    console.log('⏳ Pending nonce (with pending):', pendingNonce);
    console.log('🔄 Pending transactions count:', pendingCount);
    
    if (pendingCount === 0) {
      console.log('✅ No pending transactions to cancel');
      return;
    }
    
    console.log('\n🚨 Found', pendingCount, 'pending transactions to cancel');
    console.log('💡 Strategy: Send self-transfers with higher gas to replace pending txs');
    
    // Get current gas prices
    const feeData = await provider.getFeeData();
    const currentGasPrice = feeData.gasPrice || ethers.parseUnits('2501', 'gwei');
    
    // Use higher gas price to ensure replacement (150% of current)
    const replacementGasPrice = (currentGasPrice * BigInt(150)) / BigInt(100);
    console.log('⛽ Replacement gas price:', ethers.formatUnits(replacementGasPrice, 'gwei'), 'gwei');
    
    // Cancel each pending transaction
    const cancelTxs = [];
    for (let i = 0; i < pendingCount; i++) {
      const nonceToCancel = networkNonce + i;
      
      try {
        // Send minimal self-transfer with higher gas to replace the pending tx
        const cancelTx = await wallet.sendTransaction({
          to: address, // Send to self
          value: 0, // No value transfer
          nonce: nonceToCancel,
          gasLimit: 21000, // Minimal gas for simple transfer
          gasPrice: replacementGasPrice,
        });
        
        console.log(`🔄 Canceling nonce ${nonceToCancel}: ${cancelTx.hash}`);
        cancelTxs.push({ nonce: nonceToCancel, hash: cancelTx.hash });
        
        // Small delay to avoid RPC rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed to cancel nonce ${nonceToCancel}:`, error.message);
        
        // If we get insufficient funds, we can't continue
        if (error.code === 'INSUFFICIENT_FUNDS') {
          console.log('💸 Insufficient funds to continue canceling transactions');
          break;
        }
      }
    }
    
    if (cancelTxs.length > 0) {
      console.log('\n📊 Cancellation Summary:');
      cancelTxs.forEach(tx => {
        console.log(`Nonce ${tx.nonce}: ${tx.hash}`);
      });
      
      console.log('\n⏳ Waiting for cancellations to be mined...');
      console.log('💡 Check your wallet in a few minutes to see the updated balance');
    }
    
    // Calculate how much balance should be freed up
    const estimatedFreedBalance = BigInt(pendingCount) * replacementGasPrice * BigInt(21000);
    console.log('\n💰 Estimated balance to be freed:', ethers.formatEther(estimatedFreedBalance), 'CHZ');
    
  } catch (error) {
    console.error('❌ Error canceling transactions:', error.message);
  }
}

// Add confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  WARNING: This will cancel ALL pending transactions by replacing them with self-transfers.');
console.log('This will cost additional gas fees but should free up most of your balance.');
console.log('');
rl.question('Do you want to proceed? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    cancelPendingTransactions().finally(() => rl.close());
  } else {
    console.log('❌ Cancellation aborted');
    rl.close();
  }
}); 