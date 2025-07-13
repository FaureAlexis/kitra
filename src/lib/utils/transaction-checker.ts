/**
 * Utility functions for checking transaction status on Chiliz network
 */

export const CHILIZ_SPICY_EXPLORER = 'https://testnet.chiliscan.com';

/**
 * Generate a link to view transaction on Chiliz Spicy explorer
 */
export function getTransactionUrl(transactionHash: string): string {
  return `${CHILIZ_SPICY_EXPLORER}/tx/${transactionHash}`;
}

/**
 * Generate a link to view token on Chiliz Spicy explorer
 */
export function getTokenUrl(contractAddress: string, tokenId: number): string {
  return `${CHILIZ_SPICY_EXPLORER}/token/${contractAddress}?a=${tokenId}`;
}

/**
 * Generate a link to view address on Chiliz Spicy explorer
 */
export function getAddressUrl(address: string): string {
  return `${CHILIZ_SPICY_EXPLORER}/address/${address}`;
}

/**
 * Check if a transaction hash is valid format
 */
export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Estimate transaction confirmation time based on network
 */
export function getEstimatedConfirmationTime(): string {
  return '2-5 minutes'; // Chiliz Spicy testnet typical block time
}

/**
 * Format timeout error message with helpful links
 */
export function formatTimeoutMessage(transactionHash?: string): {
  title: string;
  description: string;
  explorerUrl?: string;
} {
  const baseMessage = {
    title: 'Transaction Confirmation Timed Out',
    description: `Transaction was sent but confirmation is taking longer than expected (${getEstimatedConfirmationTime()}). This is common on testnets.`
  };

  if (transactionHash && isValidTransactionHash(transactionHash)) {
    return {
      ...baseMessage,
      description: `${baseMessage.description} Check the transaction status on the explorer.`,
      explorerUrl: getTransactionUrl(transactionHash)
    };
  }

  return baseMessage;
} 