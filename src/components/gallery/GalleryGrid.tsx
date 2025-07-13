'use client';

import React from 'react';
import { JerseyCard } from './JerseyCard';
import { DesignListItem } from '@/app/api/designs/route';
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from 'lucide-react';
import Link from "next/link";

interface GalleryGridProps {
  designs: DesignListItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onVote?: (id: string) => void;
  onShare?: (id: string) => void;
  onFavorite?: (id: string) => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  designs,
  loading,
  hasMore,
  onLoadMore,
  onVote,
  onShare,
  onFavorite
}) => {
  // Create a bento-style layout pattern
  const getBentoClass = (index: number) => {
    const patterns = [
      // Row 1: Standard, Large, Standard
      'md:col-span-1',
      'md:col-span-2 md:row-span-2',
      'md:col-span-1',

      // Row 2: Standard (continues from large)
      'md:col-span-1',

      // Row 3: Large, Standard, Standard
      'md:col-span-2 md:row-span-2',
      'md:col-span-1',
      'md:col-span-1',

      // Row 4: Standard (continues from large)
      'md:col-span-1',

      // Row 5: Standard, Standard, Large
      'md:col-span-1',
      'md:col-span-1',
      'md:col-span-2 md:row-span-2',

      // Row 6: Standard (continues from large)
      'md:col-span-1'
    ];

    return patterns[index % patterns.length] || 'md:col-span-1';
  };

  // Loading skeletons
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`${getBentoClass(i)} animate-pulse`}
        >
          <div className="bg-muted/50 rounded-2xl h-full min-h-[400px] flex flex-col">
            <div className="aspect-square bg-muted/70 rounded-t-2xl" />
            <div className="p-6 flex-1 space-y-3">
              <div className="h-6 bg-muted/70 rounded-lg w-3/4" />
              <div className="h-4 bg-muted/70 rounded-lg w-full" />
              <div className="h-4 bg-muted/70 rounded-lg w-2/3" />
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-muted/70 rounded-full w-16" />
                <div className="h-6 bg-muted/70 rounded-full w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
        <span className="text-4xl">🎨</span>
      </div>
      <h3 className="text-2xl font-semibold mb-2">No designs found</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        No designs match your current filters. Try adjusting your search criteria or be the first to create a design!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" asChild>
          <Link href="/builder">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Design
          </Link>
        </Button>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    </div>
  );

  if (loading && designs.length === 0) {
    return <LoadingSkeleton />;
  }

  if (designs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-12">
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
        {designs.map((design, index) => (
          <JerseyCard
            key={design.id}
            design={design}
            onVote={onVote}
            onShare={onShare}
            onFavorite={onFavorite}
            className={getBentoClass(index)}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                Loading more designs...
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

      {/* Load More Indicator */}
      {loading && designs.length > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading more designs...</span>
          </div>
        </div>
      )}
    </div>
  );
};
