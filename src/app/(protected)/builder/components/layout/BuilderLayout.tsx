'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { HudHeader } from '../ui/HudHeader';
import { ToggleButton } from '../ui/ToggleButton';
import { ColorControlsPanel } from '../ui/ColorControlsPanel';
import { AIAssistantPanel } from '../ui/AIAssistantPanel';
import { ActionsBar } from '../ui/ActionsBar';
import { LevaControls } from '../ui/LevaControls';
import { SafeCanvas } from '../3d/SafeCanvas';
import { Scene } from '../3d/Scene';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useModelLoader } from '../hooks/useModelLoader';
import { useDesignLoader } from '../../../../../hooks/useDesignLoader';
import { useTextureStorage } from '../../../../../hooks/useTextureStorage';
import styles from '../../builder.module.css';

interface BuilderLayoutProps {
  modelPath: string;
}

export const BuilderLayout = React.memo(function BuilderLayout({ 
  modelPath 
}: BuilderLayoutProps) {
  const searchParams = useSearchParams();
  const loadDesignId = searchParams.get('load');
  
  const [showControls, setShowControls] = useState(true);
  const [showLeva, setShowLeva] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#ec4899');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [pattern, setPattern] = useState('solid');
  
  // AI Texture state
  const [currentTextureUrl, setCurrentTextureUrl] = useState<string | null>(null);
  const [currentTextureId, setCurrentTextureId] = useState<string | null>(null);
  
  // Design loading state
  const [isLoadingDesign, setIsLoadingDesign] = useState(false);
  
  // Custom hooks
  const designLoader = useDesignLoader();
  const textureStorage = useTextureStorage();
  
  useKeyboardShortcuts({
    onToggleControls: () => setShowControls(prev => !prev),
    onToggleLeva: () => setShowLeva(prev => !prev)
  });
  
  useModelLoader({ modelPath });

  // Load design on mount if load parameter is present
  useEffect(() => {
    if (loadDesignId && !designLoader.design && !designLoader.loading) {
      console.log('🔄 [BuilderLayout] Loading design from URL parameter:', loadDesignId);
      setIsLoadingDesign(true);
      
      designLoader.loadDesign(loadDesignId).then((success) => {
        if (success && designLoader.design) {
          console.log('✅ [BuilderLayout] Design loaded, applying to builder...');
          
          // Apply the loaded design to the builder
          const storedTexture = designLoader.applyToBuilder();
          if (storedTexture) {
            // Add texture to storage
            textureStorage.addTexture(storedTexture);
            
            // Set as current texture
            setCurrentTextureId(storedTexture.id);
            setCurrentTextureUrl(storedTexture.url || null);
            
            // Show success notification
            toast.success('Design loaded successfully!', {
              description: `Loaded "${designLoader.design.name}" into the builder`,
              duration: 4000
            });
            
            console.log('🎨 [BuilderLayout] Design applied successfully:', {
              textureId: storedTexture.id,
              designName: designLoader.design.name
            });
          }
        } else {
          console.error('❌ [BuilderLayout] Failed to load design');
          toast.error('Failed to load design', {
            description: designLoader.error || 'The design could not be loaded',
            duration: 5000
          });
        }
        setIsLoadingDesign(false);
      });
    }
  }, [loadDesignId, designLoader, textureStorage]);

  // Clean up loaded design when component unmounts or when navigating away
  useEffect(() => {
    return () => {
      if (designLoader.design) {
        console.log('🧹 [BuilderLayout] Cleaning up loaded design');
        designLoader.clearDesign();
      }
    };
  }, [designLoader]);

  // Texture generation callbacks
  const handleTextureGenerated = (textureUrl: string, textureId: string) => {
    console.log('🎨 [BuilderLayout] New texture generated:', textureId);
    setCurrentTextureUrl(textureUrl);
    setCurrentTextureId(textureId);
  };

  const handleApplyTexture = (textureId: string) => {
    console.log('🎨 [BuilderLayout] Applying texture:', textureId);
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

      {/* Design Loading Overlay */}
      {isLoadingDesign && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p className="text-black/70 mt-4 font-medium">
            Loading design "{loadDesignId}"...
          </p>
        </div>
      )}

      {/* HUD Header */}
      <HudHeader />

      {/* Toggle Button */}
      <ToggleButton 
        showControls={showControls}
        onToggle={() => setShowControls(!showControls)}
      />

      {/* Color Controls Panel - Left Side */}
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
        </div>
      )}

      {/* AI Assistant Panel - Right Side */}
      <AIAssistantPanel 
        onTextureGenerated={handleTextureGenerated}
        onApplyTexture={handleApplyTexture}
        loadedDesign={designLoader.design} // Pass loaded design to prefill AI panel
      />

      {/* Actions Bar */}
      <ActionsBar currentTextureId={currentTextureId} />

      {/* Leva Controls */}
      <LevaControls showLeva={showLeva} />
    </div>
  );
}); 