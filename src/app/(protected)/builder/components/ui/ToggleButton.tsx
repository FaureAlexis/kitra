'use client';

import React from 'react';
import { X, Menu } from 'lucide-react';
import styles from '../../builder.module.css';

interface ToggleButtonProps {
  showControls: boolean;
  onToggle: () => void;
}

export const ToggleButton = React.memo(function ToggleButton({ 
  showControls, 
  onToggle 
}: ToggleButtonProps) {
  return (
    <button
      className={styles.toggleButton}
      onClick={onToggle}
      aria-label="Toggle controls"
    >
      {showControls ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}); 