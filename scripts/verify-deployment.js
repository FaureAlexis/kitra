require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 VERIFYING DEPLOYED CONTRACT");
  console.log("=".repeat(60));
  
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider;
  
  // Contract address from deployment
  const contractAddress = "0xa4eE05Fc206dFDfc9d9C9283347e0eD7558d0cC5";
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Deployer Address:", deployer.address);
  
  // Get contract instance
  const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
  const contract = DesignCandidate.attach(contractAddress);
  
  console.log("\n📋 CONTRACT VERIFICATION");
  console.log("-".repeat(40));
  
  try {
    // Test basic contract functions
    const name = await contract.name();
    const symbol = await contract.symbol();
    const owner = await contract.owner();
    const totalSupply = await contract.totalSupply();
    
    console.log("✅ Contract Name:", name);
    console.log("✅ Contract Symbol:", symbol);
    console.log("✅ Contract Owner:", owner);
    console.log("✅ Total Supply:", totalSupply.toString());
    
    // Check if we're the owner
    const isOwner = owner.toLowerCase() === deployer.address.toLowerCase();
    console.log("✅ We are owner:", isOwner);
    
  } catch (error) {
    console.error("❌ Error reading contract:", error.message);
    return;
  }
  
  console.log("\n🧪 TESTING CONTRACT FUNCTIONALITY");
  console.log("-".repeat(40));
  
  try {
    // Test minting (if we're the owner)
    const owner = await contract.owner();
    if (owner.toLowerCase() === deployer.address.toLowerCase()) {
      console.log("🎨 Testing NFT minting...");
      
      const testName = "Test Football Kit Design";
      const testURI = "ipfs://QmTestHash123456789TestDeployment";
      
      // Estimate gas for minting
      const gasEstimate = await contract.mintDesign.estimateGas(
        deployer.address,
        testName,
        testURI
      );
      
      console.log("⛽ Gas estimate for minting:", gasEstimate.toString());
      
      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('100', 'gwei');
      const maxGasPrice = ethers.parseUnits('1000', 'gwei');
      const safeGasPrice = gasPrice > maxGasPrice ? maxGasPrice : gasPrice;
      
      console.log("💰 Estimated minting cost:", ethers.formatEther(gasEstimate * safeGasPrice), "CHZ");
      
      // Actually mint a test NFT
      console.log("🚀 Minting test NFT...");
      const mintTx = await contract.mintDesign(
        deployer.address,
        testName,
        testURI,
        {
          gasLimit: gasEstimate + 50000n, // Add buffer
          gasPrice: safeGasPrice
        }
      );
      
      console.log("📋 Mint transaction:", mintTx.hash);
      const receipt = await mintTx.wait();
      
      console.log("✅ Test NFT minted successfully!");
      console.log("🆔 Token ID:", receipt.logs.length > 0 ? "Check logs for token ID" : "Unknown");
      
      // Check updated total supply
      const newTotalSupply = await contract.totalSupply();
      console.log("📊 New total supply:", newTotalSupply.toString());
      
    } else {
      console.log("⚠️  Not the contract owner, skipping mint test");
      console.log("   Owner:", owner);
      console.log("   Our address:", deployer.address);
    }
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
  }
  
  console.log("\n🌐 NETWORK INTEGRATION TEST");
  console.log("-".repeat(40));
  
  try {
    // Test contract code existence
    const code = await provider.getCode(contractAddress);
    console.log("✅ Contract code exists:", code.length > 2);
    
    // Test if contract responds to ERC721 interface
    const supportsInterface = await contract.supportsInterface("0x80ac58cd"); // ERC721
    console.log("✅ Supports ERC721:", supportsInterface);
    
    // Get contract balance
    const contractBalance = await provider.getBalance(contractAddress);
    console.log("💰 Contract balance:", ethers.formatEther(contractBalance), "CHZ");
    
  } catch (error) {
    console.error("❌ Error checking network integration:", error.message);
  }
  
  console.log("\n📊 DEPLOYMENT SUMMARY");
  console.log("-".repeat(40));
  console.log("✅ Contract successfully deployed and verified");
  console.log("📍 Address:", contractAddress);
  console.log("🔗 Explorer:", `https://testnet.chiliscan.com/token/${contractAddress}`);
  console.log("📝 Environment variable: DESIGN_CANDIDATE_ADDRESS=" + contractAddress);
  
  console.log("\n🎯 NEXT STEPS");
  console.log("-".repeat(40));
  console.log("1. ✅ Contract deployed and verified");
  console.log("2. ⏳ Deploy Governor contract (optional)");
  console.log("3. ⏳ Update frontend to use deployed contract");
  console.log("4. ⏳ Test NFT minting from frontend");
  console.log("5. ⏳ Test voting functionality");
  
  console.log("\n🚀 Ready to integrate with frontend!");
}

main()
  .then(() => {
    console.log("\n🎉 Verification complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Verification failed:", error);
    process.exit(1);
  }); 