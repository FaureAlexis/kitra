export class Address {
  private constructor(private readonly value: string) {}

  static create(address: string): Address {
    const normalized = address.toLowerCase();
    
    if (!this.isValidAddress(normalized)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }

    return new Address(normalized);
  }

  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  toString(): string {
    return this.value;
  }

  toChecksum(): string {
    // Simple checksum implementation
    const address = this.value.toLowerCase().replace('0x', '');
    const hash = Array.from(address).map(char => char.charCodeAt(0)).join('');
    let checksumAddress = '0x';
    
    for (let i = 0; i < address.length; i++) {
      checksumAddress += parseInt(hash[i]) >= 8 ? address[i].toUpperCase() : address[i];
    }
    
    return checksumAddress;
  }

  equals(other: Address): boolean {
    return this.value === other.value;
  }
} 