import { ethers } from 'ethers';
import { EthersService } from '@/infra/blockchain/ethers-service';

export interface BlockchainDesign {
  tokenId: number;
  designer: string;
  name: string;
  tokenURI: string;
  mintTime: number;
  isCandidate: boolean;
}

export interface VoteResult {
  transactionHash: string;
  weight: number;
  support: boolean;
}

class BlockchainService {
  private ethersService: EthersService | null = null;
  private isInitialized = false;

  constructor() {
    // Don't initialize immediately - wait for first method call
  }

  private ensureInitialized() {
    if (!this.isInitialized) {
      console.log('🔧 [BlockchainService] Lazy initializing with environment variables...');
      console.log('🔑 Private key available:', !!process.env.BLOCKCHAIN_PRIVATE_KEY);
      console.log('📋 Contract address:', process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS);
      
      if (!process.env.BLOCKCHAIN_PRIVATE_KEY) {
        throw new Error('BLOCKCHAIN_PRIVATE_KEY environment variable is required');
      }
      
      if (!process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS) {
        throw new Error('NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS environment variable is required');
      }
      
      this.ethersService = new EthersService({
        rpcUrl: 'https://spicy-rpc.chiliz.com/',
        designCandidateAddress: process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS,
        governorAddress: '', // Not needed for simplified voting
        privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY
      });
      
      this.isInitialized = true;
      console.log('✅ [BlockchainService] Initialized successfully');
    }
  }

  /**
   * Mint a new design candidate NFT
   */
  async mintDesignCandidate(
    designerAddress: string,
    designName: string,
    ipfsMetadataUrl: string,
    highPriority: boolean = false
  ): Promise<{ tokenId: number; transactionHash: string }> {
    this.ensureInitialized();
    console.log('🎨 [BlockchainService] Minting design candidate:', {
      designer: designerAddress.slice(0, 8) + '...',
      name: designName,
      ipfs: ipfsMetadataUrl.slice(0, 30) + '...',
      highPriority
    });

    const result = await this.ethersService!.mintDesign(
      designerAddress,
      designName,
      ipfsMetadataUrl,
      highPriority
    );

    console.log('✅ [BlockchainService] Design minted:', result);
    return result;
  }

  /**
   * Get design information from blockchain
   */
  async getDesignInfo(tokenId: number): Promise<BlockchainDesign> {
    this.ensureInitialized();
    console.log('🔍 [BlockchainService] Getting design info for token:', tokenId);

    const designInfo = await this.ethersService!.getDesignInfo(tokenId);
    
    const result: BlockchainDesign = {
      tokenId,
      designer: designInfo.designer,
      name: designInfo.name,
      tokenURI: designInfo.tokenURI,
      mintTime: designInfo.mintTime,
      isCandidate: designInfo.isCandidate
    };

    console.log('✅ [BlockchainService] Design info retrieved:', result);
    return result;
  }

  /**
   * Get all candidate designs from blockchain
   */
  async getCandidateDesigns(): Promise<BlockchainDesign[]> {
    this.ensureInitialized();
    console.log('🔍 [BlockchainService] Getting all candidate designs...');

    const candidateTokens = await this.ethersService!.getCandidateTokens();
    const designs: BlockchainDesign[] = [];

    for (const tokenId of candidateTokens) {
      try {
        const design = await this.getDesignInfo(tokenId);
        designs.push(design);
      } catch (error) {
        console.warn(`⚠️ [BlockchainService] Failed to get info for token ${tokenId}:`, error);
      }
    }

    console.log('✅ [BlockchainService] Found candidate designs:', designs.length);
    return designs;
  }

  /**
   * Get voting power for an address from BasicVoting token
   */
  async getVotingPower(address: string, blockNumber?: number): Promise<number> {
    this.ensureInitialized();
    console.log('🗳️ [BlockchainService] Getting voting power for:', address.slice(0, 8) + '...');

    const votingPower = await this.ethersService!.getVotingPower(address);
    console.log('✅ [BlockchainService] Voting power:', votingPower);
    return votingPower;
  }

  /**
   * Format blockchain address for display
   */
  formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Format token amount for display
   */
  formatTokenAmount(amount: string | number, decimals = 18): string {
    if (typeof amount === 'string') {
      return ethers.formatUnits(amount, decimals);
    }
    return amount.toString();
  }

  /**
   * Get current block number
   */
  async getCurrentBlock(): Promise<number> {
    this.ensureInitialized();
    const blockNumber = await this.ethersService!['provider'].getBlockNumber();
    console.log('📦 [BlockchainService] Current block:', blockNumber);
    return blockNumber;
  }

  /**
   * Start listening for blockchain events
   */
  startEventListeners(callbacks: {
    onDesignMinted?: (event: { tokenId: number; designer: string; name: string; tokenURI: string }) => void;
  }) {
    this.ensureInitialized();
    console.log('👂 [BlockchainService] Starting event listeners...');
    
    if (callbacks.onDesignMinted) {
      this.ethersService!.onDesignMinted(callbacks.onDesignMinted);
    }
  }

  /**
   * Stop event listeners
   */
  stopEventListeners() {
    if (this.ethersService) {
      console.log('🛑 [BlockchainService] Stopping event listeners...');
      this.ethersService.removeAllListeners();
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService(); 