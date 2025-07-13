import { useState, useCallback } from 'react';
import { useWalletData } from './useWalletData';

export interface VoteResult {
  success: boolean;
  transactionHash?: string;
  weight?: number;
  error?: string;
}

export interface DesignVoteData {
  id: string;
  name: string;
  status: string;
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  approvalPercentage: number;
}

export interface UseVotingResult {
  // Vote casting (simplified - just designId and support)
  castVote: (designId: string, support: boolean, reason?: string) => Promise<VoteResult>;
  
  // Vote status checking
  checkVoteStatus: (designId: string) => Promise<DesignVoteData | null>;
  hasUserVoted: (designId: string) => Promise<boolean>;
  
  // Voting power
  getVotingPower: () => Promise<number>;
  
  // Loading states
  isVoting: boolean;
  isLoadingVoteStatus: boolean;
  
  // Error state
  error: string | null;
}

export const useVoting = (): UseVotingResult => {
  const walletData = useWalletData();
  const [isVoting, setIsVoting] = useState(false);
  const [isLoadingVoteStatus, setIsLoadingVoteStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const castVote = useCallback(async (
    designId: string, 
    support: boolean, 
    reason?: string
  ): Promise<VoteResult> => {
    console.log('🗳️ [useVoting] Casting vote:', { designId, support });
    
    if (!walletData.isConnected || !walletData.address) {
      const errorMsg = 'Please connect your wallet to vote';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsVoting(true);
    clearError();

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designId,
          support,
          reason,
          voterAddress: walletData.address
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Vote failed');
      }

      console.log('✅ [useVoting] Vote cast successfully:', data);
      return {
        success: true,
        transactionHash: data.transactionHash,
        weight: data.weight
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ [useVoting] Vote failed:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsVoting(false);
    }
  }, [walletData.isConnected, walletData.address, clearError]);

  const checkVoteStatus = useCallback(async (designId: string): Promise<DesignVoteData | null> => {
    console.log('🔍 [useVoting] Checking vote status for design:', designId);
    
    setIsLoadingVoteStatus(true);
    clearError();

    try {
      const response = await fetch(`/api/vote?designId=${designId}&voterAddress=${walletData.address || ''}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Design not found
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get vote status');
      }

      console.log('✅ [useVoting] Vote status retrieved:', data.design);
      return data.design;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ [useVoting] Failed to get vote status:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoadingVoteStatus(false);
    }
  }, [walletData.address, clearError]);

  const hasUserVoted = useCallback(async (designId: string): Promise<boolean> => {
    if (!walletData.address) return false;

    try {
      const response = await fetch(`/api/vote?designId=${designId}&voterAddress=${walletData.address}`);
      
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.hasVoted || false;
    } catch (err) {
      console.error('❌ [useVoting] Failed to check vote status:', err);
      return false;
    }
  }, [walletData.address]);

  const getVotingPower = useCallback(async (): Promise<number> => {
    if (!walletData.address) return 0;

    try {
      // For simplified voting, we'll call the blockchain service directly via API
      // or implement a dedicated endpoint
      return 1; // Simplified: everyone gets 1 vote for now
    } catch (err) {
      console.error('❌ [useVoting] Failed to get voting power:', err);
      return 0;
    }
  }, [walletData.address]);

  return {
    castVote,
    checkVoteStatus,
    hasUserVoted,
    getVotingPower,
    isVoting,
    isLoadingVoteStatus,
    error
  };
}; 