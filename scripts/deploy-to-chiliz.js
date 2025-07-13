require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  try {
    // Connect directly to Chiliz testnet
    const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com/');
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('❌ BLOCKCHAIN_PRIVATE_KEY not found');
      return;
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("🚀 DEPLOYING TO CHILIZ TESTNET");
    console.log("==============================");
    console.log("Deployer:", wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "CHZ");
    
    const designCandidateAddress = process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS;
    console.log("DesignCandidate:", designCandidateAddress);
    
    if (balance < ethers.parseEther("2")) {
      console.error("❌ Need at least 2 CHZ for deployment");
      return;
    }
    
    // Higher gas limit for contract deployment
    const gasOptions = {
      gasLimit: 800000, // Much higher for deployment
      maxFeePerGas: ethers.parseUnits('3000', 'gwei'),
      maxPriorityFeePerGas: ethers.parseUnits('50', 'gwei'),
    };
    
    console.log("⛽ Gas settings:");
    console.log("  Gas limit:", gasOptions.gasLimit);
    console.log("  Max fee:", ethers.formatUnits(gasOptions.maxFeePerGas, 'gwei'), "gwei");
    console.log("💰 Max cost:", ethers.formatEther(BigInt(gasOptions.gasLimit) * gasOptions.maxFeePerGas), "CHZ");
    
    // Step 1: Deploy SimpleVotes with ABI
    console.log("\n📋 Step 1: Deploying SimpleVotes...");
    
    // SimpleVotes bytecode and ABI
    const simpleVotesAbi = [
      "constructor()",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function getVotes(address) view returns (uint256)",
      "function clock() view returns (uint48)",
      "function CLOCK_MODE() view returns (string)"
    ];
    
    // Get the compiled bytecode
    const fs = require('fs');
    const path = require('path');
    const artifactPath = path.join(__dirname, '../artifacts/src/infra/blockchain/contracts/SimpleVotes.sol/SimpleVotes.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    console.log("⏳ Deploying SimpleVotes token...");
    const deployTx = await wallet.sendTransaction({
      data: artifact.bytecode,
      ...gasOptions
    });
    
    console.log("🔗 Transaction hash:", deployTx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await deployTx.wait();
    const tokenAddress = receipt.contractAddress;
    
    console.log("✅ SimpleVotes deployed to:", tokenAddress);
    
    // Test token
    const token = new ethers.Contract(tokenAddress, simpleVotesAbi, wallet);
    const name = await token.name();
    const balance_tokens = await token.balanceOf(wallet.address);
    
    console.log("  Token name:", name);
    console.log("  Your balance:", ethers.formatEther(balance_tokens));
    console.log("  Your voting power:", ethers.formatEther(await token.getVotes(wallet.address)));
    
    // Step 2: Deploy Governor
    console.log("\n🏛️  Step 2: Deploying Governor...");
    
    const governorArtifactPath = path.join(__dirname, '../artifacts/src/infra/blockchain/contracts/Governor.sol/KitraGovernor.json');
    const governorArtifact = JSON.parse(fs.readFileSync(governorArtifactPath, 'utf8'));
    
    // Encode constructor parameters
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const constructorParams = abiCoder.encode(
      ['address', 'address'],
      [tokenAddress, designCandidateAddress]
    );
    
    console.log("⏳ Deploying Governor...");
    const governorDeployTx = await wallet.sendTransaction({
      data: governorArtifact.bytecode + constructorParams.slice(2),
      ...gasOptions
    });
    
    console.log("🔗 Transaction hash:", governorDeployTx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const governorReceipt = await governorDeployTx.wait();
    const governorAddress = governorReceipt.contractAddress;
    
    console.log("✅ Governor deployed to:", governorAddress);
    
    console.log("\n📝 UPDATE YOUR .ENV FILE:");
    console.log("CHZ_TOKEN_ADDRESS=" + tokenAddress);
    console.log("NEXT_PUBLIC_GOVERNOR_ADDRESS=" + governorAddress);
    
    console.log("\n🌐 CHILIZ EXPLORER:");
    console.log("Token: https://testnet.chiliscan.com/address/" + tokenAddress);
    console.log("Governor: https://testnet.chiliscan.com/address/" + governorAddress);
    
    console.log("\n🎉 REAL CONTRACTS DEPLOYED!");
    console.log("✅ SimpleVotes token on Chiliz testnet");
    console.log("✅ KitraGovernor on Chiliz testnet");
    console.log("✅ You have voting power");
    console.log("");
    console.log("🔥 YOUR APP NOW HAS REAL GOVERNANCE!");
    
    return { tokenAddress, governorAddress };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("💡 Check balance: node scripts/check-pending-transactions.js");
    }
    
    throw error;
  }
}

main(); 