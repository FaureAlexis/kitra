export interface Design {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  textureUrl: string;
  ipfsHash: string;
  tokenId?: number;
  isPublished: boolean;
  votes: number;
  tags: string[];
}

export interface DesignMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export class DesignEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly textureUrl: string,
    public readonly ipfsHash: string,
    public readonly tokenId?: number,
    public readonly isPublished: boolean = false,
    public readonly votes: number = 0,
    public readonly tags: string[] = []
  ) {}

  static create(params: {
    name: string;
    description: string;
    createdBy: string;
    textureUrl: string;
    ipfsHash: string;
    tags?: string[];
  }): DesignEntity {
    return new DesignEntity(
      crypto.randomUUID(),
      params.name,
      params.description,
      params.createdBy,
      new Date(),
      new Date(),
      params.textureUrl,
      params.ipfsHash,
      undefined,
      false,
      0,
      params.tags || []
    );
  }

  publish(tokenId: number): DesignEntity {
    return new DesignEntity(
      this.id,
      this.name,
      this.description,
      this.createdBy,
      this.createdAt,
      new Date(),
      this.textureUrl,
      this.ipfsHash,
      tokenId,
      true,
      this.votes,
      this.tags
    );
  }

  toMetadata(): DesignMetadata {
    return {
      name: this.name,
      description: this.description,
      image: this.textureUrl,
      attributes: [
        { trait_type: "Creator", value: this.createdBy },
        { trait_type: "Created", value: this.createdAt.toISOString() },
        { trait_type: "Votes", value: this.votes.toString() },
        ...this.tags.map(tag => ({ trait_type: "Tag", value: tag }))
      ]
    };
  }
} 