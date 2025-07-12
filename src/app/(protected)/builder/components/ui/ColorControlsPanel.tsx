'use client';

import React from 'react';
import { Palette, Image } from 'lucide-react';
import { GlassColorPicker } from './GlassColorPicker';
import { GlassDropdown } from './GlassDropdown';
import styles from '../../builder.module.css';

interface ColorControlsPanelProps {
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
  backgroundImage: string | null;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onPatternChange: (pattern: string) => void;
  onBackgroundImageChange: (backgroundImage: string | null) => void;
}

const patternOptions = [
  { value: 'solid', label: 'Solid Color' },
  { value: 'stripes', label: 'Stripes' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'abstract', label: 'Abstract' }
];

const backgroundOptions = [
  { value: '', label: 'No Background' },
  { value: '/backgrounds/lab.png', label: 'Laboratory' },
  { value: '/backgrounds/stadium.png', label: 'Stadium' },
];

export const ColorControlsPanel = React.memo(function ColorControlsPanel({
  primaryColor,
  secondaryColor,
  pattern,
  backgroundImage,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onPatternChange,
  onBackgroundImageChange
}: ColorControlsPanelProps) {
  const handleBackgroundChange = (value: string) => {
    onBackgroundImageChange(value === '' ? null : value);
  };

  return (
    <div className={`${styles.controlPanel} ${styles.glassPanel}`}>
      <div className={styles.panelHeader}>
        <Palette className={styles.panelIcon} />
        <h2 className={styles.panelTitle}>Scene & Colors</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
            <Image size={16} />
            Background Scene
          </label>
          <GlassDropdown
            id="background-select"
            value={backgroundImage || ''}
            onChange={handleBackgroundChange}
            options={backgroundOptions}
            placeholder="Choose a background"
          />
        </div>
        
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