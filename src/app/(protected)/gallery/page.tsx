'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from "next/link";
import { useDesigns } from '@/hooks/useDesigns';

export default function GalleryPage() {
  const [currentFilter, setCurrentFilter] = useState<'all' | 'published' | 'candidate' | 'draft'>('all');
  const [currentTags, setCurrentTags] = useState<string[]>([]);

  const { 
    designs, 
    total, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refetchDesigns 
  } = useDesigns({
    status: currentFilter === 'all' ? undefined : currentFilter,
    tags: currentTags.length > 0 ? currentTags : undefined
  });

  const handleFilterChange = (filter: 'all' | 'published' | 'candidate' | 'draft') => {
    console.log('🔄 [Gallery] Filter changed:', filter);
    setCurrentFilter(filter);
  };

  const handleTagToggle = (tag: string) => {
    setCurrentTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleRefresh = () => {
    console.log('🔄 [Gallery] Manual refresh triggered');
    refetchDesigns();
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold">🎨</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Design Gallery</h1>
                <p className="text-muted-foreground">
                  Discover amazing football kit designs created by the community
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Button 
                variant={currentFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('all')}
              >
                All
              </Button>
              <Button 
                variant={currentFilter === 'published' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('published')}
              >
                Published
              </Button>
              <Button 
                variant={currentFilter === 'candidate' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('candidate')}
              >
                Voting
              </Button>
              <Button 
                variant={currentFilter === 'draft' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('draft')}
              >
                Drafts
              </Button>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex gap-2">
              {['modern', 'classic', 'retro', 'bold'].map(tag => (
                <Button 
                  key={tag}
                  variant={currentTags.includes(tag) ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
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
        {loading && designs.length === 0 && (
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
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Designs Grid */}
        {designs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {designs.map((design) => (
              <Card key={design.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center relative overflow-hidden">
                  {/* IPFS Image */}
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={design.ipfsUrl} 
                      alt={design.name}
                      className="w-48 h-56 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to placeholder if IPFS image fails
                        const img = e.target as HTMLImageElement;
                        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMDAiIHJ4PSIxMiIgZmlsbD0iI0U1RTdFQiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+CnRleHQge2ZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmO30KPC9zdHlsZT7wn5GPPC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={design.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                      {design.status}
                    </Badge>
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
                      by {formatCreator(design.creator)}
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span>🗳️</span>
                      <span className="font-medium">{design.votes}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(design.createdAt)}</span>
                    <span className="capitalize">{design.kitType}</span>
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
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/builder?load=${design.id}`}>
                        Load Design
                      </Link>
                    </Button>
                    {design.status === 'candidate' && (
                      <Button size="sm" variant="outline">
                        Vote
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && designs.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-semibold mb-2">No designs found</h3>
            <p className="text-muted-foreground mb-6">
              {currentFilter === 'all' 
                ? 'No designs have been created yet. Be the first to create one!' 
                : `No ${currentFilter} designs found. Try a different filter.`}
            </p>
            <Button asChild>
              <Link href="/builder">Create Your First Design</Link>
            </Button>
          </div>
        )}

        {/* Load More */}
        {hasMore && designs.length > 0 && (
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

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                {total}
              </div>
              <div className="text-muted-foreground">Total Designs</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {designs.filter(d => d.status === 'published').length}
              </div>
              <div className="text-muted-foreground">Published NFTs</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-violet-200 dark:border-violet-800">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">
                {designs.reduce((acc, d) => acc + d.votes, 0)}
              </div>
              <div className="text-muted-foreground">Total Votes</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 