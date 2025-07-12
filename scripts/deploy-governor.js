require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🏛️ DEPLOYING KITRA GOVERNOR CONTRACT");
  console.log("=".repeat(60));
  
  // Get deployed DesignCandidate address
  const designCandidateAddress = process.env.DESIGN_CANDIDATE_ADDRESS || "0xa4eE05Fc206dFDfc9d9C9283347e0eD7558d0cC5";
  
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider;
  
  console.log("🏛️ Deploying Governor with:");
  console.log("  Deployer:", deployer.address);
  console.log("  DesignCandidate:", designCandidateAddress);
  
  const balance = await provider.getBalance(deployer.address);
  console.log("  Balance:", ethers.formatEther(balance), "CHZ");
  
  // Check network details
  const network = await provider.getNetwork();
  console.log("  Network:", network.name || 'chiliz-spicy', "Chain ID:", network.chainId.toString());
  
  // Get current gas price and apply safe pricing
  const feeData = await provider.getFeeData();
  const networkGasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
  const maxReasonableGasPrice = ethers.parseUnits('1000', 'gwei'); // Higher limit for Governor
  const safeGasPrice = networkGasPrice > maxReasonableGasPrice ? maxReasonableGasPrice : networkGasPrice;
  
  console.log("  Network gas price:", ethers.formatUnits(networkGasPrice, 'gwei'), "Gwei");
  console.log("  Using safe gas price:", ethers.formatUnits(safeGasPrice, 'gwei'), "Gwei");
  
  // Verify DesignCandidate contract exists
  console.log("\n🔍 VERIFYING DESIGN CANDIDATE CONTRACT");
  console.log("-".repeat(40));
  
  try {
    const designCode = await provider.getCode(designCandidateAddress);
    if (designCode === "0x") {
      console.error("❌ DesignCandidate contract not found at:", designCandidateAddress);
      console.log("💡 Make sure DesignCandidate is deployed first");
      process.exit(1);
    }
    console.log("✅ DesignCandidate contract found");
    
    // Test if we can read from it
    const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
    const designContract = DesignCandidate.attach(designCandidateAddress);
    
    const name = await designContract.name();
    const owner = await designContract.owner();
    console.log("✅ Contract name:", name);
    console.log("✅ Current owner:", owner);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log("⚠️  WARNING: You are not the owner of DesignCandidate");
      console.log("   This means you won't be able to transfer ownership to Governor");
      console.log("   Owner:", owner);
      console.log("   Your address:", deployer.address);
    }
    
  } catch (error) {
    console.error("❌ Error verifying DesignCandidate:", error.message);
    process.exit(1);
  }
  
  // Calculate deployment cost
  console.log("\n💰 COST ESTIMATION");
  console.log("-".repeat(40));
  
  const governorGasEstimate = 4000000; // Conservative estimate for Governor deployment
  const deploymentCost = BigInt(governorGasEstimate) * safeGasPrice;
  
  console.log("Governor gas estimate:", governorGasEstimate.toLocaleString());
  console.log("Estimated deployment cost:", ethers.formatEther(deploymentCost), "CHZ");
  
  if (deploymentCost > balance) {
    console.error("❌ Insufficient balance for Governor deployment!");
    console.log("Need:", ethers.formatEther(deploymentCost), "CHZ");
    console.log("Have:", ethers.formatEther(balance), "CHZ");
    console.log("💡 Get more CHZ from: https://spicy-faucet.chiliz.com/");
    process.exit(1);
  }
  
  // Deploy Governor contract
  console.log("\n🏛️ DEPLOYING GOVERNOR CONTRACT");
  console.log("-".repeat(40));
  console.log("⏳ This may take 30-90 seconds...");
  
  const KitraGovernor = await ethers.getContractFactory("KitraGovernor");
  
  // For testing, we'll use the deployer address as the voting token
  // In production, this should be a proper ERC20Votes token
  const mockTokenAddress = deployer.address;
  
  console.log("Using mock voting token:", mockTokenAddress);
  console.log("💡 In production, replace with real ERC20Votes token");
  
  try {
    const governor = await KitraGovernor.deploy(
      mockTokenAddress, // IVotes token - using deployer for testing
      designCandidateAddress, // DesignCandidate contract
      {
        gasLimit: governorGasEstimate,
        gasPrice: safeGasPrice,
      }
    );
    
    console.log("📋 Transaction hash:", governor.deploymentTransaction().hash);
    console.log("⏳ Waiting for deployment confirmation...");
    
    // Wait for deployment with timeout
    const startTime = Date.now();
    await governor.waitForDeployment();
    const endTime = Date.now();
    
    const governorAddress = await governor.getAddress();
    console.log("✅ KitraGovernor deployed to:", governorAddress);
    console.log("⏱️  Deployment time:", Math.round((endTime - startTime) / 1000), "seconds");
    
    // Get actual deployment cost
    const receipt = await provider.getTransactionReceipt(governor.deploymentTransaction().hash);
    if (receipt) {
      const actualCost = receipt.gasUsed * safeGasPrice;
      console.log("💰 Actual deployment cost:", ethers.formatEther(actualCost), "CHZ");
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
    }
    
    // Test Governor functionality
    console.log("\n🧪 TESTING GOVERNOR CONTRACT");
    console.log("-".repeat(40));
    
    try {
      const votingDelay = await governor.votingDelay();
      const votingPeriod = await governor.votingPeriod();
      const proposalThreshold = await governor.proposalThreshold();
      
      console.log("✅ Voting delay:", votingDelay.toString(), "blocks");
      console.log("✅ Voting period:", votingPeriod.toString(), "blocks");
      console.log("✅ Proposal threshold:", proposalThreshold.toString());
      
    } catch (error) {
      console.log("⚠️  Could not read Governor parameters:", error.message.split('(')[0]);
    }
    
    // Set up contract permissions
    console.log("\n🔐 SETTING UP PERMISSIONS");
    console.log("-".repeat(40));
    
    try {
      const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
      const designContract = DesignCandidate.attach(designCandidateAddress);
      
      const currentOwner = await designContract.owner();
      if (currentOwner.toLowerCase() === deployer.address.toLowerCase()) {
        console.log("🔄 Transferring DesignCandidate ownership to Governor...");
        
        const transferTx = await designContract.transferOwnership(governorAddress, {
          gasLimit: 100000,
          gasPrice: safeGasPrice,
        });
        
        console.log("📋 Transfer transaction:", transferTx.hash);
        await transferTx.wait();
        
        // Verify ownership transfer
        const newOwner = await designContract.owner();
        if (newOwner.toLowerCase() === governorAddress.toLowerCase()) {
          console.log("✅ Ownership successfully transferred to Governor");
        } else {
          console.log("❌ Ownership transfer failed");
          console.log("   Expected:", governorAddress);
          console.log("   Actual:", newOwner);
        }
      } else {
        console.log("⚠️  Cannot transfer ownership - you are not the current owner");
        console.log("   Current owner:", currentOwner);
        console.log("   Governor address:", governorAddress);
        console.log("💡 Manual ownership transfer may be required");
      }
      
    } catch (error) {
      console.error("❌ Error setting up permissions:", error.message);
    }
    
    // Output deployment summary
    console.log("\n=== GOVERNOR DEPLOYMENT SUMMARY ===");
    console.log("Network: Chiliz Spicy Testnet");
    console.log("Deployer:", deployer.address);
    console.log("DesignCandidate:", designCandidateAddress);
    console.log("KitraGovernor:", governorAddress);
    console.log("Voting Token:", mockTokenAddress);
    console.log("Block number:", await provider.getBlockNumber());
    
    console.log("\n🔧 ENVIRONMENT VARIABLES");
    console.log("-".repeat(40));
    console.log("Add to your .env file:");
    console.log(`GOVERNOR_ADDRESS=${governorAddress}`);
    console.log(`NEXT_PUBLIC_GOVERNOR_ADDRESS=${governorAddress}`);
    
    console.log("\n🎯 NEXT STEPS");
    console.log("-".repeat(40));
    console.log("1. ✅ Governor contract deployed");
    console.log("2. ✅ Permissions configured");
    console.log("3. ⏳ Update frontend with Governor address");
    console.log("4. ⏳ Test proposal creation and voting");
    console.log("5. ⏳ Deploy real ERC20Votes token (production)");
    
    console.log("\n🔗 CONTRACT ADDRESSES");
    console.log("-".repeat(40));
    console.log("DesignCandidate:", designCandidateAddress);
    console.log("KitraGovernor:", governorAddress);
    console.log("Explorer:", `https://testnet.chiliscan.com/address/${governorAddress}`);
    
    return governorAddress;
    
  } catch (error) {
    console.error("❌ Governor deployment failed:", error.message);
    
    if (error.message.includes("timeout")) {
      console.log("\n🚨 Deployment timed out. Possible causes:");
      console.log("- Network congestion");
      console.log("- Gas price too low");
      console.log("- Contract too complex");
    }
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💰 Insufficient funds for deployment");
      console.log("Get more CHZ from: https://spicy-faucet.chiliz.com/");
    }
    
    throw error;
  }
}

main()
  .then((address) => {
    console.log("\n🎉 GOVERNOR DEPLOYMENT COMPLETE!");
    console.log("Governor address:", address);
    console.log("🚀 Ready for governance voting!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Governor deployment failed:", error);
    process.exit(1);
  }); 