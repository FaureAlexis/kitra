import { useState, useEffect, useCallback } from 'react';
import { useWalletData } from './useWalletData';

export interface VoteResult {
  success: boolean;
  transactionHash?: string;
  weight?: number;
  error?: string;
}

export interface ProposalData {
  id: string;
  designId: string;
  title: string;
  description: string;
  proposalType: 'approval' | 'rejection';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  status: 'active' | 'succeeded' | 'defeated' | 'executed';
  hasUserVoted: boolean;
  userVoteSupport?: boolean;
}

export interface UseVotingResult {
  // Vote casting
  castVote: (proposalId: string, support: boolean, reason?: string) => Promise<VoteResult>;
  
  // Proposal creation
  createProposal: (designTokenId: number, title: string, description: string, proposalType: 'approval' | 'rejection') => Promise<VoteResult>;
  
  // Vote status checking
  checkVoteStatus: (designId: string) => Promise<ProposalData | null>;
  hasUserVoted: (proposalId: string) => Promise<boolean>;
  
  // Voting power
  getVotingPower: () => Promise<number>;
  
  // Loading states
  isVoting: boolean;
  isCreatingProposal: boolean;
  isLoadingVoteStatus: boolean;
  
  // Error state
  error: string | null;
}

export const useVoting = (): UseVotingResult => {
  const walletData = useWalletData();
  const [isVoting, setIsVoting] = useState(false);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [isLoadingVoteStatus, setIsLoadingVoteStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const castVote = useCallback(async (
    proposalId: string, 
    support: boolean, 
    reason?: string
  ): Promise<VoteResult> => {
    console.log('🗳️ [useVoting] Casting vote:', { proposalId: proposalId.slice(0, 10) + '...', support });
    
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
          proposalId,
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

  const createProposal = useCallback(async (
    designTokenId: number,
    title: string,
    description: string,
    proposalType: 'approval' | 'rejection'
  ): Promise<VoteResult> => {
    console.log('📝 [useVoting] Creating proposal:', { designTokenId, title, proposalType });
    
    if (!walletData.isConnected || !walletData.address) {
      const errorMsg = 'Please connect your wallet to create proposals';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsCreatingProposal(true);
    clearError();

    try {
      const response = await fetch('/api/vote', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designTokenId,
          title,
          description,
          proposerAddress: walletData.address,
          proposalType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Proposal creation failed');
      }

      console.log('✅ [useVoting] Proposal created successfully:', data);
      return {
        success: true,
        transactionHash: data.transactionHash
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ [useVoting] Proposal creation failed:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCreatingProposal(false);
    }
  }, [walletData.isConnected, walletData.address, clearError]);

  const checkVoteStatus = useCallback(async (designId: string): Promise<ProposalData | null> => {
    console.log('🔍 [useVoting] Checking vote status for design:', designId);
    
    setIsLoadingVoteStatus(true);
    clearError();

    try {
      const response = await fetch(`/api/vote?designId=${designId}&voterAddress=${walletData.address || ''}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No proposal exists for this design
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get vote status');
      }

      console.log('✅ [useVoting] Vote status retrieved:', data.proposal);
      return data.proposal;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ [useVoting] Failed to get vote status:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoadingVoteStatus(false);
    }
  }, [walletData.address, clearError]);

  const hasUserVoted = useCallback(async (proposalId: string): Promise<boolean> => {
    if (!walletData.address) return false;

    try {
      const response = await fetch(`/api/vote?proposalId=${proposalId}&voterAddress=${walletData.address}`);
      
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
      const response = await fetch(`/api/vote?action=voting-power&address=${walletData.address}`);
      
      if (!response.ok) return 0;
      
      const data = await response.json();
      return data.votingPower || 0;
    } catch (err) {
      console.error('❌ [useVoting] Failed to get voting power:', err);
      return 0;
    }
  }, [walletData.address]);

  return {
    castVote,
    createProposal,
    checkVoteStatus,
    hasUserVoted,
    getVotingPower,
    isVoting,
    isCreatingProposal,
    isLoadingVoteStatus,
    error
  };
}; 