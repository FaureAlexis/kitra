'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { GlassColorPicker } from './GlassColorPicker';
import { GlassDropdown } from './GlassDropdown';
import styles from '../../builder.module.css';

interface ColorControlsPanelProps {
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onPatternChange: (pattern: string) => void;
}

const patternOptions = [
  { value: 'solid', label: 'Solid Color' },
  { value: 'stripes', label: 'Stripes' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'abstract', label: 'Abstract' }
];

export const ColorControlsPanel = React.memo(function ColorControlsPanel({
  primaryColor,
  secondaryColor,
  pattern,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onPatternChange
}: ColorControlsPanelProps) {
  return (
    <div className={`${styles.controlPanel} ${styles.glassPanel}`}>
      <div className={styles.panelHeader}>
        <Palette className={styles.panelIcon} />
        <h2 className={styles.panelTitle}>Colors & Patterns</h2>
      </div>
      <div className="space-y-4">
        <GlassColorPicker
          id="primary-color"
          value={primaryColor}
          onChange={onPrimaryColorChange}
          label="Primary Color"
        />
        <GlassColorPicker
          id="secondary-color"
          value={secondaryColor}
          onChange={onSecondaryColorChange}
          label="Secondary Color"
        />
        <GlassDropdown
          id="pattern-select"
          value={pattern}
          onChange={onPatternChange}
          options={patternOptions}
          label="Pattern Style"
          placeholder="Choose a pattern"
        />
      </div>
    </div>
  );
}); 