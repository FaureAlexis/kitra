'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  isVoting?: boolean;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  designs,
  loading,
  hasMore,
  onLoadMore,
  onVote,
  onShare,
  onFavorite,
  isVoting = false
}) => {
  const [columns, setColumns] = useState(3);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Responsive columns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else if (width < 1280) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Intersection Observer for staggered animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // Observe items when they mount
  useEffect(() => {
    itemRefs.current.forEach((ref, index) => {
      if (ref && observerRef.current) {
        ref.setAttribute('data-index', index.toString());
        observerRef.current.observe(ref);
      }
    });
  }, [designs]);

  // Distribute items into columns for masonry layout
  const distributeItems = () => {
    const columnArrays: DesignListItem[][] = Array.from({ length: columns }, () => []);

    designs.forEach((design, index) => {
      const columnIndex = index % columns;
      columnArrays[columnIndex].push(design);
    });

    return columnArrays;
  };

  const columnArrays = distributeItems();

  // Loading skeletons
  const LoadingSkeleton = () => (
    <div
      className="masonry-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '10px'
      }}
    >
      {Array.from({ length: columns }).map((_, columnIndex) => (
        <div key={columnIndex} className="masonry-column space-y-[10px]">
          {Array.from({ length: Math.ceil(6 / columns) }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                <div
                  className="bg-gray-200"
                  style={{ height: `${200 + Math.random() * 200}px` }}
                />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-20 px-4">
      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
        <span className="text-4xl">🎨</span>
      </div>
      <h3 className="text-2xl font-semibold mb-2">No designs found</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
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
    <div className="space-y-8">
      {/* Pinterest-style Masonry Grid */}
      <div
        className="masonry-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '10px'
        }}
      >
        {columnArrays.map((columnItems, columnIndex) => (
          <div key={columnIndex} className="masonry-column space-y-[10px]">
            {columnItems.map((design, itemIndex) => {
              const globalIndex = columnIndex + itemIndex * columns;
              const isVisible = visibleItems.has(globalIndex);

              return (
                <div
                  key={design.id}
                  ref={(el) => {
                    itemRefs.current[globalIndex] = el;
                  }}
                  className={`
                    pinterest-item transform transition-all duration-500 ease-out
                    ${isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                    }
                  `}
                  style={{
                    transitionDelay: `${globalIndex * 50}ms`
                  }}
                >
                  <JerseyCard
                    design={design}
                    onVote={onVote}
                    onShare={onShare}
                    onFavorite={onFavorite}
                    isPinterestStyle={true}
                    isVoting={isVoting}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center px-4">
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-primary/50 transition-all duration-300 shadow-sm"
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
        <div className="text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm shadow-sm">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading more designs...</span>
          </div>
        </div>
      )}


    </div>
  );
};
