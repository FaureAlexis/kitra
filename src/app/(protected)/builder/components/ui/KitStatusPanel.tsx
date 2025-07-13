/* eslint-disable jsx-a11y/alt-text */
'use client';

import React from 'react';
import { Palette, Image, Layers, Info, Mountain } from 'lucide-react';
import styles from '../../builder.module.css';

interface KitStatusPanelProps {
  currentTextureId?: string | null;
  currentTextureUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
  backgroundImage?: string | null;
  textures: Array<{
    id: string;
    url?: string;
    metadata: {
      prompt: string;
      timestamp: number;
    };
  }>;
}

export const KitStatusPanel = React.memo<KitStatusPanelProps>(function KitStatusPanel({
  currentTextureId,
  currentTextureUrl,
  primaryColor,
  secondaryColor,
  pattern,
  backgroundImage,
  textures
}) {
  // Debug logging
  React.useEffect(() => {
    console.log('🎯 KitStatusPanel rendered with:', {
      currentTextureId,
      primaryColor,
      secondaryColor,
      pattern,
      backgroundImage,
      texturesCount: textures.length
    });
  }, [currentTextureId, primaryColor, secondaryColor, pattern, backgroundImage, textures.length]);

  // Find current texture info
  const currentTexture = currentTextureId ? textures.find(t => t.id === currentTextureId) : null;
  
  const formatPattern = (pattern: string) => {
    switch (pattern) {
      case 'solid':
        return 'Solid Color';
      case 'stripes':
        return 'Stripes';
      case 'gradient':
        return 'Gradient';
      case 'abstract':
        return 'Abstract';
      default:
        return pattern;
    }
  };

  const getBackgroundName = (url: string | null | undefined) => {
    if (!url) return 'Default Scene';
    if (url.includes('/backgrounds/lab.png')) return 'Laboratory';
    if (url.includes('/backgrounds/stadium.png')) return 'Stadium';
    if (url.includes('557804506')) return 'Stadium View';
    if (url.includes('551698618')) return 'Football Field';
    if (url.includes('577223625')) return 'Training Ground';
    if (url.includes('516193266')) return 'Modern Stadium';
    if (url.includes('529900748')) return 'Grass Field';
    if (url.includes('522778119')) return 'Basketball Court';
    return 'Custom Background';
  };

  return (
    <div 
      className={`${styles.controlPanel} ${styles.glassPanel}`}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px', // Even lower, closer to actions bar
        zIndex: 101, // Higher than other elements
        width: '300px',
        minHeight: 'auto'
      }}
    >
      <div className={styles.panelHeader}>
        <Info className={styles.panelIcon} />
        <h3 className={styles.panelTitle}>Kit Status</h3>
      </div>

      <div className="space-y-4">
        {/* Current Background */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg border border-gray-300/20 overflow-hidden bg-gray-100">
              {backgroundImage ? (
                <img 
                  src={backgroundImage} 
                  alt={`Current background: ${getBackgroundName(backgroundImage)}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Mountain size={14} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Mountain size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Background</span>
            </div>
            <p className="text-xs text-gray-600 truncate">
              {getBackgroundName(backgroundImage)}
            </p>
          </div>
        </div>

        {/* Current Texture */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg border border-gray-300/20 overflow-hidden bg-gray-100">
              {currentTexture?.url ? (
                <img 
                  src={currentTexture.url} 
                  alt={`Current texture: ${currentTexture.metadata.prompt.substring(0, 50)}...`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image size={14} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Image size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Texture</span>
            </div>
            <p className="text-xs text-gray-600 truncate">
              {currentTexture 
                ? currentTexture.metadata.prompt.substring(0, 35) + '...'
                : 'No texture applied'
              }
            </p>
          </div>
        </div>

        {/* Current Colors */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg border border-gray-300/20 overflow-hidden flex">
              <div 
                className="w-1/2 h-full" 
                style={{ backgroundColor: primaryColor }}
              />
              <div 
                className="w-1/2 h-full" 
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Colors</span>
            </div>
            <p className="text-xs text-gray-600">
              {primaryColor.toUpperCase()} • {secondaryColor.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Current Pattern */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg border border-gray-300/20 overflow-hidden bg-gray-100 flex items-center justify-center">
              <Layers size={14} className="text-gray-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Pattern</span>
            </div>
            <p className="text-xs text-gray-600">
              {formatPattern(pattern)}
            </p>
          </div>
        </div>

        {/* Status Summary */}
        <div className="pt-3 border-t border-gray-300/20">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Configuration</span>
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${currentTexture ? 'bg-green-500' : 'bg-gray-400'}`} />
              {currentTexture ? 'Complete' : 'Basic'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});