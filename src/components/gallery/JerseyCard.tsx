'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Eye, Share2, ArrowRight } from 'lucide-react';
import Link from "next/link";
import { DesignListItem } from '@/app/api/designs/route';

interface JerseyCardProps {
  design: DesignListItem;
  onVote?: (id: string) => void;
  onShare?: (id: string) => void;
  onFavorite?: (id: string) => void;
  className?: string;
  isPinterestStyle?: boolean;
}

export const JerseyCard: React.FC<JerseyCardProps> = ({
  design,
  onVote,
  onShare,
  onFavorite,
  className = '',
  isPinterestStyle = false
}) => {
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

  // Pinterest-style layout
  if (isPinterestStyle) {
    return (
      <div className={`group relative overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
        {/* Main Image */}
        <div className="relative overflow-hidden">
          <img
            src={design.ipfsUrl}
            alt={design.name}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            style={{
              aspectRatio: `${1 + Math.random() * 0.5}`,
              minHeight: '200px',
              maxHeight: '400px'
            }}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMDAiIHJ4PSIxMiIgZmlsbD0iI0U1RTdFQiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+CnRleHQge2ZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmO30KPC9zdHlsZT7wn5GPPC90ZXh0Pgo8L3N2Zz4K';
            }}
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Tags */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-wrap gap-1">
              {design.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-white/90 backdrop-blur-sm border-white/20">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white shadow-sm"
              onClick={() => onFavorite?.(design.id)}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white shadow-sm"
              onClick={() => onShare?.(design.id)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Bottom Caption Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">
              {design.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {formatCreator(design.creator).slice(0, 1)}
                  </span>
                </div>
                <span className="text-white/80 text-xs">{formatCreator(design.creator)}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <Eye className="h-3 w-3" />
                <span>{Math.floor(Math.random() * 1000) + 100}</span>
              </div>
            </div>
          </div>
        </div>


      </div>
    );
  }

  // Original bento-style layout
  return (
    <Card className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${className}`}>
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

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
            onClick={() => onFavorite?.(design.id)}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
            onClick={() => onShare?.(design.id)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* View Count */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1 text-white text-sm">
            <Eye className="h-3 w-3" />
            <span>{Math.floor(Math.random() * 10000) + 100}</span>
          </div>
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
            <span className="text-muted-foreground">{formatCreator(design.creator)}</span>
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

        {/* Votes & Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-primary">🗳️</span>
              <span className="font-medium">{design.votes}</span>
              <span className="text-muted-foreground">votes</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs" asChild>
              <Link href={`/builder?load=${design.id}`}>
                Load
              </Link>
            </Button>
            {design.status === 'candidate' && (
              <Button
                size="sm"
                className="h-8 px-3 text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                onClick={() => onVote?.(design.id)}
              >
                Vote
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const JerseyCardSkeleton: React.FC<{
  isPinterestStyle?: boolean;
  className?: string;
}> = ({
  isPinterestStyle = false,
  className = ''
}) => {
  if (isPinterestStyle) {
    return (
      <div className={`group relative overflow-hidden bg-white rounded-lg shadow-sm ${className}`}>
        {/* Main Image Skeleton */}
        <div className="relative overflow-hidden">
          <Skeleton
            className="w-full h-auto"
            style={{
              aspectRatio: `${1 + Math.random() * 0.5}`,
              minHeight: '200px',
              maxHeight: '400px'
            }}
          />

          {/* Top-left tags skeleton */}
          <div className="absolute top-3 left-3">
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          </div>

          {/* Top-right actions skeleton */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // Original bento-style skeleton
  return (
    <Card className={`group relative overflow-hidden border-0 shadow-lg ${className}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-sm" />

      {/* Jersey Preview Skeleton */}
      <div className="relative aspect-square overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center">
          <Skeleton className="w-48 h-56 rounded-lg" />
        </div>

        {/* Status Badge Skeleton */}
        <div className="absolute top-4 left-4">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
        </div>

        {/* View Count Skeleton */}
        <div className="absolute bottom-4 left-4">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <CardContent className="relative p-6 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Creator & Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>

        {/* Votes & Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-12 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
