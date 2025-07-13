'use client';

import React, { useState } from 'react';
import { GalleryHeader } from './GalleryHeader';
import { GalleryFilters } from './GalleryFilters';
import { GalleryGrid } from './GalleryGrid';
import { useDesigns } from '@/hooks/useDesigns';
import { useVoting } from '@/hooks/useVoting';
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

  // Use voting hook for real vote functionality
  const {
    castVote,
    createProposal,
    checkVoteStatus,
    isVoting,
    isCreatingProposal,
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

  // Action handlers
  const handleVote = async (id: string) => {
    console.log('🗳️ [GalleryLayout] Vote for design:', id);
    
    try {
      // First check if a proposal exists for this design
      const proposalData = await checkVoteStatus(id);
      
      if (!proposalData) {
        // No proposal exists, need to create one first
        const design = designs.find(d => d.id === id);
        if (!design) {
          toast.error('Design not found');
          return;
        }

        if (!design.tokenId) {
          toast.error('This design is not minted as an NFT yet');
          return;
        }

        console.log('📝 [GalleryLayout] Creating proposal for design:', design.name);
        toast.info('Creating proposal...', {
          description: 'Setting up voting for this design'
        });

        const proposalResult = await createProposal(
          design.tokenId,
          `Approve design: ${design.name}`,
          design.description,
          'approval'
        );

        if (!proposalResult.success) {
          toast.error('Failed to create proposal', {
            description: proposalResult.error
          });
          return;
        }

        toast.success('Proposal created!', {
          description: 'You can now vote on this design'
        });

        // Refresh designs to show updated status
        refetchDesigns();
        return;
      }

      // Proposal exists, check if user already voted
      if (proposalData.hasUserVoted) {
        toast.info('You have already voted on this design');
        return;
      }

      // Cast vote (always vote FOR in gallery)
      console.log('🗳️ [GalleryLayout] Casting vote for proposal:', proposalData.id);
      const voteResult = await castVote(proposalData.id, true);

      if (voteResult.success) {
        toast.success('Vote cast successfully!', {
          description: 'Your vote has been recorded on the blockchain'
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

  // Search filtering is now handled server-side by the API

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
          designs={designs}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onVote={handleVote}
          onShare={handleShare}
          onFavorite={handleFavorite}
          isVoting={isVoting || isCreatingProposal}
        />
      </div>
    </div>
  );
};
