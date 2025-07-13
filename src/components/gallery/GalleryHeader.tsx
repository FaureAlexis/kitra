'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from 'lucide-react';
import Link from "next/link";

interface GalleryHeaderProps {
  total: number;
  loading: boolean;
  onRefresh: () => void;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  total,
  loading,
  onRefresh
}) => {
  return (
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

              {/* Title & Description */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-2">
                  Design Gallery
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Discover incredible football kit designs created by our talented community of designers
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="default"
                onClick={onRefresh}
                disabled={loading}
                className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg" asChild>
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
  );
};
