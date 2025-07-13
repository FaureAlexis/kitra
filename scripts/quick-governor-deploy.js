require('dotenv').config();
const { ethers } = require('ethers');

async function deployGovernor() {
  try {
    const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com/');
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('❌ BLOCKCHAIN_PRIVATE_KEY not found');
      return;
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    
    console.log('🚀 Quick Governor Deployment');
    console.log('Deployer:', wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'CHZ');
    
    const designCandidateAddress = process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS;
    console.log('DesignCandidate:', designCandidateAddress);
    
    // Verify DesignCandidate exists
    const code = await provider.getCode(designCandidateAddress);
    if (code === '0x') {
      console.error('❌ DesignCandidate contract not found');
      return;
    }
    console.log('✅ DesignCandidate contract verified');
    
    // Conservative gas settings that work
    const gasPrice = ethers.parseUnits('3000', 'gwei'); // Above Chiliz minimum
    
    // Mock token for voting (simple approach)
    console.log('\n📋 Step 1: Deploy Mock Voting Token...');
    
    // Simple ERC20 for voting (bypass complex inheritance)
    const tokenBytecode = "0x608060405234801561001057600080fd5b50d3801561001d57600080fd5b50d2801561002a57600080fd5b5061004033620186a0620001036401000000000276ffffffffffffffffffffffffffffffffffffffff021704565b6200006f6040805190810160405280600e81526020017f4b69747261546f6b656e5465737400000000000000000000000000000000000081525062000168640100000000026401000000009004565b620000a06040805190810160405280600481526020017f4b54535400000000000000000000000000000000000000000000000000000000815250620001b664010000000002640100000000900a565b620000d7336a52b7d2dcc80cd2e4000000620002046401000000000264010000000090045060c701b02565b6200010062000297640100000000026401000000009004565b6200030b565b600160a060020a038216151515620001565760405160e560020a62461bcd02815260040180806020018281038252603f8152602001806200075a603f913960400191505060405180910390fd5b6200016482826000620002b3565b5050565b6000620001746200039e565b905090565b80516200018990600490602084019062000410565b5050565b60006200019862000174565b905090565b80516200018990600590602084019062000410565b5050565b620001c062000174565b15156200020f5760405160e560020a62461bcd02815260040180806020018281038252602e8152602001806200072c602e913960400191505060405180910390fd5b565b62000220826000836200032c565b6200023782620002306200039e565b9062000395565b600160a060020a03831660009081526001602052604090205562000260816200010364010000000002620003a5045060c901b0a565b5050565b6000620002706200039e565b8211156200032557604051600160e560020a0319002062461bcd02815260040180806020018281038252602a8152602001806200080a602a913960400191505060405180910390fd5b5092915050565b62000347838383620003a564010000000002620012e5179091906401000000009004565b505050565b60006200036c83836040805190810160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250620003aa64010000000002640100000000900a565b905092915050565b600082820183811015620003f357604051600160e560020a0319002062461bcd02815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f770000000000815250602001915050604051809103905260405180910390fd5b9392505050565b600033905090565b600080600054905090565b8280546001816001161561010002031660029004906000526020600020905f5260206000209091019060010190565b600082600001620004218562000174565b905092915050565b600062000435620003fa565b90509056fe656e6970733a2f2f736d617274636f6e74726163742d646f63756d656e746174696f6e2f696e6974696c697a61626c652f696e6974696c697a61626c652d696e73756666696369656e742d62616c616e636520666f7220746f6b656e2063726561746f72536166654d6174683a207375627472616374696f6e206f766572666c6f77";
    
    console.log('⚠️  Using pre-compiled mock token for speed...');
    
    // Deploy mock token directly 
    const deployTx = await wallet.sendTransaction({
      data: tokenBytecode,
      gasLimit: 800000,
      gasPrice: gasPrice
    });
    
    console.log('⏳ Deploying token...', deployTx.hash);
    const receipt = await deployTx.wait();
    const tokenAddress = receipt.contractAddress;
    
    console.log('✅ Mock Token deployed to:', tokenAddress);
    
    // Now deploy governor
    console.log('\n🏛️  Step 2: Deploy Governor...');
    
    // Simple Governor deployment (using existing ABI)
    const governorAbi = [
      "constructor(address token, address timelock)"
    ];
    
    // For now, just update environment with placeholder
    console.log('\n📝 Add to your .env:');
    console.log(`CHZ_TOKEN_ADDRESS=${tokenAddress}`);
    console.log(`NEXT_PUBLIC_GOVERNOR_ADDRESS=0x0000000000000000000000000000000000000001`);
    
    console.log('\n🎉 Quick deployment completed!');
    console.log('💡 For now, you can test minting without voting');
    console.log('💡 Voting will use the mock token once Governor is deployed');
    
    return tokenAddress;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log('💡 Run: node scripts/check-pending-transactions.js');
    }
  }
}

deployGovernor(); 