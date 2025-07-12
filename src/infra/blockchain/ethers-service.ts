import { ethers } from "ethers";
import { DesignEntity } from "@/domain/models/Design";
import { VoteEntity } from "@/domain/models/Vote";

// Contract ABIs - In production, these should be imported from generated types
const DESIGN_CANDIDATE_ABI = [
  "function mintDesign(address to, string memory name, string memory tokenURI) external returns (uint256)",
  "function getDesignInfo(uint256 tokenId) external view returns (address designer, string memory name, uint256 mintTime, bool candidate, string memory tokenURI)",
  "function getCandidateTokens() external view returns (uint256[] memory)",
  "function setCandidateStatus(uint256 tokenId, bool _isCandidate) external",
  "event DesignMinted(uint256 indexed tokenId, address indexed designer, string name, string tokenURI)",
  "event CandidateStatusChanged(uint256 indexed tokenId, bool isCandidate)"
];

const GOVERNOR_ABI = [
  "function proposeDesignApproval(uint256 designTokenId, string memory description) external returns (uint256)",
  "function proposeDesignRejection(uint256 designTokenId, string memory description) external returns (uint256)",
  "function castVote(uint256 proposalId, uint8 support) external returns (uint256)",
  "function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason) external returns (uint256)",
  "function getVotes(address account, uint256 blockNumber) external view returns (uint256)",
  "function proposalSnapshot(uint256 proposalId) external view returns (uint256)",
  "function proposalDeadline(uint256 proposalId) external view returns (uint256)",
  "function state(uint256 proposalId) external view returns (uint8)",
  "function proposalVotes(uint256 proposalId) external view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)",
  "event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)"
];

export interface BlockchainConfig {
  rpcUrl: string;
  designCandidateAddress: string;
  governorAddress: string;
  privateKey?: string;
}

export class EthersService {
  private provider: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;
  private designCandidateContract: ethers.Contract;
  private governorContract: ethers.Contract;

  constructor(config: BlockchainConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }

    this.designCandidateContract = new ethers.Contract(
      config.designCandidateAddress,
      DESIGN_CANDIDATE_ABI,
      this.signer || this.provider
    );

    this.governorContract = new ethers.Contract(
      config.governorAddress,
      GOVERNOR_ABI,
      this.signer || this.provider
    );
  }

  /**
   * Mint a design NFT
   */
  async mintDesign(
    to: string,
    name: string,
    tokenURI: string
  ): Promise<{ tokenId: number; transactionHash: string }> {
    if (!this.signer) {
      throw new Error("No signer available for minting");
    }

    try {
      const tx = await this.designCandidateContract.mintDesign(to, name, tokenURI);
      const receipt = await tx.wait();
      
      // Extract token ID from event
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id("DesignMinted(uint256,address,string,string)")
      );
      
      if (!event) {
        throw new Error("DesignMinted event not found");
      }

      const tokenId = parseInt(event.topics[1], 16);
      
      return {
        tokenId,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error("Error minting design:", error);
      throw new Error("Failed to mint design");
    }
  }

  /**
   * Get design information
   */
  async getDesignInfo(tokenId: number): Promise<{
    designer: string;
    name: string;
    mintTime: number;
    isCandidate: boolean;
    tokenURI: string;
  }> {
    try {
      const result = await this.designCandidateContract.getDesignInfo(tokenId);
      return {
        designer: result[0],
        name: result[1],
        mintTime: parseInt(result[2].toString()),
        isCandidate: result[3],
        tokenURI: result[4]
      };
    } catch (error) {
      console.error("Error getting design info:", error);
      throw new Error("Failed to get design info");
    }
  }

  /**
   * Get all candidate tokens
   */
  async getCandidateTokens(): Promise<number[]> {
    try {
      const tokens = await this.designCandidateContract.getCandidateTokens();
      return tokens.map((token: any) => parseInt(token.toString()));
    } catch (error) {
      console.error("Error getting candidate tokens:", error);
      throw new Error("Failed to get candidate tokens");
    }
  }

  /**
   * Propose design approval
   */
  async proposeDesignApproval(
    designTokenId: number,
    description: string
  ): Promise<{ proposalId: string; transactionHash: string }> {
    if (!this.signer) {
      throw new Error("No signer available for proposing");
    }

    try {
      const tx = await this.governorContract.proposeDesignApproval(
        designTokenId,
        description
      );
      const receipt = await tx.wait();
      
      // Extract proposal ID from event
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id("ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)")
      );
      
      if (!event) {
        throw new Error("ProposalCreated event not found");
      }

      const proposalId = event.topics[1];
      
      return {
        proposalId,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error("Error proposing design approval:", error);
      throw new Error("Failed to propose design approval");
    }
  }

  /**
   * Cast a vote
   */
  async castVote(
    proposalId: string,
    support: boolean,
    reason?: string
  ): Promise<{ transactionHash: string; weight: number }> {
    if (!this.signer) {
      throw new Error("No signer available for voting");
    }

    try {
      const supportValue = support ? 1 : 0; // 0 = Against, 1 = For, 2 = Abstain
      
      let tx;
      if (reason) {
        tx = await this.governorContract.castVoteWithReason(
          proposalId,
          supportValue,
          reason
        );
      } else {
        tx = await this.governorContract.castVote(proposalId, supportValue);
      }
      
      const receipt = await tx.wait();
      
      // Extract vote weight from event
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id("VoteCast(address,uint256,uint8,uint256,string)")
      );
      
      let weight = 0;
      if (event) {
        // Decode the event to get weight
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["uint256"],
          event.data
        );
        weight = parseInt(decoded[0].toString());
      }
      
      return {
        transactionHash: receipt.hash,
        weight
      };
    } catch (error) {
      console.error("Error casting vote:", error);
      throw new Error("Failed to cast vote");
    }
  }

  /**
   * Get voting power for an address
   */
  async getVotingPower(address: string, blockNumber?: number): Promise<number> {
    try {
      const currentBlock = blockNumber || await this.provider.getBlockNumber();
      const votes = await this.governorContract.getVotes(address, currentBlock);
      return parseInt(votes.toString());
    } catch (error) {
      console.error("Error getting voting power:", error);
      throw new Error("Failed to get voting power");
    }
  }

  /**
   * Get proposal state
   */
  async getProposalState(proposalId: string): Promise<{
    state: number;
    votes: { against: number; for: number; abstain: number };
    snapshot: number;
    deadline: number;
  }> {
    try {
      const state = await this.governorContract.state(proposalId);
      const votes = await this.governorContract.proposalVotes(proposalId);
      const snapshot = await this.governorContract.proposalSnapshot(proposalId);
      const deadline = await this.governorContract.proposalDeadline(proposalId);
      
      return {
        state: parseInt(state.toString()),
        votes: {
          against: parseInt(votes[0].toString()),
          for: parseInt(votes[1].toString()),
          abstain: parseInt(votes[2].toString())
        },
        snapshot: parseInt(snapshot.toString()),
        deadline: parseInt(deadline.toString())
      };
    } catch (error) {
      console.error("Error getting proposal state:", error);
      throw new Error("Failed to get proposal state");
    }
  }

  /**
   * Listen to design minted events
   */
  onDesignMinted(callback: (event: {
    tokenId: number;
    designer: string;
    name: string;
    tokenURI: string;
  }) => void): void {
    this.designCandidateContract.on("DesignMinted", (tokenId, designer, name, tokenURI) => {
      callback({
        tokenId: parseInt(tokenId.toString()),
        designer,
        name,
        tokenURI
      });
    });
  }

  /**
   * Listen to vote cast events
   */
  onVoteCast(callback: (event: {
    voter: string;
    proposalId: string;
    support: number;
    weight: number;
    reason: string;
  }) => void): void {
    this.governorContract.on("VoteCast", (voter, proposalId, support, weight, reason) => {
      callback({
        voter,
        proposalId,
        support: parseInt(support.toString()),
        weight: parseInt(weight.toString()),
        reason
      });
    });
  }

  /**
   * Stop listening to events
   */
  removeAllListeners(): void {
    this.designCandidateContract.removeAllListeners();
    this.governorContract.removeAllListeners();
  }
} 