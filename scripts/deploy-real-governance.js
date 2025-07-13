require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    
    console.log("🚀 REAL GOVERNANCE DEPLOYMENT TO CHILIZ TESTNET");
    console.log("===============================================");
    console.log("Deployer:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "CHZ");
    
    const designCandidateAddress = process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS;
    console.log("DesignCandidate:", designCandidateAddress);
    
    if (balance < ethers.parseEther("3")) {
      console.error("❌ Insufficient balance for deployment (need ~3 CHZ)");
      return;
    }
    
    // Optimized gas settings for Chiliz
    const gasOptions = {
      gasLimit: 300000,
      maxFeePerGas: ethers.parseUnits('3200', 'gwei'), // Above Chiliz minimum
      maxPriorityFeePerGas: ethers.parseUnits('100', 'gwei'),
    };
    
    console.log("⛽ Gas settings:");
    console.log("  Max Fee:", ethers.formatUnits(gasOptions.maxFeePerGas, 'gwei'), "gwei");
    console.log("  Priority Fee:", ethers.formatUnits(gasOptions.maxPriorityFeePerGas, 'gwei'), "gwei");
    console.log("💰 Estimated total cost: ~1.0 CHZ");
    
    // Step 1: Deploy SimpleVotes token
    console.log("\n📋 Step 1: Deploying SimpleVotes token...");
    const SimpleVotes = await ethers.getContractFactory("SimpleVotes");
    
    const token = await SimpleVotes.deploy(gasOptions);
    console.log("⏳ Transaction sent:", token.deploymentTransaction().hash);
    
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ SimpleVotes deployed to:", tokenAddress);
    
    // Verify token works
    const tokenName = await token.name();
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log("  Token name:", tokenName);
    console.log("  Deployer balance:", ethers.formatEther(deployerBalance));
    
    // Step 2: Deploy Governor
    console.log("\n🏛️  Step 2: Deploying KitraGovernor...");
    const KitraGovernor = await ethers.getContractFactory("KitraGovernor");
    
    const governor = await KitraGovernor.deploy(
      tokenAddress,
      designCandidateAddress,
      gasOptions
    );
    console.log("⏳ Transaction sent:", governor.deploymentTransaction().hash);
    
    await governor.waitForDeployment();
    const governorAddress = await governor.getAddress();
    console.log("✅ KitraGovernor deployed to:", governorAddress);
    
    // Step 3: Verify Governor works
    console.log("\n🔍 Verification...");
    const votingDelay = await governor.votingDelay();
    const votingPeriod = await governor.votingPeriod();
    console.log("  Voting delay:", votingDelay.toString(), "blocks");
    console.log("  Voting period:", votingPeriod.toString(), "blocks");
    
    // Step 4: Get voting power
    const votingPower = await token.getVotes(deployer.address);
    console.log("  Your voting power:", ethers.formatEther(votingPower));
    
    console.log("\n📝 UPDATE YOUR .ENV FILE:");
    console.log("CHZ_TOKEN_ADDRESS=" + tokenAddress);
    console.log("NEXT_PUBLIC_GOVERNOR_ADDRESS=" + governorAddress);
    
    console.log("\n🌐 EXPLORER LINKS:");
    console.log("SimpleVotes: https://testnet.chiliscan.com/address/" + tokenAddress);
    console.log("Governor: https://testnet.chiliscan.com/address/" + governorAddress);
    
    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("✅ Real voting token deployed to Chiliz testnet");
    console.log("✅ Real Governor contract deployed to Chiliz testnet");
    console.log("✅ You have 1M voting tokens and voting power");
    console.log("");
    console.log("🔥 NEXT STEPS:");
    console.log("1. Update your .env with the addresses above");
    console.log("2. Restart your development server");
    console.log("3. Test the REAL mint + vote flow!");
    console.log("");
    console.log("⚡ Your app now has full on-chain governance!");
    
    return { tokenAddress, governorAddress };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("\n💡 Solutions:");
      console.log("1. Check: node scripts/check-pending-transactions.js");
      console.log("2. Get more CHZ from faucet if needed");
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