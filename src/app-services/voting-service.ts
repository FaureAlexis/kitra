import { VoteEntity, VoteAggregateEntity } from "@/domain/models/Vote";
import { UserEntity } from "@/domain/models/User";
import { DesignEntity } from "@/domain/models/Design";

export interface CastVoteParams {
  designId: string;
  voter: UserEntity;
  support: boolean;
  weight: number;
  reason?: string;
  transactionHash: string;
}

export interface VoteRepository {
  save(vote: VoteEntity): Promise<VoteEntity>;
  findByDesign(designId: string): Promise<VoteEntity[]>;
  findByVoter(voterId: string): Promise<VoteEntity[]>;
  findByDesignAndVoter(designId: string, voterId: string): Promise<VoteEntity | null>;
}

export class VotingService {
  constructor(private voteRepository: VoteRepository) {}

  async castVote(params: CastVoteParams): Promise<VoteEntity> {
    try {
      // Check if user has already voted on this design
      const existingVote = await this.voteRepository.findByDesignAndVoter(
        params.designId,
        params.voter.id
      );

      if (existingVote) {
        throw new Error("User has already voted on this design");
      }

      // Create vote entity
      const vote = VoteEntity.create({
        designId: params.designId,
        voterId: params.voter.id,
        voterAddress: params.voter.address,
        support: params.support,
        weight: params.weight,
        reason: params.reason,
        transactionHash: params.transactionHash,
      });

      // Save vote
      return await this.voteRepository.save(vote);
    } catch (error) {
      console.error("Error casting vote:", error);
      throw new Error("Failed to cast vote");
    }
  }

  async getDesignVotes(designId: string): Promise<VoteAggregateEntity> {
    const votes = await this.voteRepository.findByDesign(designId);
    return VoteAggregateEntity.fromVotes(designId, votes);
  }

  async getUserVotes(userId: string): Promise<VoteEntity[]> {
    return await this.voteRepository.findByVoter(userId);
  }

  async getVoteStats(designId: string): Promise<{
    totalVotes: number;
    supportPercentage: number;
    isApproved: boolean;
    topReasons: string[];
  }> {
    const voteAggregate = await this.getDesignVotes(designId);
    
    // Get top reasons for voting
    const reasons = voteAggregate.votes
      .filter(v => v.reason)
      .map(v => v.reason!)
      .slice(0, 5);

    return {
      totalVotes: voteAggregate.stats.totalVotes,
      supportPercentage: voteAggregate.getApprovalPercentage(),
      isApproved: voteAggregate.isApproved(),
      topReasons: reasons,
    };
  }

  async canUserVote(userId: string, designId: string): Promise<boolean> {
    const existingVote = await this.voteRepository.findByDesignAndVoter(
      designId,
      userId
    );
    return existingVote === null;
  }
} 