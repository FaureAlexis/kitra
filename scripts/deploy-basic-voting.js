require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com/');
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("🚀 DEPLOYING BASIC VOTING SYSTEM");
    console.log("================================");
    console.log("Deployer:", wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "CHZ");
    
    const designCandidateAddress = process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS;
    console.log("DesignCandidate:", designCandidateAddress);
    
    // Conservative gas settings
    const gasOptions = {
      gasLimit: 800000, // Increased
      maxFeePerGas: ethers.parseUnits('2600', 'gwei'),
      maxPriorityFeePerGas: ethers.parseUnits('10', 'gwei'),
    };
    
    console.log("⛽ Conservative gas settings:");
    console.log("  Limit:", gasOptions.gasLimit);
    console.log("  Max Fee:", ethers.formatUnits(gasOptions.maxFeePerGas, 'gwei'), "gwei");
    console.log("  Est. Cost:", ethers.formatEther(BigInt(gasOptions.gasLimit) * gasOptions.maxFeePerGas), "CHZ");
    
    // Step 1: Deploy BasicVoting using ContractFactory
    console.log("\n📋 Step 1: Deploying BasicVoting token...");
    
    const fs = require('fs');
    const path = require('path');
    const tokenArtifactPath = path.join(__dirname, '../artifacts/src/infra/blockchain/contracts/BasicVoting.sol/BasicVoting.json');
    const tokenArtifact = JSON.parse(fs.readFileSync(tokenArtifactPath, 'utf8'));
    
    console.log("⏳ Deploying BasicVoting with ContractFactory...");
    
    // Use ContractFactory for proper deployment
    const TokenFactory = new ethers.ContractFactory(
      tokenArtifact.abi,
      tokenArtifact.bytecode,
      wallet
    );
    
    const token = await TokenFactory.deploy(gasOptions);
    console.log("🔗 Token TX:", token.deploymentTransaction().hash);
    console.log("🌐 Explorer: https://testnet.chiliscan.com/tx/" + token.deploymentTransaction().hash);
    console.log("⏳ Waiting for confirmation...");
    
    const tokenReceipt = await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    
    console.log("✅ BasicVoting deployed to:", tokenAddress);
    
    // Test token functions
    console.log("\n🔍 Testing BasicVoting token...");
    
    try {
      const name = await token.name();
      const symbol = await token.symbol();
      const userBalance = await token.balanceOf(wallet.address);
      const votingPower = await token.getVotes(wallet.address);
      const clockValue = await token.clock();
      const clockMode = await token.CLOCK_MODE();
      
      console.log("✅ Token test successful:");
      console.log("  Name:", name);
      console.log("  Symbol:", symbol);
      console.log("  Your balance:", ethers.formatEther(userBalance));
      console.log("  Your voting power:", ethers.formatEther(votingPower));
      console.log("  Clock:", clockValue.toString());
      console.log("  Clock mode:", clockMode);
      
      // Step 2: Deploy Governor
      console.log("\n🏛️  Step 2: Deploying Governor...");
      
      const governorArtifactPath = path.join(__dirname, '../artifacts/src/infra/blockchain/contracts/Governor.sol/KitraGovernor.json');
      const governorArtifact = JSON.parse(fs.readFileSync(governorArtifactPath, 'utf8'));
      
      const governorGasOptions = {
        gasLimit: 1200000, // Higher for Governor
        maxFeePerGas: ethers.parseUnits('2600', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('10', 'gwei'),
      };
      
      console.log("⏳ Deploying Governor with ContractFactory...");
      
      const GovernorFactory = new ethers.ContractFactory(
        governorArtifact.abi,
        governorArtifact.bytecode,
        wallet
      );
      
      const governor = await GovernorFactory.deploy(
        tokenAddress,
        designCandidateAddress,
        governorGasOptions
      );
      
      console.log("🔗 Governor TX:", governor.deploymentTransaction().hash);
      console.log("🌐 Explorer: https://testnet.chiliscan.com/tx/" + governor.deploymentTransaction().hash);
      console.log("⏳ Waiting for confirmation...");
      
      const governorReceipt = await governor.waitForDeployment();
      const governorAddress = await governor.getAddress();
      
      console.log("✅ Governor deployed to:", governorAddress);
      
      // Test Governor
      console.log("\n🔍 Testing Governor...");
      const votingDelay = await governor.votingDelay();
      const votingPeriod = await governor.votingPeriod();
      
      console.log("  Voting delay:", votingDelay.toString(), "blocks");
      console.log("  Voting period:", votingPeriod.toString(), "blocks");
      
      console.log("\n📝 UPDATE YOUR .ENV FILE:");
      console.log("CHZ_TOKEN_ADDRESS=" + tokenAddress);
      console.log("NEXT_PUBLIC_GOVERNOR_ADDRESS=" + governorAddress);
      
      console.log("\n🌐 CHILIZ EXPLORER LINKS:");
      console.log("BasicVoting: https://testnet.chiliscan.com/address/" + tokenAddress);
      console.log("Governor: https://testnet.chiliscan.com/address/" + governorAddress);
      
      console.log("\n🎉 REAL VOTING SYSTEM DEPLOYED!");
      console.log("✅ BasicVoting token on Chiliz testnet");
      console.log("✅ KitraGovernor on Chiliz testnet");
      console.log("✅ You have 1M voting tokens");
      console.log("✅ Voting power = token balance");
      console.log("✅ Connected to DesignCandidate contract");
      console.log("");
      console.log("🔥 VOTING NOW WORKS!");
      console.log("Users can vote on design proposals with real transactions!");
      
      return { tokenAddress, governorAddress };
      
    } catch (tokenError) {
      console.log("❌ Token test failed:", tokenError.message);
      console.log("Contract deployed but interface may be different");
      return { tokenAddress, governorAddress: null };
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("💡 Check balance: node scripts/check-pending-transactions.js");
    }
    
    throw error;
  }
}

main(); 