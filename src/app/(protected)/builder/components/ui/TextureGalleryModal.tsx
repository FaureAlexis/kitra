'use client';

import React from 'react';
import { X } from 'lucide-react';
import { GlassButton } from './GlassButton';
import styles from '../../builder.module.css';

interface Texture {
  id: string;
  url?: string;
  metadata: {
    prompt: string;
    timestamp: number;
  };
}

interface TextureGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  textures: Texture[];
  onApplyTexture: (textureId: string) => void;
  onRemoveTexture: (textureId: string) => void;
  onClearAll: () => void;
  getTotalSize: () => number;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export const TextureGalleryModal = React.memo<TextureGalleryModalProps>(function TextureGalleryModal({
  isOpen,
  onClose,
  textures,
  onApplyTexture,
  onRemoveTexture,
  onClearAll,
  getTotalSize
}) {
  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent} style={{ maxWidth: '800px', width: '90vw' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Texture Gallery</h2>
            <p className="text-sm text-gray-600 mt-1">
              {textures.length} texture{textures.length !== 1 ? 's' : ''} stored
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {formatFileSize(getTotalSize())} / 50MB
            </div>
            {textures.length > 0 && (
              <GlassButton
                size="sm"
                onClick={onClearAll}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </GlassButton>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Storage Progress */}
        <div className="mb-6 p-4 bg-gray-900/10 rounded-lg border border-gray-300/20">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <span>Storage Used</span>
            <span>{formatFileSize(getTotalSize())} / 50MB</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((getTotalSize() / (50 * 1024 * 1024)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Texture Grid */}
        <div className="max-h-[60vh] overflow-y-auto">
          {textures.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">No textures yet</p>
              <p className="text-gray-500 text-sm">
                Generate some textures with the AI assistant to see them here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {textures.map((texture) => (
                <div
                  key={texture.id}
                  className="relative group bg-gray-900/10 rounded-lg p-3 border border-gray-300/20 hover:border-gray-400/30 transition-all hover:shadow-lg"
                >
                  {/* Texture Preview */}
                  {texture.url && (
                    <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={texture.url}
                        alt={`Texture: ${texture.metadata.prompt.substring(0, 30)}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  
                  {/* Texture Info */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {texture.metadata.prompt}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(texture.metadata.timestamp)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <GlassButton
                      size="sm"
                      onClick={() => onApplyTexture(texture.id)}
                      className="flex-1 text-xs"
                    >
                      Apply
                    </GlassButton>
                    <GlassButton
                      size="sm"
                      onClick={() => onRemoveTexture(texture.id)}
                      className="text-xs text-red-600 hover:text-red-700 px-3"
                    >
                      <X size={14} />
                    </GlassButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}); 