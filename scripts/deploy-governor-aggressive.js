require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔥 AGGRESSIVE GOVERNOR DEPLOYMENT - Using competitive gas prices");
  console.log("=".repeat(60));
  
  // Get deployed DesignCandidate address
  const designCandidateAddress = process.env.DESIGN_CANDIDATE_ADDRESS || "0xa4eE05Fc206dFDfc9d9C9283347e0eD7558d0cC5";
  
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider;
  
  console.log("🔥 Aggressive Governor deployment:");
  console.log("  Deployer:", deployer.address);
  console.log("  DesignCandidate:", designCandidateAddress);
  
  const balance = await provider.getBalance(deployer.address);
  console.log("  Balance:", ethers.formatEther(balance), "CHZ");
  
  // Get current network conditions
  const feeData = await provider.getFeeData();
  const networkGasPrice = feeData.gasPrice || ethers.parseUnits('15', 'gwei');
  const networkNonce = await provider.getTransactionCount(deployer.address, "latest");
  const pendingNonce = await provider.getTransactionCount(deployer.address, "pending");
  
  console.log("  Network gas price:", ethers.formatUnits(networkGasPrice, 'gwei'), "Gwei");
  console.log("  Network nonce:", networkNonce);
  console.log("  Pending nonce:", pendingNonce);
  console.log("  Stuck transactions:", pendingNonce - networkNonce);
  
  // Use competitive gas price (60% of network price)
  const competitiveGasPrice = (networkGasPrice * 60n) / 100n;
  console.log("  Using competitive gas price:", ethers.formatUnits(competitiveGasPrice, 'gwei'), "Gwei");
  
  // Verify DesignCandidate exists
  console.log("\n🔍 VERIFYING PREREQUISITES");
  console.log("-".repeat(40));
  
  const designCode = await provider.getCode(designCandidateAddress);
  if (designCode === "0x") {
    console.error("❌ DesignCandidate contract not found at:", designCandidateAddress);
    process.exit(1);
  }
  console.log("✅ DesignCandidate contract found");
  
  // Check CHZ Token
  const chzTokenAddress = process.env.CHZ_TOKEN_ADDRESS;
  if (!chzTokenAddress) {
    console.error("❌ CHZ_TOKEN_ADDRESS not found in environment");
    console.log("Set CHZ_TOKEN_ADDRESS in .env file");
    process.exit(1);
  }
  
  const tokenCode = await provider.getCode(chzTokenAddress);
  if (tokenCode === "0x") {
    console.error("❌ CHZ token contract not found at:", chzTokenAddress);
    process.exit(1);
  }
  console.log("✅ CHZ token contract found");
  
  // Calculate cost
  const governorGasEstimate = 4000000;
  const deploymentCost = BigInt(governorGasEstimate) * competitiveGasPrice;
  console.log("✅ Estimated deployment cost:", ethers.formatEther(deploymentCost), "CHZ");
  
  if (deploymentCost > balance) {
    console.error("❌ Insufficient balance!");
    console.log("Need:", ethers.formatEther(deploymentCost), "CHZ");
    console.log("Have:", ethers.formatEther(balance), "CHZ");
    process.exit(1);
  }
  
  // Deploy Governor with aggressive settings
  console.log("\n🔥 DEPLOYING WITH COMPETITIVE GAS");
  console.log("-".repeat(40));
  
  const KitraGovernor = await ethers.getContractFactory("KitraGovernor");
  
  console.log("Using CHZ Token:", chzTokenAddress);
  
  const governor = await KitraGovernor.deploy(
    chzTokenAddress,
    designCandidateAddress,
    {
      gasLimit: governorGasEstimate,
      gasPrice: competitiveGasPrice,
      nonce: networkNonce, // Explicit nonce to handle pending transactions
    }
  );
  
  console.log("📋 Transaction hash:", governor.deploymentTransaction().hash);
  console.log("⏳ Waiting for confirmation (should be faster)...");
  
  const startTime = Date.now();
  await governor.waitForDeployment();
  const endTime = Date.now();
  
  const governorAddress = await governor.getAddress();
  console.log("✅ KitraGovernor deployed to:", governorAddress);
  console.log("⏱️  Deployment time:", Math.round((endTime - startTime) / 1000), "seconds");
  
  // Get actual cost
  const receipt = await provider.getTransactionReceipt(governor.deploymentTransaction().hash);
  if (receipt) {
    const actualCost = receipt.gasUsed * competitiveGasPrice;
    console.log("💰 Actual cost:", ethers.formatEther(actualCost), "CHZ");
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
  }
  
  // Test Governor functionality
  console.log("\n🧪 TESTING GOVERNOR");
  console.log("-".repeat(40));
  
  try {
    const votingDelay = await governor.votingDelay();
    const votingPeriod = await governor.votingPeriod();
    console.log("✅ Voting delay:", votingDelay.toString(), "blocks");
    console.log("✅ Voting period:", votingPeriod.toString(), "blocks");
  } catch (error) {
    console.log("⚠️  Could not test Governor:", error.message.split('(')[0]);
  }
  
  // Transfer ownership (if possible)
  console.log("\n🔐 TRANSFERRING OWNERSHIP");
  console.log("-".repeat(40));
  
  try {
    const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
    const designContract = DesignCandidate.attach(designCandidateAddress);
    
    const currentOwner = await designContract.owner();
    if (currentOwner.toLowerCase() === deployer.address.toLowerCase()) {
      const transferTx = await designContract.transferOwnership(governorAddress, {
        gasLimit: 100000,
        gasPrice: competitiveGasPrice,
        nonce: networkNonce + 1, // Next nonce
      });
      
      console.log("📋 Transfer transaction:", transferTx.hash);
      await transferTx.wait();
      console.log("✅ Ownership transferred to Governor");
    } else {
      console.log("⚠️  Not the owner, skipping ownership transfer");
    }
  } catch (error) {
    console.log("⚠️  Ownership transfer failed:", error.message.split('(')[0]);
  }
  
  // Check final status
  const newNetworkNonce = await provider.getTransactionCount(deployer.address, "latest");
  const newPendingNonce = await provider.getTransactionCount(deployer.address, "pending");
  
  console.log("\n📊 POST-DEPLOYMENT STATUS");
  console.log("-".repeat(40));
  console.log("Network nonce:", newNetworkNonce);
  console.log("Pending nonce:", newPendingNonce);
  console.log("Remaining stuck transactions:", newPendingNonce - newNetworkNonce);
  
  if (newPendingNonce > newNetworkNonce) {
    console.log("⚠️  Still have pending transactions");
  } else {
    console.log("✅ All transactions cleared!");
  }
  
  console.log("\n=== AGGRESSIVE DEPLOYMENT SUMMARY ===");
  console.log("DesignCandidate:", designCandidateAddress);
  console.log("KitraGovernor:", governorAddress);
  console.log("CHZ Token:", chzTokenAddress);
  console.log("Explorer:", `https://testnet.chiliscan.com/address/${governorAddress}`);
  
  console.log("\n🔧 Add to .env file:");
  console.log(`KITRA_GOVERNOR_ADDRESS=${governorAddress}`);
  console.log(`NEXT_PUBLIC_KITRA_GOVERNOR_ADDRESS=${governorAddress}`);
  
  return governorAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 AGGRESSIVE GOVERNOR DEPLOYMENT SUCCESS!");
    console.log("Governor address:", address);
    console.log("🚀 Ready for governance!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Aggressive deployment failed:", error);
    console.log("\n🔄 Try nuclear deployment if this fails repeatedly");
    process.exit(1);
  }); 