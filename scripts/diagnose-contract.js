const { ethers } = require("ethers");
require('dotenv').config();

async function diagnoseContract() {
  console.log("🔍 [DIAGNOSTICS] Starting contract diagnosis...");
  
  const RPC_URL = "https://spicy-rpc.chiliz.com";
  const CONTRACT_ADDRESS = "0xe9FC114E61E757FD0C83cC9d5F9811D17d17fFD5";
  const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
  
  if (!PRIVATE_KEY) {
    console.error("❌ Missing BLOCKCHAIN_PRIVATE_KEY environment variable");
    return;
  }
  
  try {
    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log("🌐 Network:", await provider.getNetwork());
    console.log("👤 Wallet address:", signer.address);
    
    // Check wallet balance
    const balance = await provider.getBalance(signer.address);
    console.log("💰 Wallet balance:", ethers.formatEther(balance), "CHZ");
    
    // Check if contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === "0x") {
      console.error("❌ No contract deployed at address:", CONTRACT_ADDRESS);
      return;
    }
    console.log("✅ Contract exists at address:", CONTRACT_ADDRESS);
    console.log("📄 Contract bytecode length:", code.length, "chars");
    
    // Try to get current gas price
    const feeData = await provider.getFeeData();
    console.log("⛽ Current network fees:", {
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') + ' gwei' : 'null',
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') + ' gwei' : 'null',
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') + ' gwei' : 'null'
    });
    
    // Test basic contract interaction with minimal ABI
    const minimalABI = [
      "function owner() view returns (address)",
      "function mintDesign(address to, string memory name, string memory tokenURI) external returns (uint256)",
      "function getDesignInfo(uint256 tokenId) external view returns (address designer, string memory name, uint256 mintTime, bool candidate, string memory tokenURI)",
      "event DesignMinted(uint256 indexed tokenId, address indexed designer, string name, string tokenURI)"
    ];
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, minimalABI, signer);
    
    // Test 1: Check owner
    try {
      const owner = await contract.owner();
      console.log("👑 Contract owner:", owner);
      console.log("🔐 Is signer owner?", owner.toLowerCase() === signer.address.toLowerCase());
    } catch (ownerError) {
      console.warn("⚠️ Could not read owner (might not exist):", ownerError.message);
    }
    
    // Test 2: Estimate gas for mint function
    try {
      console.log("🧮 Estimating gas for mintDesign...");
      const gasEstimate = await contract.mintDesign.estimateGas(
        signer.address,
        "Test Design",
        "ipfs://test-metadata-url"
      );
      console.log("✅ Gas estimate:", gasEstimate.toString());
      
      // Test 3: Try actual mint with super high gas
      console.log("🪙 Attempting test mint...");
             const tx = await contract.mintDesign(
         signer.address,
         "Diagnostic Test Design Ultra Priority",
         "ipfs://diagnostic-test-metadata-ultra",
         {
           gasLimit: 1000000,
           maxFeePerGas: ethers.parseUnits('6000', 'gwei'),
           maxPriorityFeePerGas: ethers.parseUnits('500', 'gwei')
         }
       );
      
      console.log("📤 Transaction sent:", tx.hash);
      console.log("⏳ Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);
      console.log("🎉 Mint successful! Block:", receipt.blockNumber);
      
    } catch (gasError) {
      console.error("❌ Gas estimation or minting failed:");
      console.error("Error code:", gasError.code);
      console.error("Error reason:", gasError.reason);
      console.error("Error message:", gasError.message);
      
      if (gasError.data) {
        console.error("Error data:", gasError.data);
      }
    }
    
  } catch (error) {
    console.error("❌ Diagnostic failed:", error);
  }
}

diagnoseContract().catch(console.error); 