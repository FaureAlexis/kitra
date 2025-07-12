'use client';

import React from 'react';
import { Save, Share2, Download } from 'lucide-react';
import styles from '../../builder.module.css';

export const ActionsBar = React.memo(function ActionsBar() {
  return (
    <div className={`${styles.actionsBar} ${styles.glassPanel}`}>
      <button className={`${styles.actionButton} ${styles.primary}`}>
        <Save size={18} />
        Save Design
      </button>
      <button className={styles.actionButton}>
        <Share2 size={18} />
        Share
      </button>
      <button className={styles.actionButton}>
        <Download size={18} />
        Export
      </button>
    </div>
  );
}); 