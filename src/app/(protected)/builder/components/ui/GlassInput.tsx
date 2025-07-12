'use client';

import React from 'react';
import { cn } from '../../../../../lib/utils';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400',
          'backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50',
          'transition-all duration-200 hover:bg-white/15 hover:border-white/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);

GlassInput.displayName = 'GlassInput'; 