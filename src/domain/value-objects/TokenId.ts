export class TokenId {
  private constructor(private readonly value: number) {}

  static create(tokenId: number): TokenId {
    if (!Number.isInteger(tokenId) || tokenId < 0) {
      throw new Error(`Invalid token ID: ${tokenId}. Must be a non-negative integer.`);
    }

    return new TokenId(tokenId);
  }

  toNumber(): number {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }

  equals(other: TokenId): boolean {
    return this.value === other.value;
  }
} 