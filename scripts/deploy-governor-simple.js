require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    
    console.log("🏛️  SIMPLE GOVERNOR DEPLOYMENT");
    console.log("=============================");
    console.log("Deployer:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "CHZ");
    
    const designCandidateAddress = process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS;
    const chzTokenAddress = process.env.CHZ_TOKEN_ADDRESS;
    
    console.log("DesignCandidate:", designCandidateAddress);
    console.log("CHZ Token:", chzTokenAddress);
    
    if (!chzTokenAddress) {
      console.error("❌ CHZ_TOKEN_ADDRESS not found in .env");
      console.log("💡 Using a placeholder token address for now...");
      const placeholderToken = "0x60e920443CFeE01724874636465B9C4F08D7c482"; // Existing address
      console.log("Using placeholder:", placeholderToken);
    }
    
    // Conservative gas settings
    const gasPrice = ethers.parseUnits('3000', 'gwei');
    const gasOptions = {
      gasLimit: 800000, // Higher limit for Governor deployment
      gasPrice: gasPrice
    };
    
    console.log("⛽ Gas price:", ethers.formatUnits(gasPrice, 'gwei'), "gwei");
    console.log("💰 Estimated cost: ~2.4 CHZ");
    
    // Deploy Governor
    console.log("\n🏛️  Deploying KitraGovernor...");
    const KitraGovernor = await ethers.getContractFactory("KitraGovernor");
    
    const tokenToUse = chzTokenAddress || "0x60e920443CFeE01724874636465B9C4F08D7c482";
    
    const governor = await KitraGovernor.deploy(
      tokenToUse,
      designCandidateAddress,
      gasOptions
    );
    
    await governor.waitForDeployment();
    const governorAddress = await governor.getAddress();
    console.log("✅ KitraGovernor deployed to:", governorAddress);
    
    // Update environment
    console.log("\n📝 Add this to your .env:");
    console.log(`NEXT_PUBLIC_GOVERNOR_ADDRESS=${governorAddress}`);
    
    console.log("\n🌐 Explorer Link:");
    console.log(`Governor: https://testnet.chiliscan.com/address/${governorAddress}`);
    
    console.log("\n🎉 GOVERNOR DEPLOYMENT COMPLETE!");
    console.log("✅ Governor contract deployed");
    console.log("⚠️  Voting power will be limited without proper voting token");
    console.log("");
    console.log("💡 Next:");
    console.log("1. Update your .env with the Governor address above");
    console.log("2. Restart your development server");
    console.log("3. Test minting + voting (voting may have reduced functionality)");
    
    return governorAddress;
    
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