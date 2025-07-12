'use client';

import React from 'react';
import { X, Check, Save, Trash2, RefreshCw } from 'lucide-react';
import { GlassButton } from './GlassButton';
import styles from '../../builder.module.css';

interface GeneratedTexture {
  id: string;
  url?: string;
  metadata: {
    prompt: string;
    timestamp: number;
    style?: string;
    kitType?: string;
  };
}

interface TexturePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedTexture: GeneratedTexture | null;
  onApplyTexture: (textureId: string) => void;
  onSaveToGallery: () => void;
  onDiscard: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export const TexturePreviewModal = React.memo<TexturePreviewModalProps>(function TexturePreviewModal({
  isOpen,
  onClose,
  generatedTexture,
  onApplyTexture,
  onSaveToGallery,
  onDiscard,
  onRegenerate,
  isRegenerating = false
}) {
  console.log('🖼️ [MODAL] TexturePreviewModal RENDER called:', {
    isOpen,
    hasTexture: !!generatedTexture,
    willReturn: (!isOpen || !generatedTexture) ? 'null' : 'jsx',
    textureId: generatedTexture?.id || 'none'
  });

  // ALL HOOKS MUST BE BEFORE EARLY RETURN - React Rules of Hooks

  // Debug log when modal opens or texture changes
  React.useEffect(() => {
    console.log('🖼️ [MODAL] useEffect #1 (debug) called:', {
      isOpen,
      hasTexture: !!generatedTexture,
      textureId: generatedTexture?.id || 'none',
      hasUrl: !!generatedTexture?.url
    });
  }, [isOpen, generatedTexture]);

  // Handle escape key
  React.useEffect(() => {
    console.log('🖼️ [MODAL] useEffect #2 (escape key) called:', { isOpen, isRegenerating });
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRegenerating) {
        onClose();
      }
    };

    if (isOpen) {
      console.log('🖼️ [MODAL] Adding escape listener and hiding overflow');
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      console.log('🖼️ [MODAL] Cleanup - removing escape listener and restoring overflow');
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isRegenerating]);

  // Early return AFTER all hooks
  if (!isOpen || !generatedTexture) {
    console.log('🖼️ [MODAL] Early return - modal not shown');
    return null;
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleApply = () => {
    onApplyTexture(generatedTexture.id);
    onClose();
  };

  const handleSave = () => {
    onSaveToGallery();
    onClose();
  };

  const handleDiscard = () => {
    onDiscard();
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent} style={{ maxWidth: '600px', width: '90vw' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Texture Generated!</h2>
            <p className="text-sm text-gray-600 mt-1">
              Preview your new texture design
            </p>
          </div>
          {!isRegenerating && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Texture Preview */}
        <div className="mb-6">
          <div className="aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100 border border-gray-300/20">
            {generatedTexture.url ? (
              <img 
                src={generatedTexture.url} 
                alt="Generated texture preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                  <p className="text-gray-600">Processing texture...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Texture Info */}
        <div className="mb-6 p-4 bg-gray-900/10 rounded-lg border border-gray-300/20">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Generation Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Prompt:</span> {generatedTexture.metadata.prompt}
            </div>
            {generatedTexture.metadata.style && (
              <div>
                <span className="font-medium">Style:</span> {generatedTexture.metadata.style}
              </div>
            )}
            {generatedTexture.metadata.kitType && (
              <div>
                <span className="font-medium">Kit Type:</span> {generatedTexture.metadata.kitType}
              </div>
            )}
            <div>
              <span className="font-medium">Generated:</span> {formatTimestamp(generatedTexture.metadata.timestamp)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <GlassButton
            onClick={handleApply}
            className="flex-1 bg-green-500/20 border-green-500/40 text-green-700 hover:bg-green-500/30"
            disabled={isRegenerating}
          >
            <Check size={16} />
            Apply to Kit
          </GlassButton>
          
          <GlassButton
            onClick={handleSave}
            className="flex-1 bg-blue-500/20 border-blue-500/40 text-blue-700 hover:bg-blue-500/30"
            disabled={isRegenerating}
          >
            <Save size={16} />
            Save to Gallery
          </GlassButton>

          {onRegenerate && (
            <GlassButton
              onClick={onRegenerate}
              className="flex-1"
              disabled={isRegenerating}
            >
              <RefreshCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </GlassButton>
          )}

          <GlassButton
            onClick={handleDiscard}
            className="flex-1 bg-red-500/20 border-red-500/40 text-red-700 hover:bg-red-500/30"
            disabled={isRegenerating}
          >
            <Trash2 size={16} />
            Discard
          </GlassButton>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-gray-900/5 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            You can always find saved textures in the Gallery later. Applied textures will be shown on your kit immediately.
          </p>
        </div>
      </div>
    </div>
  );
}); 