'use client';

import React from 'react';

interface UseKeyboardShortcutsProps {
  onToggleControls: () => void;
  onToggleLeva: () => void;
}

export const useKeyboardShortcuts = ({
  onToggleControls,
  onToggleLeva
}: UseKeyboardShortcutsProps) => {
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' && e.ctrlKey) {
        e.preventDefault();
        onToggleControls();
      }
      if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        onToggleLeva();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onToggleControls, onToggleLeva]);
}; 