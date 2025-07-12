import { ethers } from 'ethers';
import { EthersService } from '@/infra/blockchain/ethers-service';
import { useAccount } from 'wagmi';

export interface BlockchainDesign {
  tokenId: number;
  designer: string;
  name: string;
  tokenURI: string;
  mintTime: number;
  isCandidate: boolean;
}

export interface ProposalData {
  id: string;
  designTokenId: number;
  proposer: string;
  description: string;
  proposalType: 'approval' | 'rejection';
  state: number; // 0=Pending, 1=Active, 2=Canceled, 3=Defeated, 4=Succeeded, 5=Queued, 6=Expired, 7=Executed
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  startBlock: number;
  endBlock: number;
  createdAt: number;
}

export interface VoteResult {
  transactionHash: string;
  weight: number;
  support: boolean;
}

class BlockchainService {
  private ethersService: EthersService;
  private isInitialized = false;

  constructor() {
    // Initialize with environment variables
    this.ethersService = new EthersService({
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://spicy-rpc.chiliz.com',
      designCandidateAddress: process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS || '',
      governorAddress: process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS || '',
      privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY, // Only for server-side operations
    });
    this.isInitialized = true;
  }

  /**
   * Mint a new design as NFT candidate
   */
  async mintDesignCandidate(
    designerAddress: string,
    designName: string,
    ipfsMetadataUrl: string
  ): Promise<{ tokenId: number; transactionHash: string }> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    console.log('🔗 [Blockchain] Minting design NFT:', {
      designer: designerAddress,
      name: designName,
      metadataUrl: ipfsMetadataUrl
    });

    try {
      const result = await this.ethersService.mintDesign(
        designerAddress,
        designName,
        ipfsMetadataUrl
      );

      console.log('✅ [Blockchain] Design NFT minted:', {
        tokenId: result.tokenId,
        transactionHash: result.transactionHash
      });

      return result;
    } catch (error) {
      console.error('❌ [Blockchain] Failed to mint design NFT:', error);
      throw new Error('Failed to mint design NFT: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Get design information from blockchain
   */
  async getDesignInfo(tokenId: number): Promise<BlockchainDesign> {
    console.log('🔍 [Blockchain] Fetching design info for token:', tokenId);

    try {
      const info = await this.ethersService.getDesignInfo(tokenId);
      
      const design: BlockchainDesign = {
        tokenId,
        designer: info.designer,
        name: info.name,
        tokenURI: info.tokenURI,
        mintTime: info.mintTime,
        isCandidate: info.isCandidate
      };

      console.log('✅ [Blockchain] Design info retrieved:', {
        tokenId,
        name: design.name,
        designer: design.designer.slice(0, 8) + '...'
      });

      return design;
    } catch (error) {
      console.error('❌ [Blockchain] Failed to get design info:', error);
      throw new Error('Failed to get design info: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Get all candidate designs from blockchain
   */
  async getCandidateDesigns(): Promise<BlockchainDesign[]> {
    console.log('🔍 [Blockchain] Fetching all candidate designs');

    try {
      const tokenIds = await this.ethersService.getCandidateTokens();
      
      if (tokenIds.length === 0) {
        console.log('📭 [Blockchain] No candidate designs found');
        return [];
      }

      // Fetch info for each token
      const designs = await Promise.all(
        tokenIds.map(tokenId => this.getDesignInfo(tokenId))
      );

      console.log('✅ [Blockchain] Candidate designs retrieved:', {
        count: designs.length,
        tokenIds
      });

      return designs;
    } catch (error) {
      console.error('❌ [Blockchain] Failed to get candidate designs:', error);
      throw new Error('Failed to get candidate designs: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Create a proposal for design approval
   */
  async proposeDesignApproval(
    designTokenId: number,
    title: string,
    description: string
  ): Promise<{ proposalId: string; transactionHash: string }> {
    console.log('🗳️ [Blockchain] Creating approval proposal for design:', designTokenId);

    try {
      const result = await this.ethersService.proposeDesignApproval(
        designTokenId,
        `${title}: ${description}`
      );

      console.log('✅ [Blockchain] Approval proposal created:', {
        proposalId: result.proposalId,
        designTokenId,
        transactionHash: result.transactionHash
      });

      return result;
    } catch (error) {
      console.error('❌ [Blockchain] Failed to create approval proposal:', error);
      throw new Error('Failed to create proposal: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Cast a vote on a proposal
   */
  async castVote(
    proposalId: string,
    support: boolean,
    reason?: string
  ): Promise<VoteResult> {
    console.log('🗳️ [Blockchain] Casting vote:', {
      proposalId: proposalId.slice(0, 10) + '...',
      support,
      hasReason: !!reason
    });

    try {
      const result = await this.ethersService.castVote(proposalId, support, reason);

      console.log('✅ [Blockchain] Vote cast successfully:', {
        transactionHash: result.transactionHash,
        weight: result.weight,
        support
      });

      return {
        transactionHash: result.transactionHash,
        weight: result.weight,
        support
      };
    } catch (error) {
      console.error('❌ [Blockchain] Failed to cast vote:', error);
      throw new Error('Failed to cast vote: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Get proposal information
   */
  async getProposalState(proposalId: string): Promise<ProposalData> {
    console.log('🔍 [Blockchain] Fetching proposal state:', proposalId.slice(0, 10) + '...');

    try {
      const state = await this.ethersService.getProposalState(proposalId);

      const proposal: ProposalData = {
        id: proposalId,
        designTokenId: 0, // This would need to be stored/retrieved from proposal metadata
        proposer: '', // This would need to be stored/retrieved from proposal metadata
        description: '', // This would need to be stored/retrieved from proposal metadata
        proposalType: 'approval', // This would need to be stored/retrieved from proposal metadata
        state: state.state,
        votes: {
          for: state.votes.for,
          against: state.votes.against,
          abstain: state.votes.abstain
        },
        startBlock: state.snapshot,
        endBlock: state.deadline,
        createdAt: Date.now() // This would need to be stored/retrieved from proposal metadata
      };

      console.log('✅ [Blockchain] Proposal state retrieved:', {
        proposalId: proposalId.slice(0, 10) + '...',
        state: proposal.state,
        totalVotes: proposal.votes.for + proposal.votes.against + proposal.votes.abstain
      });

      return proposal;
    } catch (error) {
      console.error('❌ [Blockchain] Failed to get proposal state:', error);
      throw new Error('Failed to get proposal state: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Get voting power for an address
   */
  async getVotingPower(address: string, blockNumber?: number): Promise<number> {
    console.log('🔍 [Blockchain] Getting voting power for:', address.slice(0, 8) + '...');

    try {
      const power = await this.ethersService.getVotingPower(address, blockNumber);

      console.log('✅ [Blockchain] Voting power retrieved:', {
        address: address.slice(0, 8) + '...',
        power
      });

      return power;
    } catch (error) {
      console.error('❌ [Blockchain] Failed to get voting power:', error);
      throw new Error('Failed to get voting power: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Check if user has already voted on a proposal
   */
  async hasUserVoted(proposalId: string, voterAddress: string): Promise<boolean> {
    // This would need to be implemented by checking vote events or proposal state
    // For now, we'll return false
    console.log('🔍 [Blockchain] Checking if user has voted:', {
      proposalId: proposalId.slice(0, 10) + '...',
      voter: voterAddress.slice(0, 8) + '...'
    });

    try {
      // TODO: Implement actual vote checking logic
      // This could be done by:
      // 1. Querying vote events from the blockchain
      // 2. Maintaining a database of votes
      // 3. Using the governor contract's hasVoted function if available

      return false; // Placeholder
    } catch (error) {
      console.error('❌ [Blockchain] Failed to check vote status:', error);
      return false;
    }
  }

  /**
   * Start listening to blockchain events
   */
  startEventListeners(callbacks: {
    onDesignMinted?: (event: { tokenId: number; designer: string; name: string; tokenURI: string }) => void;
    onVoteCast?: (event: { voter: string; proposalId: string; support: number; weight: number; reason: string }) => void;
  }) {
    console.log('👂 [Blockchain] Starting event listeners');

    if (callbacks.onDesignMinted) {
      this.ethersService.onDesignMinted(callbacks.onDesignMinted);
    }

    if (callbacks.onVoteCast) {
      this.ethersService.onVoteCast(callbacks.onVoteCast);
    }
  }

  /**
   * Stop all event listeners
   */
  stopEventListeners() {
    console.log('🔇 [Blockchain] Stopping event listeners');
    this.ethersService.removeAllListeners();
  }

  /**
   * Utility function to format blockchain addresses
   */
  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Utility function to format token amounts
   */
  formatTokenAmount(amount: string | number, decimals = 18): string {
    const value = typeof amount === 'string' ? amount : amount.toString();
    return ethers.formatUnits(value, decimals);
  }

  /**
   * Get the current block number
   */
  async getCurrentBlock(): Promise<number> {
    try {
      // This would need to be implemented in the ethers service
      return Date.now(); // Placeholder
    } catch (error) {
      console.error('❌ [Blockchain] Failed to get current block:', error);
      throw new Error('Failed to get current block');
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

// Export the class for testing
export { BlockchainService }; 