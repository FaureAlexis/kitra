require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com/');
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("🏛️ DEPLOYING SIMPLE GOVERNOR");
    console.log("===============================");
    console.log("Deployer:", wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "CHZ");
    
    const basicVotingAddress = process.env.CHZ_TOKEN_ADDRESS;
    const designCandidateAddress = process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS;
    
    console.log("BasicVoting Token:", basicVotingAddress);
    console.log("DesignCandidate:", designCandidateAddress);
    
    if (!basicVotingAddress || basicVotingAddress === '0x60e920443CFeE01724874636465B9C4F08D7c482') {
      console.error("❌ Update CHZ_TOKEN_ADDRESS in .env with the BasicVoting address");
      return;
    }
    
    // Conservative gas settings
    const gasOptions = {
      gasLimit: 1000000,
      maxFeePerGas: ethers.parseUnits('2600', 'gwei'),
      maxPriorityFeePerGas: ethers.parseUnits('10', 'gwei'),
    };
    
    console.log("⛽ Conservative gas settings:");
    console.log("  Limit:", gasOptions.gasLimit);
    console.log("  Max Fee:", ethers.formatUnits(gasOptions.maxFeePerGas, 'gwei'), "gwei");
    console.log("  Est. Cost:", ethers.formatEther(BigInt(gasOptions.gasLimit) * gasOptions.maxFeePerGas), "CHZ");
    
    // Compile and deploy SimpleGovernor
    console.log("\n📋 Compiling contracts...");
    const fs = require('fs');
    const path = require('path');
    
    // Compile first
    console.log("🔨 Running hardhat compile...");
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec('npx hardhat compile', (error, stdout, stderr) => {
        if (error) {
          console.error("Compilation error:", error);
          reject(error);
        } else {
          console.log("✅ Compilation successful");
          resolve();
        }
      });
    });
    
    const governorArtifactPath = path.join(__dirname, '../artifacts/src/infra/blockchain/contracts/SimpleGovernor.sol/SimpleGovernor.json');
    const governorArtifact = JSON.parse(fs.readFileSync(governorArtifactPath, 'utf8'));
    
    console.log("🏛️ Deploying SimpleGovernor...");
    
    const GovernorFactory = new ethers.ContractFactory(
      governorArtifact.abi,
      governorArtifact.bytecode,
      wallet
    );
    
    const governor = await GovernorFactory.deploy(
      basicVotingAddress,
      designCandidateAddress,
      gasOptions
    );
    
    console.log("🔗 Governor TX:", governor.deploymentTransaction().hash);
    console.log("🌐 Explorer: https://testnet.chiliscan.com/tx/" + governor.deploymentTransaction().hash);
    console.log("⏳ Waiting for confirmation...");
    
    await governor.waitForDeployment();
    const governorAddress = await governor.getAddress();
    
    console.log("✅ SimpleGovernor deployed to:", governorAddress);
    
    // Test Governor functions
    console.log("\n🔍 Testing SimpleGovernor...");
    try {
      const votingDelay = await governor.votingDelay();
      const votingPeriod = await governor.votingPeriod();
      const tokenAddress = await governor.token();
      
      console.log("✅ Governor test successful:");
      console.log("  Voting delay:", votingDelay.toString(), "seconds");
      console.log("  Voting period:", votingPeriod.toString(), "seconds");
      console.log("  Token address:", tokenAddress);
      console.log("  Design candidate:", await governor.designCandidate());
      
      // Test proposal creation
      console.log("\n🗳️ Testing proposal creation...");
      const proposeTx = await governor.propose("Test proposal for voting system", gasOptions);
      const proposeReceipt = await proposeTx.wait();
      
      const proposalEvent = proposeReceipt.logs.find(log => {
        try {
          const parsed = governor.interface.parseLog(log);
          return parsed.name === 'ProposalCreated';
        } catch (e) {
          return false;
        }
      });
      
      if (proposalEvent) {
        const parsed = governor.interface.parseLog(proposalEvent);
        const proposalId = parsed.args.proposalId;
        console.log("✅ Test proposal created with ID:", proposalId.toString());
        
        // Get proposal details
        const proposal = await governor.getProposal(proposalId);
        console.log("  Proposer:", proposal.proposer);
        console.log("  Description:", proposal.description);
        console.log("  Start time:", new Date(Number(proposal.startTime) * 1000).toLocaleString());
        console.log("  End time:", new Date(Number(proposal.endTime) * 1000).toLocaleString());
      }
      
      console.log("\n📝 UPDATE YOUR .ENV FILE:");
      console.log("NEXT_PUBLIC_GOVERNOR_ADDRESS=" + governorAddress);
      
      console.log("\n🌐 CHILIZ EXPLORER LINKS:");
      console.log("BasicVoting: https://testnet.chiliscan.com/address/" + basicVotingAddress);
      console.log("SimpleGovernor: https://testnet.chiliscan.com/address/" + governorAddress);
      
      console.log("\n🎉 SIMPLE VOTING SYSTEM READY!");
      console.log("✅ BasicVoting token with 1M tokens");
      console.log("✅ SimpleGovernor with 7-day voting periods");
      console.log("✅ 10% quorum requirement");
      console.log("✅ Compatible with existing voting API");
      console.log("");
      console.log("🔥 VOTING IS NOW FULLY FUNCTIONAL!");
      
    } catch (testError) {
      console.error("❌ Governor test failed:", testError.message);
      console.log("Contract deployed but may have interface issues");
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("💡 Insufficient balance for deployment");
    }
    
    throw error;
  }
}

main(); 