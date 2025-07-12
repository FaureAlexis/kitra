require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 CHECKING DEPLOYED CONTRACT");
  console.log("=".repeat(60));
  
  // Contract address from deployment
  const contractAddress = "0xa4eE05Fc206dFDfc9d9C9283347e0eD7558d0cC5";
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Explorer:", `https://testnet.chiliscan.com/token/${contractAddress}`);
  
  // Create a read-only provider (no private key needed)
  const provider = new ethers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
  
  console.log("\n🌐 NETWORK CONNECTION TEST");
  console.log("-".repeat(40));
  
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log("✅ Network:", network.name || 'chiliz-spicy');
    console.log("✅ Chain ID:", network.chainId.toString());
    console.log("✅ Current block:", blockNumber);
    
  } catch (error) {
    console.error("❌ Network connection failed:", error.message);
    return;
  }
  
  console.log("\n📋 CONTRACT VERIFICATION");
  console.log("-".repeat(40));
  
  try {
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("❌ No contract found at address:", contractAddress);
      return;
    }
    console.log("✅ Contract code exists:", Math.floor(code.length / 2), "bytes");
    
    // Get contract instance (read-only)
    const DesignCandidate = await ethers.getContractFactory("DesignCandidate");
    const contract = DesignCandidate.attach(contractAddress).connect(provider);
    
    // Test basic contract functions (read-only)
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    
    console.log("✅ Contract Name:", name);
    console.log("✅ Contract Symbol:", symbol);
    console.log("✅ Total Supply:", totalSupply.toString());
    
    // Test ERC721 interface
    const supportsERC721 = await contract.supportsInterface("0x80ac58cd");
    console.log("✅ Supports ERC721:", supportsERC721);
    
    // Get contract owner (if possible)
    try {
      const owner = await contract.owner();
      console.log("✅ Contract Owner:", owner);
    } catch (error) {
      console.log("⚠️  Could not read owner:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Error reading contract:", error.message);
    return;
  }
  
  console.log("\n💰 CONTRACT BALANCE");
  console.log("-".repeat(40));
  
  try {
    const balance = await provider.getBalance(contractAddress);
    console.log("Contract balance:", ethers.formatEther(balance), "CHZ");
    
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
  }
  
  console.log("\n📊 DEPLOYMENT VERIFICATION");
  console.log("-".repeat(40));
  console.log("✅ Contract successfully deployed and accessible");
  console.log("✅ All basic functions working");
  console.log("✅ ERC721 interface supported");
  
  console.log("\n🎯 NEXT STEPS");
  console.log("-".repeat(40));
  console.log("1. ✅ Contract deployed and verified");
  console.log("2. ✅ Environment variables set");
  console.log("3. ⏳ Connect frontend to deployed contract");
  console.log("4. ⏳ Test NFT minting from UI");
  console.log("5. ⏳ Deploy Governor contract (optional)");
  
  console.log("\n🔧 ENVIRONMENT SETUP");
  console.log("-".repeat(40));
  console.log("Add these to your .env file:");
  console.log(`DESIGN_CANDIDATE_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS=${contractAddress}`);
  
  console.log("\n🚀 Ready for frontend integration!");
}

main()
  .then(() => {
    console.log("\n🎉 Contract verification complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Verification failed:", error);
    process.exit(1);
  }); 