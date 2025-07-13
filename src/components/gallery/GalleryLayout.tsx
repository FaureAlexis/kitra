'use client';

import React, { useState } from 'react';
import { GalleryHeader } from './GalleryHeader';
import { GalleryFilters } from './GalleryFilters';
import { GalleryGrid } from './GalleryGrid';
import { useDesigns } from '@/hooks/useDesigns';
import { toast } from 'sonner';

interface GalleryLayoutProps {
  className?: string;
}

export const GalleryLayout: React.FC<GalleryLayoutProps> = ({ className = '' }) => {
  // Filter states
  const [currentFilter, setCurrentFilter] = useState<'all' | 'published' | 'candidate' | 'draft'>('all');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Use designs hook with current filters
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

  // Handle filter changes
  const handleFilterChange = (filter: 'all' | 'published' | 'candidate' | 'draft') => {
    console.log('🔄 [GalleryLayout] Filter changed:', filter);
    setCurrentFilter(filter);
  };

  const handleTagToggle = (tag: string) => {
    console.log('🏷️ [GalleryLayout] Tag toggled:', tag);
    setCurrentTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSearchChange = (query: string) => {
    console.log('🔍 [GalleryLayout] Search changed:', query);
    setSearchQuery(query);
  };

  const handleClearFilters = () => {
    console.log('🧹 [GalleryLayout] Clearing all filters');
    setCurrentFilter('all');
    setCurrentTags([]);
    setSearchQuery('');
  };

  const handleRefresh = () => {
    console.log('🔄 [GalleryLayout] Manual refresh triggered');
    refetchDesigns();
  };

  // Action handlers
  const handleVote = (id: string) => {
    console.log('🗳️ [GalleryLayout] Vote for design:', id);
    toast.success('Vote recorded!', {
      description: `Your vote for design ${id} has been recorded.`
    });
  };

  const handleShare = (id: string) => {
    console.log('📤 [GalleryLayout] Share design:', id);
    const shareUrl = `${window.location.origin}/design/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!', {
      description: 'Design link has been copied to clipboard.'
    });
  };

  const handleFavorite = (id: string) => {
    console.log('❤️ [GalleryLayout] Favorite design:', id);
    toast.success('Added to favorites!', {
      description: 'Design has been added to your favorites.'
    });
  };

  // Filter designs based on search query
  const filteredDesigns = designs.filter(design =>
    searchQuery === '' ||
    design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    design.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    design.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`min-h-screen bg-background ${className}`}>


      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      {/* Header */}
      <GalleryHeader
        total={total}
        loading={loading}
        onRefresh={handleRefresh}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Filters */}
        <div className="mb-12">
          <GalleryFilters
            currentFilter={currentFilter}
            currentTags={currentTags}
            searchQuery={searchQuery}
            onFilterChange={handleFilterChange}
            onTagToggle={handleTagToggle}
            onSearchChange={handleSearchChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Error Display */}
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

        {/* Gallery Grid */}
        <GalleryGrid
          designs={filteredDesigns}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onVote={handleVote}
          onShare={handleShare}
          onFavorite={handleFavorite}
        />
      </div>
    </div>
  );
};
