'use client';

import React from 'react';
import styles from '../../builder.module.css';

interface GlassColorPickerProps {
  id: string;
  value: string;
  onChange: (color: string) => void;
  label: string;
  className?: string;
}

export const GlassColorPicker = React.memo(function GlassColorPicker({
  id,
  value,
  onChange,
  label,
  className = ''
}: GlassColorPickerProps) {
  return (
    <div className={`${styles.colorInputWrapper} ${className}`}>
      <div className={styles.glassColorPickerContainer}>
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.glassColorInput}
        />
        <div className={styles.colorPreview} style={{ backgroundColor: value }}>
          <div className={styles.colorPreviewOverlay} />
        </div>
        <span className={styles.colorHex}>{value.toUpperCase()}</span>
      </div>
      <label htmlFor={id} className={styles.glassLabel}>
        {label}
      </label>
    </div>
  );
}); 