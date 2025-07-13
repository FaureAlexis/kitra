'use client';

import React, { useState } from 'react';
import { useDesigns } from '@/hooks/useDesigns';
import { useVoting } from '@/hooks/useVoting';
import { GalleryFilters } from './GalleryFilters';
import { GalleryHeader } from './GalleryHeader';
import { GalleryGrid } from './GalleryGrid';
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
    tags: currentTags.length > 0 ? currentTags : undefined,
    search: searchQuery || undefined
  });

  // Use simplified voting hook
  const {
    castVote,
    checkVoteStatus,
    hasUserVoted,
    isVoting,
    error: votingError
  } = useVoting();

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

  // Simplified vote handler - directly vote on design
  const handleVote = async (id: string) => {
    console.log('🗳️ [GalleryLayout] Vote for design:', id);
    
    try {
      const design = designs.find(d => d.id === id);
      if (!design) {
        toast.error('Design not found');
        return;
      }

      if (design.status !== 'candidate') {
        toast.error('This design is not eligible for voting');
        return;
      }

      // Check if user has already voted
      const voteStatus = await checkVoteStatus(id);
      if (voteStatus && await hasUserVoted(id)) {
        toast.info('You have already voted on this design');
        return;
      }

      // Cast vote (always vote FOR in gallery)
      console.log('🗳️ [GalleryLayout] Casting vote for design:', design.name);
      const voteResult = await castVote(id, true); // true = support

      if (voteResult.success) {
        toast.success('Vote cast successfully!', {
          description: 'Your vote has been recorded'
        });
        
        // Refresh designs to show updated vote counts
        refetchDesigns();
      } else {
        toast.error('Failed to cast vote', {
          description: voteResult.error
        });
      }

    } catch (error) {
      console.error('❌ [GalleryLayout] Vote error:', error);
      toast.error('Voting failed', {
        description: 'Please try again later'
      });
    }
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

  // Show voting error if any
  if (votingError) {
    console.warn('⚠️ [GalleryLayout] Voting error:', votingError);
  }

  return (
    <div className={`space-y-8 ${className}`}>
      
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

        <div className="min-h-screen">
          <GalleryGrid
            designs={designs}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onVote={handleVote}
            onShare={handleShare}
            onFavorite={handleFavorite}
            isVoting={isVoting}
          />
        </div>
      </div>
    </div>
  );
};
