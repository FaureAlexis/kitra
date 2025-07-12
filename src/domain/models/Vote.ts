export interface Vote {
  id: string;
  designId: string;
  voterId: string;
  voterAddress: string;
  support: boolean; // true for support, false for against
  weight: number;
  reason?: string;
  createdAt: Date;
  transactionHash: string;
}

export class VoteEntity {
  constructor(
    public readonly id: string,
    public readonly designId: string,
    public readonly voterId: string,
    public readonly voterAddress: string,
    public readonly support: boolean,
    public readonly weight: number,
    public readonly reason: string | undefined,
    public readonly createdAt: Date,
    public readonly transactionHash: string
  ) {}

  static create(params: {
    designId: string;
    voterId: string;
    voterAddress: string;
    support: boolean;
    weight: number;
    reason?: string;
    transactionHash: string;
  }): VoteEntity {
    return new VoteEntity(
      crypto.randomUUID(),
      params.designId,
      params.voterId,
      params.voterAddress,
      params.support,
      params.weight,
      params.reason,
      new Date(),
      params.transactionHash
    );
  }
}

export interface VoteStats {
  totalVotes: number;
  supportVotes: number;
  againstVotes: number;
  totalWeight: number;
  supportWeight: number;
  againstWeight: number;
}

export class VoteAggregateEntity {
  constructor(
    public readonly designId: string,
    public readonly votes: VoteEntity[],
    public readonly stats: VoteStats
  ) {}

  static fromVotes(designId: string, votes: VoteEntity[]): VoteAggregateEntity {
    const supportVotes = votes.filter(v => v.support);
    const againstVotes = votes.filter(v => !v.support);
    
    const stats: VoteStats = {
      totalVotes: votes.length,
      supportVotes: supportVotes.length,
      againstVotes: againstVotes.length,
      totalWeight: votes.reduce((sum, v) => sum + v.weight, 0),
      supportWeight: supportVotes.reduce((sum, v) => sum + v.weight, 0),
      againstWeight: againstVotes.reduce((sum, v) => sum + v.weight, 0)
    };

    return new VoteAggregateEntity(designId, votes, stats);
  }

  getApprovalPercentage(): number {
    if (this.stats.totalWeight === 0) return 0;
    return (this.stats.supportWeight / this.stats.totalWeight) * 100;
  }

  isApproved(threshold: number = 50): boolean {
    return this.getApprovalPercentage() >= threshold;
  }
} 