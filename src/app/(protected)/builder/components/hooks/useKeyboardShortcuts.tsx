'use client';

import React from 'react';

interface UseKeyboardShortcutsProps {
  onToggleControls: () => void;
}

export const useKeyboardShortcuts = ({
  onToggleControls
}: UseKeyboardShortcutsProps) => {
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' && e.ctrlKey) {
        e.preventDefault();
        onToggleControls();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onToggleControls]);
}; 