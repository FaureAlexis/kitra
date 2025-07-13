'use client';

import React from 'react';
import styles from '../../builder.module.css';

export const HudHeader = React.memo(function HudHeader() {
  return (
    <div className={`${styles.hudHeader} ${styles.glassPanel}`}>
      <h1 className={styles.hudTitle}>AI Kit Builder</h1>
      <p className={styles.hudSubtitle}>Design your perfect football kit</p>
    </div>
  );
});
