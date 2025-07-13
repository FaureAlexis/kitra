'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Edit, Trash2, Copy, Eye, MoreHorizontal, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useWalletData } from '@/hooks/useWalletData';
import { useDesigns } from '@/hooks/useDesigns';
import { appKit } from '@/lib/web3-config';
import { toast } from 'sonner';
import { JerseyCardSkeleton } from '@/components/gallery/JerseyCard';

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
    window.location.href = `/builder?load=${designId}`;
  };

  const handleDuplicate = async (designId: string, designName: string) => {
    toast.info('Duplication feature coming soon!', {
      description: `Will duplicate "${designName}"`
    });
  };

  const handleDelete = async (designId: string, designName: string) => {
    if (window.confirm(`Are you sure you want to delete "${designName}"? This action cannot be undone.`)) {
      toast.info('Delete feature coming soon!', {
        description: `Will delete "${designName}"`
      });
    }
  };

  const handlePublish = async (designId: string, designName: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30';
      case 'candidate':
        return 'bg-violet-500/20 text-violet-700 border-violet-500/30';
      case 'draft':
        return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  // Filter designs by current user
  const userDesigns = designs.filter(design =>
    walletData.address && design.creator.toLowerCase() === walletData.address.toLowerCase()
  );

  if (!walletData.isConnected) {
    return (
      <div className="min-h-screen bg-background">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-4xl">🔗</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent mb-2">
              Wallet Not Connected
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Please connect your wallet to view your designs
            </p>
            <Button
              onClick={() => appKit.open()}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px]" />
        </div>

        {/* Content */}
        <div className="relative p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Main Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent mb-2">
                    My Designs
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    Manage your football kit designs • {formatCreator(walletData.address || '')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                  asChild
                >
                  <Link href="/builder">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Design
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Status Filter Bar */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={currentStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('all')}
              className={currentStatus === 'all'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300'
              }
            >
              All ({userDesigns.length})
            </Button>
            <Button
              variant={currentStatus === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('draft')}
              className={currentStatus === 'draft'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300'
              }
            >
              Drafts ({userDesigns.filter(d => d.status === 'draft').length})
            </Button>
            <Button
              variant={currentStatus === 'candidate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('candidate')}
              className={currentStatus === 'candidate'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300'
              }
            >
              In Voting ({userDesigns.filter(d => d.status === 'candidate').length})
            </Button>
            <Button
              variant={currentStatus === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('published')}
              className={currentStatus === 'published'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300'
              }
            >
              Published ({userDesigns.filter(d => d.status === 'published').length})
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 bg-destructive/10 border border-destructive/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-destructive text-sm">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-destructive mb-1">Error loading designs</h3>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && userDesigns.length === 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <JerseyCardSkeleton key={i} isPinterestStyle={false} />
            ))}
          </div>
        )}

        {/* Designs Grid */}
        {userDesigns.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {userDesigns.map((design) => (
              <Card key={design.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-sm" />

                {/* Jersey Preview */}
                <div className="relative aspect-square overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center">
                    <div className="relative transform group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={design.ipfsUrl}
                        alt={design.name}
                        className="w-48 h-56 object-cover rounded-lg shadow-2xl"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMDAiIHJ4PSIxMiIgZmlsbD0iI0U1RTdFQiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+CnRleHQge2ZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmO30KPC9zdHlsZT7wn5GPPC90ZXh0Pgo8L3N2Zz4K';
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getStatusColor(design.status)} border text-xs font-medium`}>
                      {design.status}
                    </Badge>
                  </div>

                  {/* Actions Menu */}
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border-border/50">
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

                {/* Content */}
                <CardContent className="relative p-6 space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {design.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {design.description}
                    </p>
                  </div>

                  {/* Creator & Date */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">
                          {formatCreator(design.creator).slice(0, 1)}
                        </span>
                      </div>
                      <span className="text-muted-foreground">You</span>
                    </div>
                    <span className="text-muted-foreground">{formatDate(design.createdAt)}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {design.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs bg-muted/50">
                        {tag}
                      </Badge>
                    ))}
                    {design.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-muted/50">
                        +{design.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-primary">🗳️</span>
                        <span className="font-medium">{design.votes}</span>
                        <span className="text-muted-foreground">votes</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300"
                        onClick={() => handleEdit(design.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300"
                        asChild
                      >
                        <Link href={`/design/${design.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

                {/* Empty State */}
        {!loading && userDesigns.length === 0 && !error && (
          <div className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px]" />
            </div>

            <div className="relative text-center py-24 px-6">

              {/* Main Content */}
              <div className="max-w-2xl mx-auto mb-12">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent mb-6">
                  {currentStatus === 'all'
                    ? 'Ready to Design Your First Kit?'
                    : `No ${currentStatus} designs yet`}
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {currentStatus === 'all'
                    ? 'Transform your creativity into stunning football kit designs. Join thousands of designers creating the next generation of football fashion.'
                    : `You don't have any ${currentStatus} designs yet. Create your first design and watch it evolve through the community voting process.`}
                </p>
              </div>

              {/* Features Grid */}
              {currentStatus === 'all' && (
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <h3 className="font-semibold mb-2">AI-Powered Creation</h3>
                      <p className="text-sm text-muted-foreground">
                        Use advanced AI tools to generate unique textures and patterns for your designs
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900 flex items-center justify-center">
                        <span className="text-2xl">🗳️</span>
                      </div>
                      <h3 className="font-semibold mb-2">Community Voting</h3>
                      <p className="text-sm text-muted-foreground">
                        Submit your designs for community voting and see them become official NFTs
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950 dark:to-amber-900 flex items-center justify-center">
                        <span className="text-2xl">💰</span>
                      </div>
                      <h3 className="font-semibold mb-2">Earn Rewards</h3>
                      <p className="text-sm text-muted-foreground">
                        Successful designs earn CHZ tokens and become part of football history
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-lg px-8 py-6"
                  asChild
                >
                  <Link href="/builder">
                    <Plus className="h-5 w-5 mr-2" />
                    {currentStatus === 'all' ? 'Start Creating' : 'Create Design'}
                  </Link>
                </Button>

                {currentStatus === 'all' && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300 text-lg px-8 py-6"
                    asChild
                  >
                    <Link href="/gallery">
                      <Eye className="h-5 w-5 mr-2" />
                      Browse Gallery
                    </Link>
                  </Button>
                )}
              </div>

              {/* Inspiration Text */}
              {currentStatus === 'all' && (
                <p className="text-sm text-muted-foreground mt-8 max-w-md mx-auto">
                  Join creators who have already designed over 1,000+ unique football kits and earned millions in CHZ tokens
                </p>
              )}
            </div>
          </div>
        )}

        {/* Load More */}
        {hasMore && userDesigns.length > 0 && (
          <div className="text-center mb-16">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300 shadow-sm"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-3" />
                  Load More Designs
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
