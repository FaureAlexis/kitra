'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAITexture } from '../../../../../lib/services/ai-texture.service';
import { GlassButton } from './GlassButton';
import { GlassDropdown } from './GlassDropdown';
import { GlassTextarea } from './GlassTextarea';
import { GlassInput } from './GlassInput';
import type { TextureGenerationOptions } from '../../../../../lib/services/ai-texture.service';

interface AIAssistantPanelProps {
  onTextureGenerated?: (textureUrl: string, textureId: string) => void;
  onApplyTexture?: (textureId: string) => void;
}

export const AIAssistantPanel = React.memo<AIAssistantPanelProps>(function AIAssistantPanel({ 
  onTextureGenerated,
  onApplyTexture
}) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState<TextureGenerationOptions['style']>('modern');
  const [kitType, setKitType] = useState<TextureGenerationOptions['kitType']>('home');
  const [teamName, setTeamName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTextures, setShowTextures] = useState(false);
  
  const {
    generateTexture,
    textures,
    removeTexture,
    clearAll,
    getTotalSize,
    generatePromptSuggestions,
    validatePrompt
  } = useAITexture();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    // Validate prompt
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      toast.error(`Invalid prompt: ${validation.suggestions?.join(', ')}`);
      return;
    }

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

        toast.success('Texture generated successfully!', {
          description: 'You can now apply it to your kit'
        });

        // Clear the prompt for next generation
        setPrompt('');
        
        // Show textures panel
        setShowTextures(true);
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
    <div className="w-80 max-h-[calc(100vh-160px)] overflow-y-auto glass-panel" style={{
      position: 'fixed',
      right: '20px',
      top: '100px',
      zIndex: 100
    }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
          <div className="flex gap-2">
            <GlassButton
              size="sm"
              onClick={() => setShowTextures(!showTextures)}
              className={showTextures ? 'text-pink-400' : ''}
            >
              Gallery ({textures.length})
            </GlassButton>
          </div>
        </div>

        {/* Texture Gallery */}
        {showTextures && (
          <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Stored Textures</h4>
              <div className="flex gap-2">
                <span className="text-xs text-gray-400">
                  {formatFileSize(getTotalSize())}
                </span>
                {textures.length > 0 && (
                  <GlassButton
                    size="sm"
                    onClick={() => {
                      clearAll();
                      toast.success('All textures cleared');
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Clear All
                  </GlassButton>
                )}
              </div>
            </div>
            
            {textures.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No textures stored yet. Generate some textures to see them here!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {textures.map((texture) => (
                  <div
                    key={texture.id}
                    className="relative group bg-black/30 rounded-lg p-2 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    {texture.url && (
                      <img
                        src={texture.url}
                        alt={`Texture: ${texture.metadata.prompt.substring(0, 30)}`}
                        className="w-full h-20 object-cover rounded-md mb-2"
                      />
                    )}
                    <p className="text-xs text-gray-300 mb-1 truncate">
                      {texture.metadata.prompt.substring(0, 25)}...
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {formatTimestamp(texture.metadata.timestamp)}
                    </p>
                    <div className="flex gap-1">
                      <GlassButton
                        size="sm"
                        onClick={() => handleApplyTexture(texture.id)}
                        className="text-xs flex-1"
                      >
                        Apply
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        onClick={() => handleRemoveTexture(texture.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        ×
                      </GlassButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Describe your kit design
            </label>
                         <GlassTextarea
               value={prompt}
               onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
               placeholder="e.g., Modern football kit with geometric patterns and lightning bolts"
               className="h-20"
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
            <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
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
                <label className="block text-sm font-medium text-white mb-1">
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
                <label className="block text-sm font-medium text-white mb-1">
                  Team Name (Optional)
                </label>
                                 <GlassInput
                   value={teamName}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamName(e.target.value)}
                   placeholder="e.g., Real Madrid"
                 />
              </div>
            </div>
          )}

          <GlassButton
            type="submit"
            size="lg"
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Texture'}
          </GlassButton>
        </form>

        {/* Usage Stats */}
        <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Storage Used:</span>
            <span>{formatFileSize(getTotalSize())} / 50MB</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div
              className="bg-pink-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((getTotalSize() / (50 * 1024 * 1024)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}); 