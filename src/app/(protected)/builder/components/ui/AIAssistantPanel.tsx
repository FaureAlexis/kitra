'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAITexture } from '../../../../../lib/services/ai-texture.service';
import { GlassButton } from './GlassButton';
import { GlassDropdown } from './GlassDropdown';
import { TextureGalleryModal } from './TextureGalleryModal';
import { TexturePreviewModal } from './TexturePreviewModal';
import type { TextureGenerationOptions } from '../../../../../lib/services/ai-texture.service';
import type { DesignDetails } from '../../../../api/designs/[id]/route';
import styles from '../../builder.module.css';
import { BotIcon, Loader2Icon } from 'lucide-react';

interface AIAssistantPanelProps {
  onTextureGenerated?: (textureUrl: string, textureId: string) => void;
  onApplyTexture?: (textureId: string) => void;
  loadedDesign?: DesignDetails | null;
}

export const AIAssistantPanel = React.memo<AIAssistantPanelProps>(function AIAssistantPanel({ 
  onTextureGenerated,
  onApplyTexture,
  loadedDesign
}) {
  console.log('🎯 [AI_PANEL] Component RENDER called:', {
    timeStamp: Date.now(),
    hasLoadedDesign: !!loadedDesign
  });

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState<TextureGenerationOptions['style']>('modern');
  const [kitType, setKitType] = useState<TextureGenerationOptions['kitType']>('home');
  const [teamName, setTeamName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [generatedTexture, setGeneratedTexture] = useState<any>(null);
  
  console.log('🎯 [AI_PANEL] About to call useAITexture hook...');
  const {
    generateTexture,
    textures,
    removeTexture,
    clearAll,
    getTotalSize,
    generatePromptSuggestions,
    validatePrompt
  } = useAITexture();
  console.log('🎯 [AI_PANEL] useAITexture hook completed, current texture count:', textures.length);

  // Effect to prefill form when a design is loaded
  useEffect(() => {
    if (loadedDesign) {
      console.log('🎨 [AIAssistantPanel] Prefilling form with loaded design:', loadedDesign.name);
      setPrompt(loadedDesign.prompt || '');
      setStyle(loadedDesign.style as TextureGenerationOptions['style'] || 'modern');
      setKitType(loadedDesign.kitType as TextureGenerationOptions['kitType'] || 'home');
      
      // Show advanced panel if design has specific properties
      if (loadedDesign.style !== 'modern' || loadedDesign.kitType !== 'home') {
        setShowAdvanced(true);
      }
      
      toast.info('Design loaded!', {
        description: `Loaded settings from "${loadedDesign.name}"`,
        duration: 3000
      });
    }
  }, [loadedDesign]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🎯 [AI_PANEL] handleSubmit called:', {
      promptLength: prompt.trim().length,
      isGenerating,
      timeStamp: Date.now()
    });
    
    e.preventDefault();
    if (!prompt.trim() || isGenerating) {
      console.log('🎯 [AI_PANEL] Skipping submit - invalid conditions');
      return;
    }

    // Validate prompt
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      console.log('🎯 [AI_PANEL] Prompt validation failed');
      toast.error(`Invalid prompt: ${validation.suggestions?.join(', ')}`);
      return;
    }

    console.log('🎯 [AI_PANEL] Starting generation process...');
    setIsGenerating(true);
    
    try {
      const options: TextureGenerationOptions = {
        prompt: prompt.trim(),
        style,
        kitType,
        teamName: teamName.trim() || undefined,
      };

      toast.info('Generating texture with gpt-image-1...', {
        description: 'This may take 10-30 seconds'
      });

      const result = await generateTexture(options);

      if (result.success && result.texture) {
        // Notify parent component
        if (onTextureGenerated && result.texture.url) {
          onTextureGenerated(result.texture.url, result.texture.id);
        }

        // Set the generated texture and open preview modal
        console.log('🎯 [AI_PANEL] Setting generated texture for modal:', {
          textureId: result.texture.id,
          hasUrl: !!result.texture.url,
          url: result.texture.url?.substring(0, 50) + '...',
          dataLength: result.texture.textureData.length
        });
        setGeneratedTexture(result.texture);
        setIsPreviewOpen(true);

        toast.success('Texture generated successfully!', {
          description: 'Preview your new texture in the dialog'
        });

        // Clear the prompt for next generation
        setPrompt('');
      } else {
        toast.error('Failed to generate texture', {
          description: result.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('Texture generation error:', error);
      toast.error('Generation failed', {
        description: 'Please check your connection and try again'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyTexture = (textureId: string) => {
    if (onApplyTexture) {
      onApplyTexture(textureId);
      toast.success('Texture applied to kit!');
    }
  };

  const handleRemoveTexture = (textureId: string) => {
    removeTexture(textureId);
    toast.success('Texture removed from storage');
  };

  const handleClearAll = () => {
    clearAll();
    toast.success('All textures cleared');
  };

  // Preview modal handlers
  const handlePreviewApply = (textureId: string) => {
    handleApplyTexture(textureId);
  };

  const handlePreviewSave = () => {
    // Texture is already saved, just show feedback
    toast.success('Texture saved to gallery!');
  };

  const handlePreviewDiscard = () => {
    if (generatedTexture) {
      removeTexture(generatedTexture.id);
      toast.info('Texture discarded');
    }
  };

  const handleRegenerate = () => {
    // Close preview and regenerate with same prompt
    setIsPreviewOpen(false);
    if (generatedTexture) {
      // Use the same prompt that was used for the previous generation
      setPrompt(generatedTexture.metadata.prompt);
      // Trigger form submission after a brief delay
      setTimeout(() => {
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }, 100);
    }
  };

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

  return (
    <>
      <div 
        className={`${styles.controlPanel} ${styles.glassPanel}`}
        style={{
          position: 'fixed',
          right: '20px',
          top: '80px',
          zIndex: 100,
          width: '320px',
          maxHeight: 'calc(100vh - 160px)',
          overflowY: 'auto'
        }}
      >
        <div className={styles.panelHeader}>
          <div>
            <h3 className={styles.panelTitle}>AI Assistant</h3>
            {loadedDesign && (
              <p className="text-xs text-gray-600 mt-1">
                Loaded: {loadedDesign.name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <GlassButton
              size="sm"
              onClick={() => setIsGalleryOpen(true)}
              className={textures.length > 0 ? 'text-pink-600' : ''}
            >
              Gallery ({textures.length})
            </GlassButton>
          </div>
        </div>

        {/* Generation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Describe your kit design
              {loadedDesign && (
                <span className="text-xs text-pink-600 ml-2">
                  (from loaded design)
                </span>
              )}
            </label>
            <textarea
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              placeholder="e.g., Modern football kit with geometric patterns and lightning bolts"
              className={`${styles.glassTextarea} h-20`}
              disabled={isGenerating}
            />
          </div>

          <div className="flex gap-2">
            <GlassButton
              type="button"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </GlassButton>
          </div>

          {showAdvanced && (
            <div className="space-y-3 p-3 bg-gray-900/10 rounded-lg border border-gray-300/20">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Style
                </label>
                <GlassDropdown
                  value={style || 'modern'}
                  onChange={(value: string) => setStyle(value as TextureGenerationOptions['style'])}
                  options={[
                    { value: 'modern', label: 'Modern' },
                    { value: 'photorealistic', label: 'Photorealistic' },
                    { value: 'artistic', label: 'Artistic' },
                    { value: 'minimalist', label: 'Minimalist' },
                    { value: 'vintage', label: 'Vintage' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Kit Type
                </label>
                <GlassDropdown
                  value={kitType || 'home'}
                  onChange={(value: string) => setKitType(value as TextureGenerationOptions['kitType'])}
                  options={[
                    { value: 'home', label: 'Home' },
                    { value: 'away', label: 'Away' },
                    { value: 'third', label: 'Third' },
                    { value: 'goalkeeper', label: 'Goalkeeper' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Team Name (Optional)
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamName(e.target.value)}
                  placeholder="e.g., Real Madrid"
                  className={styles.glassInput}
                />
              </div>
            </div>
          )}

          <GlassButton
            type="submit"
            size="lg"
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
            variant='primary'
          >
            {isGenerating ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <BotIcon className="w-4 h-4" />}
            {isGenerating ? 'Generating...' : 'Generate Texture'}
          </GlassButton>
        </form>

        {/* Usage Stats */}
        <div className="mt-4 p-3 bg-gray-900/10 rounded-lg border border-gray-300/20">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Storage Used:</span>
            <span>{formatFileSize(getTotalSize())} / 50MB</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-1 mt-2">
            <div
              className="bg-pink-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((getTotalSize() / (50 * 1024 * 1024)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Texture Gallery Modal */}
      <TextureGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        textures={textures}
        onApplyTexture={handleApplyTexture}
        onRemoveTexture={handleRemoveTexture}
        onClearAll={handleClearAll}
        getTotalSize={getTotalSize}
      />

      {/* Texture Preview Modal */}
      <TexturePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        generatedTexture={generatedTexture}
        onApplyTexture={handlePreviewApply}
        onSaveToGallery={handlePreviewSave}
        onDiscard={handlePreviewDiscard}
        onRegenerate={handleRegenerate}
        isRegenerating={isGenerating}
      />
    </>
  );
}); 