'use client';

import React from 'react';
import { Type } from 'lucide-react';
import { GlassInput } from './GlassInput';
import { GlassColorPicker } from './GlassColorPicker';
import { GlassDropdown } from './GlassDropdown';
import styles from '../../builder.module.css';

interface FlockingControlsPanelProps {
  playerName: string;
  playerNumber: string;
  flockingColor: string;
  fontSize: number;
  onPlayerNameChange: (name: string) => void;
  onPlayerNumberChange: (number: string) => void;
  onFlockingColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
}

const fontSizeOptions = [
  { value: '0.3', label: 'Small' },
  { value: '0.4', label: 'Medium' },
  { value: '0.5', label: 'Large' },
  { value: '0.6', label: 'Extra Large' }
];

export const FlockingControlsPanel = React.memo(function FlockingControlsPanel({
  playerName,
  playerNumber,
  flockingColor,
  fontSize,
  onPlayerNameChange,
  onPlayerNumberChange,
  onFlockingColorChange,
  onFontSizeChange
}: FlockingControlsPanelProps) {
  return (
    <div className={`${styles.controlPanel} ${styles.glassPanel}`}>
      <div className={styles.panelHeader}>
        <Type className={styles.panelIcon} />
        <h2 className={styles.panelTitle}>Jersey Flocking</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className={styles.glassLabel}>Player Name</label>
          <GlassInput
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            placeholder="e.g., MESSI"
            maxLength={20}
          />
        </div>
        
        <div>
          <label className={styles.glassLabel}>Player Number</label>
          <GlassInput
            value={playerNumber}
            onChange={(e) => onPlayerNumberChange(e.target.value)}
            placeholder="e.g., 10"
            maxLength={3}
            pattern="[0-9]*"
          />
        </div>
        
        <div>
          <label className={styles.glassLabel}>Font Size</label>
          <GlassDropdown
            value={fontSize.toString()}
            onChange={(value) => onFontSizeChange(parseFloat(value))}
            options={fontSizeOptions}
          />
        </div>
        
        <GlassColorPicker
          id="flocking-color"
          value={flockingColor}
          onChange={onFlockingColorChange}
          label="Text Color"
        />
      </div>
    </div>
  );
}); 