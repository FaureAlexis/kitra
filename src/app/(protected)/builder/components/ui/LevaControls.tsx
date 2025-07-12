'use client';

import React from 'react';
import { Leva } from 'leva';
import styles from '../../builder.module.css';

interface LevaControlsProps {
  showLeva: boolean;
}

export const LevaControls = React.memo(function LevaControls({ showLeva }: LevaControlsProps) {
  if (!showLeva) return null;

  return (
    <div className={styles.levaWrapper}>
      <Leva 
        collapsed={false}
        theme={{
          colors: {
            elevation1: 'rgba(0, 0, 0, 0.3)',
            elevation2: 'rgba(0, 0, 0, 0.4)',
            elevation3: 'rgba(0, 0, 0, 0.5)',
            accent1: '#ec4899',
            accent2: '#f472b6',
            accent3: '#f9a8d4',
            highlight1: 'rgba(255, 255, 255, 0.1)',
            highlight2: 'rgba(255, 255, 255, 0.2)',
            highlight3: 'rgba(255, 255, 255, 0.3)',
          }
        }}
      />
    </div>
  );
}); 