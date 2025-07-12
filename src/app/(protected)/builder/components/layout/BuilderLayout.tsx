'use client';

import React, { useState, Suspense } from 'react';
import { Scene } from '../3d/Scene';
import { SafeCanvas } from '../3d/SafeCanvas';
import { HudHeader } from '../ui/HudHeader';
import { ToggleButton } from '../ui/ToggleButton';
import { ColorControlsPanel } from '../ui/ColorControlsPanel';
import { FlockingControlsPanel } from '../ui/FlockingControlsPanel';
import { AIAssistantPanel } from '../ui/AIAssistantPanel';
import { ActionsBar } from '../ui/ActionsBar';
import { LevaControls } from '../ui/LevaControls';
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
  
  // Flocking state
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [flockingColor, setFlockingColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(0.4);
  
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
              playerName={playerName}
              playerNumber={playerNumber}
              flockingColor={flockingColor}
              fontSize={fontSize}
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

      {/* Left Controls Panel - Color Controls & Flocking */}
      {showControls && (
        <div className={styles.leftControlsWrapper}>
          <ColorControlsPanel
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            pattern={pattern}
            onPrimaryColorChange={setPrimaryColor}
            onSecondaryColorChange={setSecondaryColor}
            onPatternChange={setPattern}
          />
          
          <FlockingControlsPanel
            playerName={playerName}
            playerNumber={playerNumber}
            flockingColor={flockingColor}
            fontSize={fontSize}
            onPlayerNameChange={setPlayerName}
            onPlayerNumberChange={setPlayerNumber}
            onFlockingColorChange={setFlockingColor}
            onFontSizeChange={setFontSize}
          />
        </div>
      )}

      {/* AI Assistant Panel - Right Side */}
      <AIAssistantPanel 
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