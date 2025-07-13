'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useWalletData } from '@/hooks/useWalletData';
import { Loader2, Coins, CheckCircle, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import { formatTimeoutMessage } from '@/lib/utils/transaction-checker';

interface DraftDesign {
  id: string;
  name: string;
  description: string;
  created_at: string;
  ipfs_url: string;
  metadata_url: string;
}

interface MintingPanelProps {
  className?: string;
}

export const MintingPanel: React.FC<MintingPanelProps> = ({ className = '' }) => {
  const [draftDesigns, setDraftDesigns] = useState<DraftDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [mintingIds, setMintingIds] = useState<Set<string>>(new Set());
  const walletData = useWalletData();

  // Fetch draft designs
  const fetchDraftDesigns = async () => {
    if (!walletData.isConnected || !walletData.address) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/designs/mint?userAddress=${walletData.address}`);
      const data = await response.json();

      if (data.success) {
        setDraftDesigns(data.designs);
        console.log('✅ [MintingPanel] Fetched draft designs:', data.count);
      } else {
        console.error('❌ [MintingPanel] Failed to fetch designs:', data.error);
        toast.error('Failed to load designs', {
          description: data.error
        });
      }
    } catch (error) {
      console.error('❌ [MintingPanel] Network error:', error);
      toast.error('Network error', {
        description: 'Failed to connect to server'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mint a specific design
  const mintDesign = async (designId: string, designName: string, highPriority: boolean = false) => {
    if (!walletData.address) {
      toast.error('Wallet not connected');
      return;
    }

    setMintingIds(prev => new Set(prev).add(designId));

    try {
      console.log('🪙 [MintingPanel] Minting design:', designId, highPriority ? '(HIGH PRIORITY)' : '(STANDARD)');
      
      const response = await fetch('/api/designs/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designId,
          userAddress: walletData.address,
          highPriority
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Design minted successfully${highPriority ? ' (High Priority)' : ''}!`, {
          description: `"${designName}" is now an NFT candidate eligible for voting`,
          duration: 5000
        });

        // Remove from draft list
        setDraftDesigns(prev => prev.filter(d => d.id !== designId));
        
        console.log('✅ [MintingPanel] Minting successful:', {
          tokenId: data.tokenId,
          transactionHash: data.transactionHash
        });
      } else {
        console.error('❌ [MintingPanel] Minting failed:', data.error);
        
        // Handle timeout errors more gracefully
        if (response.status === 408 || data.error?.includes('timeout')) {
          const timeoutInfo = formatTimeoutMessage(data.transactionHash);
          
          toast.warning(timeoutInfo.title, {
            description: timeoutInfo.description,
            duration: 10000,
            action: timeoutInfo.explorerUrl ? {
              label: (
                <div className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  View on Explorer
                </div>
              ),
              onClick: () => {
                window.open(timeoutInfo.explorerUrl, '_blank');
              }
            } : {
              label: 'Check Status',
              onClick: () => {
                fetchDraftDesigns();
              }
            }
          });
          
          // Don't remove from draft list for timeouts since transaction might still succeed
          console.log('⏳ [MintingPanel] Transaction timeout, keeping in draft list:', {
            designId,
            transactionHash: data.transactionHash
          });
        } else {
          toast.error('Failed to mint design', {
            description: data.error || 'Unknown error occurred'
          });
        }
      }
    } catch (error) {
      console.error('❌ [MintingPanel] Network error:', error);
      toast.error('Minting failed', {
        description: 'Network error occurred'
      });
    } finally {
      setMintingIds(prev => {
        const next = new Set(prev);
        next.delete(designId);
        return next;
      });
    }
  };

  // Load designs on mount and wallet connection
  useEffect(() => {
    fetchDraftDesigns();
  }, [walletData.isConnected, walletData.address]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!walletData.isConnected) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
            <p className="text-muted-foreground">
              Connect your wallet to view and mint your draft designs
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Mint Draft Designs
          {draftDesigns.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {draftDesigns.length} available
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading designs...</span>
          </div>
        ) : draftDesigns.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All designs minted!</h3>
            <p className="text-muted-foreground">
              You don't have any draft designs. All your designs are already NFT candidates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Convert your draft designs to NFT candidates to make them eligible for community voting.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="h-3 w-3" />
                  <span className="font-medium">Standard Mint:</span> Normal gas fees, 2-5 minute confirmation
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-orange-500" />
                  <span className="font-medium">High Priority:</span> Higher gas fees, 30s-2 minute confirmation
                </div>
              </div>
            </div>
            
            {draftDesigns.map((design) => (
              <div
                key={design.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Design Preview */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={design.ipfs_url}
                    alt={design.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjgiIHk9IjgiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgcng9IjQiIGZpbGw9IiNFNUU3RUIiLz4KPHRleHQgeD0iMzIiIHk9IjM2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCI+8J+RjzwvdGV4dD4KPC9zdmc+Cg==';
                    }}
                  />
                </div>

                {/* Design Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{design.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {design.description || 'No description'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {formatDate(design.created_at)}
                  </p>
                </div>

                {/* Mint Button with Priority Options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      disabled={mintingIds.has(design.id)}
                      className="flex-shrink-0"
                    >
                      {mintingIds.has(design.id) ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Minting...
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Mint NFT
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => mintDesign(design.id, design.name, false)}
                      disabled={mintingIds.has(design.id)}
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Standard Mint
                      <span className="text-xs text-muted-foreground ml-2">(2-5 min)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => mintDesign(design.id, design.name, true)}
                      disabled={mintingIds.has(design.id)}
                      className="text-orange-600 focus:text-orange-600"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      High Priority
                      <span className="text-xs text-muted-foreground ml-2">(30s-2 min)</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {/* Batch Mint Button */}
            {draftDesigns.length > 1 && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    draftDesigns.forEach(design => {
                      if (!mintingIds.has(design.id)) {
                        mintDesign(design.id, design.name, true); // Use high priority for batch minting
                      }
                    });
                  }}
                  disabled={mintingIds.size > 0}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  High Priority Mint All ({draftDesigns.length} designs)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="pt-4 mt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDraftDesigns}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 