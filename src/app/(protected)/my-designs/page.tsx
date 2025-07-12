'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Edit, Trash2, Copy, Eye, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useWalletData } from '@/hooks/useWalletData';
import { useDesigns } from '@/hooks/useDesigns';
import { appKit } from '@/lib/web3-config';
import { toast } from 'sonner';

export default function MyDesignsPage() {
  const walletData = useWalletData();
  const [currentStatus, setCurrentStatus] = useState<'all' | 'published' | 'candidate' | 'draft'>('all');

  const { 
    designs, 
    total, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refetchDesigns 
  } = useDesigns({
    status: currentStatus === 'all' ? undefined : currentStatus,
    creator: walletData.address || undefined // Filter by current user
  });

  const handleStatusFilter = (status: 'all' | 'published' | 'candidate' | 'draft') => {
    console.log('🔄 [MyDesigns] Status filter changed:', status);
    setCurrentStatus(status);
  };

  const handleRefresh = () => {
    console.log('🔄 [MyDesigns] Manual refresh triggered');
    refetchDesigns();
  };

  const handleEdit = (designId: string) => {
    // Navigate to builder with design loaded
    window.location.href = `/builder?load=${designId}`;
  };

  const handleDuplicate = async (designId: string, designName: string) => {
    // TODO: Implement design duplication
    toast.info('Duplication feature coming soon!', {
      description: `Will duplicate "${designName}"`
    });
  };

  const handleDelete = async (designId: string, designName: string) => {
    // TODO: Implement design deletion with confirmation
    if (window.confirm(`Are you sure you want to delete "${designName}"? This action cannot be undone.`)) {
      toast.info('Delete feature coming soon!', {
        description: `Will delete "${designName}"`
      });
    }
  };

  const handlePublish = async (designId: string, designName: string) => {
    // TODO: Implement design publishing to marketplace
    toast.info('Publish feature coming soon!', {
      description: `Will publish "${designName}" to marketplace`
    });
  };

  const formatCreator = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter designs by current user
  const userDesigns = designs.filter(design => 
    walletData.address && design.creator.toLowerCase() === walletData.address.toLowerCase()
  );

  if (!walletData.isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-semibold mb-2">Wallet Not Connected</h2>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to view your designs
          </p>
          <Button onClick={() => appKit.open()}>
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold">👤</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Designs</h1>
                <p className="text-muted-foreground">
                  Manage your football kit designs • {formatCreator(walletData.address || '')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button asChild>
                <Link href="/builder">Create New Design</Link>
              </Button>
            </div>
          </div>

          {/* Status Filter Bar */}
          <div className="flex gap-2">
            <Button 
              variant={currentStatus === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusFilter('all')}
            >
              All ({userDesigns.length})
            </Button>
            <Button 
              variant={currentStatus === 'draft' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusFilter('draft')}
            >
              Drafts ({userDesigns.filter(d => d.status === 'draft').length})
            </Button>
            <Button 
              variant={currentStatus === 'candidate' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusFilter('candidate')}
            >
              In Voting ({userDesigns.filter(d => d.status === 'candidate').length})
            </Button>
            <Button 
              variant={currentStatus === 'published' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusFilter('published')}
            >
              Published ({userDesigns.filter(d => d.status === 'published').length})
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-destructive">Error loading designs: {error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-auto"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && userDesigns.length === 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Designs Grid */}
        {userDesigns.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {userDesigns.map((design) => (
              <Card key={design.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center relative overflow-hidden">
                  {/* IPFS Image */}
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={design.ipfsUrl} 
                      alt={design.name}
                      className="w-48 h-56 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMDAiIHJ4PSIxMiIgZmlsbD0iI0U1RTdFQiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+CnRleHQge2ZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmO30KPC9zdHlsZT7wn5GPPC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant={design.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                      {design.status}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(design.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(design.id, design.name)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/design/${design.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {design.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handlePublish(design.id, design.name)}>
                            <Badge className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(design.id, design.name)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {design.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {design.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Created {formatDate(design.createdAt)}
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span>🗳️</span>
                      <span className="font-medium">{design.votes}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{design.kitType} kit</span>
                    <span className="capitalize">{design.style} style</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {design.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {design.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{design.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1" onClick={() => handleEdit(design.id)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/design/${design.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && userDesigns.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-semibold mb-2">No designs yet</h3>
            <p className="text-muted-foreground mb-6">
              {currentStatus === 'all' 
                ? 'You haven\'t created any designs yet. Start designing your first football kit!' 
                : `You don't have any ${currentStatus} designs yet.`}
            </p>
            <Button asChild>
              <Link href="/builder">Create Your First Design</Link>
            </Button>
          </div>
        )}

        {/* Load More */}
        {hasMore && userDesigns.length > 0 && (
          <div className="text-center mb-16">
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Designs'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 