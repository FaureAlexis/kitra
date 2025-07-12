'use client';

import React from 'react';
import { ColorControlsPanel } from '../ui/ColorControlsPanel';
import { AIAssistantPanel } from '../ui/AIAssistantPanel';
import styles from '../../builder.module.css';

interface ControlsPanelsProps {
  showControls: boolean;
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onPatternChange: (pattern: string) => void;
  onTextureGenerated?: (textureUrl: string, textureId: string) => void;
  onApplyTexture?: (textureId: string) => void;
}

export const ControlsPanels = React.memo(function ControlsPanels({
  showControls,
  primaryColor,
  secondaryColor,
  pattern,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onPatternChange,
  onTextureGenerated,
  onApplyTexture
}: ControlsPanelsProps) {
  if (!showControls) return null;

  return (
    <div className={styles.controlsWrapper}>
      <ColorControlsPanel
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        pattern={pattern}
        onPrimaryColorChange={onPrimaryColorChange}
        onSecondaryColorChange={onSecondaryColorChange}
        onPatternChange={onPatternChange}
      />
      <AIAssistantPanel 
        onTextureGenerated={onTextureGenerated}
        onApplyTexture={onApplyTexture}
      />
    </div>
  );
}); 