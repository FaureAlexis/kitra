'use client';

import React, { Suspense, useState } from 'react';
import { HudHeader } from '../ui/HudHeader';
import { ToggleButton } from '../ui/ToggleButton';
import { ControlsPanels } from './ControlsPanels';
import { ActionsBar } from '../ui/ActionsBar';
import { LevaControls } from '../ui/LevaControls';
import { SafeCanvas } from '../3d/SafeCanvas';
import { Scene } from '../3d/Scene';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useModelLoader } from '../hooks/useModelLoader';
import styles from '../../builder.module.css';

interface BuilderLayoutProps {
  modelPath: string;
}

export const BuilderLayout = React.memo(function BuilderLayout({ 
  modelPath 
}: BuilderLayoutProps) {
  const [showControls, setShowControls] = useState(true);
  const [showLeva, setShowLeva] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#ec4899');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [pattern, setPattern] = useState('solid');
  
  // AI Texture state
  const [currentTextureUrl, setCurrentTextureUrl] = useState<string | null>(null);
  const [currentTextureId, setCurrentTextureId] = useState<string | null>(null);
  
  // Custom hooks
  useKeyboardShortcuts({
    onToggleControls: () => setShowControls(prev => !prev),
    onToggleLeva: () => setShowLeva(prev => !prev)
  });
  
  useModelLoader({ modelPath });

  // Texture generation callbacks
  const handleTextureGenerated = (textureUrl: string, textureId: string) => {
    setCurrentTextureUrl(textureUrl);
    setCurrentTextureId(textureId);
  };

  const handleApplyTexture = (textureId: string) => {
    // This will trigger texture application in the Scene component
    setCurrentTextureId(textureId);
  };

  return (
    <div className={styles.builderContainer}>
      {/* Full-screen 3D Canvas */}
      <div className={styles.canvasWrapper}>
        <Suspense fallback={
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
          </div>
        }>
          <SafeCanvas>
            <Scene 
              modelPath={modelPath}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              pattern={pattern}
              textureUrl={currentTextureUrl}
              textureId={currentTextureId}
            />
          </SafeCanvas>
        </Suspense>
      </div>

      {/* HUD Header */}
      <HudHeader />

      {/* Toggle Button */}
      <ToggleButton 
        showControls={showControls}
        onToggle={() => setShowControls(!showControls)}
      />

      {/* Control Panels */}
      <ControlsPanels
        showControls={showControls}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        pattern={pattern}
        onPrimaryColorChange={setPrimaryColor}
        onSecondaryColorChange={setSecondaryColor}
        onPatternChange={setPattern}
        onTextureGenerated={handleTextureGenerated}
        onApplyTexture={handleApplyTexture}
      />

      {/* Actions Bar */}
      <ActionsBar />

      {/* Leva Controls */}
      <LevaControls showLeva={showLeva} />
    </div>
  );
}); 