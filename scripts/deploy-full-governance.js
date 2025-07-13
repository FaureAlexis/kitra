require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    const provider = deployer.provider;
    
    console.log("🚀 FULL GOVERNANCE DEPLOYMENT");
    console.log("===============================");
    console.log("Deployer:", deployer.address);
    
    const balance = await provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "CHZ");
    
    if (balance < ethers.parseEther("1")) {
      console.error("❌ Insufficient balance for deployment");
      return;
    }
    
    const designCandidateAddress = process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS;
    if (!designCandidateAddress) {
      console.error("❌ NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS not found");
      return;
    }
    
    console.log("🎯 DesignCandidate address:", designCandidateAddress);
    
    // Conservative gas settings
    const gasPrice = ethers.parseUnits('3000', 'gwei'); // Just above Chiliz minimum
    const gasOptions = {
      gasLimit: 300000,
      gasPrice: gasPrice
    };
    
    console.log("⛽ Gas price:", ethers.formatUnits(gasPrice, 'gwei'), "gwei");
    
    // Step 1: Deploy KitraToken
    console.log("\n📋 Step 1: Deploying KitraToken...");
    const KitraToken = await ethers.getContractFactory("KitraToken");
    
    const token = await KitraToken.deploy(
      "Kitra Governance Token",
      "KITRA",
      ethers.parseEther("1000000"), // 1M tokens
      gasOptions
    );
    
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ KitraToken deployed to:", tokenAddress);
    
    // Self-delegate for voting power
    console.log("🗳️  Self-delegating voting power...");
    const delegateTx = await token.delegate(deployer.address, gasOptions);
    await delegateTx.wait();
    console.log("✅ Voting power delegated");
    
    // Step 2: Deploy Governor
    console.log("\n🏛️  Step 2: Deploying KitraGovernor...");
    const KitraGovernor = await ethers.getContractFactory("KitraGovernor");
    
    const governor = await KitraGovernor.deploy(
      tokenAddress,
      designCandidateAddress,
      gasOptions
    );
    
    await governor.waitForDeployment();
    const governorAddress = await governor.getAddress();
    console.log("✅ KitraGovernor deployed to:", governorAddress);
    
    // Step 3: Verify deployment
    console.log("\n🔍 Verification...");
    
    const tokenName = await token.name();
    const tokenSymbol = await token.symbol();
    const voterBalance = await token.balanceOf(deployer.address);
    const votingPower = await token.getVotes(deployer.address);
    
    console.log("Token name:", tokenName);
    console.log("Token symbol:", tokenSymbol);
    console.log("Deployer token balance:", ethers.formatEther(voterBalance));
    console.log("Deployer voting power:", ethers.formatEther(votingPower));
    
    // Step 4: Update environment variables
    console.log("\n📝 Environment Variables:");
    console.log("Add these to your .env file:");
    console.log("");
    console.log(`CHZ_TOKEN_ADDRESS=${tokenAddress}`);
    console.log(`NEXT_PUBLIC_GOVERNOR_ADDRESS=${governorAddress}`);
    console.log(`KITRA_TOKEN_ADDRESS=${tokenAddress}`);
    console.log("");
    
    // Step 5: Explorer links
    console.log("🌐 Explorer Links:");
    console.log(`KitraToken: https://testnet.chiliscan.com/address/${tokenAddress}`);
    console.log(`KitraGovernor: https://testnet.chiliscan.com/address/${governorAddress}`);
    
    console.log("\n🎉 GOVERNANCE DEPLOYMENT COMPLETE!");
    console.log("✅ Token with voting capability deployed");
    console.log("✅ Governor contract deployed");
    console.log("✅ Voting power configured");
    console.log("");
    console.log("💡 Next steps:");
    console.log("1. Update your .env with the addresses above");
    console.log("2. Restart your development server");
    console.log("3. Test minting and voting in your app");
    
    return {
      tokenAddress,
      governorAddress,
      deploymentCost: ethers.formatEther(gasPrice * BigInt(600000)) // Rough estimate
    };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("\n💡 Solutions:");
      console.log("1. Wait for your pending transactions to clear");
      console.log("2. Get more CHZ from the faucet");
      console.log("3. Run: node scripts/check-pending-transactions.js");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 