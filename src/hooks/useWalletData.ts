"use client";

import { useAccount, useBalance, useEnsName } from "wagmi";
import { useQuery } from "@tanstack/react-query";

export interface WalletData {
  address: string;
  ensName?: string;
  balance: string;
  formattedBalance: string;
  isConnected: boolean;
  isLoading: boolean;
}

export interface UserStats {
  designsCount: number;
  votesCount: number;
  tokensOwned: number;
  totalEarnings: string;
}

export interface UserDesign {
  id: string;
  name: string;
  status: "draft" | "voting" | "published";
  votes: number;
  earnings: string;
  createdAt: string;
  textureUrl?: string;
  tokenId?: number;
}

export function useWalletData(): WalletData {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });

  return {
    address: address || "",
    ensName: ensName || undefined,
    balance: balance?.value.toString() || "0",
    formattedBalance: balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : "0 CHZ",
    isConnected,
    isLoading: isBalanceLoading,
  };
}

export function useUserStats(address?: string) {
  const query = useQuery({
    queryKey: ["userStats", address],
    queryFn: async (): Promise<UserStats> => {
      if (!address) throw new Error("No address provided");
      
      // For now, return calculated stats based on actual data
      const designsResponse = await fetch(`/api/designs?userId=${address}`);
      const designs = await designsResponse.json();
      
      return {
        designsCount: designs.designs?.length || 0,
        votesCount: 0, // TODO: Implement votes tracking
        tokensOwned: designs.designs?.filter((d: any) => d.tokenId).length || 0,
        totalEarnings: "0 CHZ", // TODO: Calculate from published designs
      };
    },
    enabled: !!address,
    staleTime: 30000, // 30 seconds
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useUserDesigns(address?: string) {
  const query = useQuery({
    queryKey: ["userDesigns", address],
    queryFn: async (): Promise<UserDesign[]> => {
      if (!address) throw new Error("No address provided");
      
      const response = await fetch(`/api/designs?userId=${address}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch designs");
      }
      
      return result.designs?.map((design: any) => ({
        id: design.id,
        name: design.name,
        status: design.isPublished ? "published" : "draft",
        votes: design.votes || 0,
        earnings: design.tokenId ? "0.5 CHZ" : "0 CHZ", // Mock earnings
        createdAt: new Date(design.createdAt).toISOString().split('T')[0],
        textureUrl: design.textureUrl,
        tokenId: design.tokenId,
      })) || [];
    },
    enabled: !!address,
    staleTime: 30000,
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useVotingHistory(address?: string) {
  const query = useQuery({
    queryKey: ["votingHistory", address],
    queryFn: async (): Promise<any[]> => {
      if (!address) throw new Error("No address provided");
      
      // TODO: Implement actual voting history API
      return [];
    },
    enabled: !!address,
    staleTime: 30000,
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
  };
} 