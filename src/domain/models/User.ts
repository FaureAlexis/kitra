export interface User {
  id: string;
  address: string;
  ensName?: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt: Date;
  designsCount: number;
  votesCount: number;
  isActive: boolean;
}

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly address: string,
    public readonly ensName: string | undefined,
    public readonly avatar: string | undefined,
    public readonly createdAt: Date,
    public readonly lastLoginAt: Date,
    public readonly designsCount: number = 0,
    public readonly votesCount: number = 0,
    public readonly isActive: boolean = true
  ) {}

  static create(params: {
    address: string;
    ensName?: string;
    avatar?: string;
  }): UserEntity {
    return new UserEntity(
      crypto.randomUUID(),
      params.address,
      params.ensName,
      params.avatar,
      new Date(),
      new Date(),
      0,
      0,
      true
    );
  }

  updateProfile(params: {
    ensName?: string;
    avatar?: string;
  }): UserEntity {
    return new UserEntity(
      this.id,
      this.address,
      params.ensName ?? this.ensName,
      params.avatar ?? this.avatar,
      this.createdAt,
      new Date(),
      this.designsCount,
      this.votesCount,
      this.isActive
    );
  }

  incrementDesignsCount(): UserEntity {
    return new UserEntity(
      this.id,
      this.address,
      this.ensName,
      this.avatar,
      this.createdAt,
      this.lastLoginAt,
      this.designsCount + 1,
      this.votesCount,
      this.isActive
    );
  }

  incrementVotesCount(): UserEntity {
    return new UserEntity(
      this.id,
      this.address,
      this.ensName,
      this.avatar,
      this.createdAt,
      this.lastLoginAt,
      this.designsCount,
      this.votesCount + 1,
      this.isActive
    );
  }
} 