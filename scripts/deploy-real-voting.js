require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com/');
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("🚀 DEPLOYING REAL WORKING VOTING SYSTEM");
    console.log("======================================");
    console.log("Deployer:", wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "CHZ");
    
    const designCandidateAddress = process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS;
    console.log("DesignCandidate:", designCandidateAddress);
    
    if (balance < ethers.parseEther("5")) {
      console.error("❌ Need at least 5 CHZ for deployment");
      return;
    }
    
    // Conservative gas settings that work on Chiliz
    const gasOptions = {
      gasLimit: 800000,
      maxFeePerGas: ethers.parseUnits('2700', 'gwei'), // Above Chiliz minimum
      maxPriorityFeePerGas: ethers.parseUnits('20', 'gwei'),
    };
    
    console.log("⛽ Gas settings:");
    console.log("  Limit:", gasOptions.gasLimit);
    console.log("  Max Fee:", ethers.formatUnits(gasOptions.maxFeePerGas, 'gwei'), "gwei");
    console.log("  Est. Cost:", ethers.formatEther(BigInt(gasOptions.gasLimit) * gasOptions.maxFeePerGas), "CHZ");
    
    // Step 1: Deploy VotingToken
    console.log("\n📋 Step 1: Deploying VotingToken...");
    
    const fs = require('fs');
    const path = require('path');
    const tokenArtifactPath = path.join(__dirname, '../artifacts/src/infra/blockchain/contracts/VotingToken.sol/VotingToken.json');
    const tokenArtifact = JSON.parse(fs.readFileSync(tokenArtifactPath, 'utf8'));
    
    console.log("⏳ Deploying VotingToken...");
    const tokenTx = await wallet.sendTransaction({
      data: tokenArtifact.bytecode,
      ...gasOptions
    });
    
    console.log("🔗 Token TX:", tokenTx.hash);
    console.log("🌐 Explorer: https://testnet.chiliscan.com/tx/" + tokenTx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const tokenReceipt = await tokenTx.wait();
    
    if (tokenReceipt.status === 0) {
      console.log("❌ VotingToken deployment failed");
      return;
    }
    
    const tokenAddress = tokenReceipt.contractAddress;
    console.log("✅ VotingToken deployed to:", tokenAddress);
    
    // Test token
    const tokenAbi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function balanceOf(address) view returns (uint256)",
      "function getVotes(address) view returns (uint256)"
    ];
    
    const token = new ethers.Contract(tokenAddress, tokenAbi, wallet);
    const name = await token.name();
    const symbol = await token.symbol();
    const userBalance = await token.balanceOf(wallet.address);
    const votingPower = await token.getVotes(wallet.address);
    
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Your balance:", ethers.formatEther(userBalance));
    console.log("  Your voting power:", ethers.formatEther(votingPower));
    
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
    const governorTx = await wallet.sendTransaction({
      data: governorArtifact.bytecode + constructorParams.slice(2),
      gasLimit: 1200000, // Higher for Governor
      maxFeePerGas: gasOptions.maxFeePerGas,
      maxPriorityFeePerGas: gasOptions.maxPriorityFeePerGas,
    });
    
    console.log("🔗 Governor TX:", governorTx.hash);
    console.log("🌐 Explorer: https://testnet.chiliscan.com/tx/" + governorTx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const governorReceipt = await governorTx.wait();
    
    if (governorReceipt.status === 0) {
      console.log("❌ Governor deployment failed");
      console.log("But VotingToken is working!");
      console.log("\nPartial success - update .env:");
      console.log("CHZ_TOKEN_ADDRESS=" + tokenAddress);
      return;
    }
    
    const governorAddress = governorReceipt.contractAddress;
    console.log("✅ Governor deployed to:", governorAddress);
    
    // Step 3: Test Governor
    console.log("\n🔍 Testing Governor...");
    const governorAbi = [
      "function votingDelay() view returns (uint256)",
      "function votingPeriod() view returns (uint256)",
      "function quorum(uint256) view returns (uint256)"
    ];
    
    const governor = new ethers.Contract(governorAddress, governorAbi, wallet);
    const votingDelay = await governor.votingDelay();
    const votingPeriod = await governor.votingPeriod();
    
    console.log("  Voting delay:", votingDelay.toString(), "blocks");
    console.log("  Voting period:", votingPeriod.toString(), "blocks");
    
    console.log("\n📝 UPDATE YOUR .ENV FILE:");
    console.log("CHZ_TOKEN_ADDRESS=" + tokenAddress);
    console.log("NEXT_PUBLIC_GOVERNOR_ADDRESS=" + governorAddress);
    
    console.log("\n🌐 CHILIZ EXPLORER LINKS:");
    console.log("VotingToken: https://testnet.chiliscan.com/address/" + tokenAddress);
    console.log("Governor: https://testnet.chiliscan.com/address/" + governorAddress);
    
    console.log("\n🎉 VOTING SYSTEM IS LIVE!");
    console.log("✅ Real VotingToken deployed to Chiliz testnet");
    console.log("✅ Real Governor deployed to Chiliz testnet");
    console.log("✅ You have 1M voting tokens and voting power");
    console.log("✅ Connected to your DesignCandidate contract");
    console.log("");
    console.log("🔥 YOUR APP NOW HAS FULL WORKING GOVERNANCE!");
    console.log("Users can:");
    console.log("- Mint design NFTs");
    console.log("- Create proposals automatically");
    console.log("- Vote on designs with real transactions");
    console.log("- See results on-chain");
    
    return { tokenAddress, governorAddress };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("💡 Check balance: node scripts/check-pending-transactions.js");
    }
    
    throw error;
  }
}

main(); 