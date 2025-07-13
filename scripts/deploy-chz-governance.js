require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    
    console.log("🚀 CHZ-BASED GOVERNANCE DEPLOYMENT");
    console.log("==================================");
    console.log("Deployer:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "CHZ");
    
    const designCandidateAddress = process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS;
    console.log("DesignCandidate:", designCandidateAddress);
    
    // Conservative gas settings
    const gasPrice = ethers.parseUnits('3000', 'gwei');
    const gasOptions = {
      gasLimit: 300000,
      gasPrice: gasPrice
    };
    
    console.log("⛽ Gas price:", ethers.formatUnits(gasPrice, 'gwei'), "gwei");
    console.log("💰 Estimated cost per deployment: ~0.9 CHZ");
    
    // Step 1: Deploy CHZVotes
    console.log("\n📋 Step 1: Deploying CHZVotes...");
    const CHZVotes = await ethers.getContractFactory("CHZVotes");
    
    const votes = await CHZVotes.deploy(gasOptions);
    await votes.waitForDeployment();
    const votesAddress = await votes.getAddress();
    console.log("✅ CHZVotes deployed to:", votesAddress);
    
    // Self-delegate for voting power
    console.log("🗳️  Self-delegating voting power...");
    const delegateTx = await votes.selfDelegate(gasOptions);
    await delegateTx.wait();
    console.log("✅ Voting power activated");
    
    // Step 2: Deploy Governor
    console.log("\n🏛️  Step 2: Deploying KitraGovernor...");
    const KitraGovernor = await ethers.getContractFactory("KitraGovernor");
    
    const governor = await KitraGovernor.deploy(
      votesAddress,
      designCandidateAddress,
      gasOptions
    );
    
    await governor.waitForDeployment();
    const governorAddress = await governor.getAddress();
    console.log("✅ KitraGovernor deployed to:", governorAddress);
    
    // Step 3: Verify setup
    console.log("\n🔍 Verification...");
    const votingPower = await votes.getVotes(deployer.address);
    console.log("Your voting power:", ethers.formatEther(votingPower));
    
    // Step 4: Update environment
    console.log("\n📝 Add these to your .env:");
    console.log(`CHZ_TOKEN_ADDRESS=${votesAddress}`);
    console.log(`NEXT_PUBLIC_GOVERNOR_ADDRESS=${governorAddress}`);
    
    console.log("\n🌐 Explorer Links:");
    console.log(`CHZVotes: https://testnet.chiliscan.com/address/${votesAddress}`);
    console.log(`Governor: https://testnet.chiliscan.com/address/${governorAddress}`);
    
    console.log("\n🎉 GOVERNANCE DEPLOYMENT COMPLETE!");
    console.log("✅ Simple voting token deployed (no transfers, just voting)");
    console.log("✅ Governor contract deployed");
    console.log("✅ You have voting power activated");
    console.log("");
    console.log("💡 Next:");
    console.log("1. Update your .env with the addresses above");
    console.log("2. Restart your development server");
    console.log("3. Test the full mint + vote flow!");
    
    return { votesAddress, governorAddress };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("\n💡 Check balance: node scripts/check-pending-transactions.js");
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