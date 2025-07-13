'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Sparkles } from 'lucide-react';

interface GalleryFiltersProps {
  currentFilter: 'all' | 'published' | 'candidate' | 'draft';
  currentTags: string[];
  searchQuery: string;
  onFilterChange: (filter: 'all' | 'published' | 'candidate' | 'draft') => void;
  onTagToggle: (tag: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

const availableTags = [
  { name: 'modern', emoji: '⚡', color: 'from-blue-500 to-cyan-500' },
  { name: 'classic', emoji: '🏛️', color: 'from-gray-500 to-slate-500' },
  { name: 'retro', emoji: '🌈', color: 'from-purple-500 to-pink-500' },
  { name: 'bold', emoji: '🔥', color: 'from-red-500 to-orange-500' },
  { name: 'minimalist', emoji: '⚪', color: 'from-gray-400 to-gray-600' },
  { name: 'gradient', emoji: '🎨', color: 'from-violet-500 to-indigo-500' },
  { name: 'neon', emoji: '✨', color: 'from-green-400 to-emerald-500' },
  { name: 'geometric', emoji: '🔹', color: 'from-teal-500 to-blue-500' }
];

export const GalleryFilters: React.FC<GalleryFiltersProps> = ({
  currentFilter,
  currentTags,
  searchQuery,
  onFilterChange,
  onTagToggle,
  onSearchChange,
  onClearFilters
}) => {
  const hasActiveFilters = currentFilter !== 'all' || currentTags.length > 0 || searchQuery.length > 0;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search designs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-300"
        />
      </div>

      {/* Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Status</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Designs', count: '24' },
              { key: 'published', label: 'Published', count: '12' },
              { key: 'candidate', label: 'Voting', count: '8' },
              { key: 'draft', label: 'Drafts', count: '4' }
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={currentFilter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange(key as any)}
                className={`h-8 px-3 text-xs transition-all duration-300 ${
                  currentFilter === key
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50'
                }`}
              >
                {label}
                <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                  {count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Style Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Style</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(({ name, emoji, color }) => (
              <Button
                key={name}
                variant={currentTags.includes(name) ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTagToggle(name)}
                className={`h-8 px-3 text-xs transition-all duration-300 ${
                  currentTags.includes(name)
                    ? `bg-gradient-to-r ${color} text-white shadow-lg`
                    : 'bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50'
                }`}
              >
                <span className="mr-1">{emoji}</span>
                {name}
              </Button>
            ))}
          </div>
        </div>

        {/* Kit Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Kit Type</span>
          </div>
          <Select>
            <SelectTrigger className="h-8 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-300">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">🏠 Home Kit</SelectItem>
              <SelectItem value="away">✈️ Away Kit</SelectItem>
              <SelectItem value="third">🌟 Third Kit</SelectItem>
              <SelectItem value="goalkeeper">🧤 Goalkeeper Kit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort By</span>
          </div>
          <Select>
            <SelectTrigger className="h-8 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">🕐 Newest First</SelectItem>
              <SelectItem value="oldest">📅 Oldest First</SelectItem>
              <SelectItem value="votes">🗳️ Most Votes</SelectItem>
              <SelectItem value="popular">🔥 Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 p-4 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/50">
          <span className="text-sm font-medium">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {currentFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Status: {currentFilter}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => onFilterChange('all')}
                />
              </Badge>
            )}
            {currentTags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => onTagToggle(tag)}
                />
              </Badge>
            ))}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => onSearchChange('')}
                />
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};
