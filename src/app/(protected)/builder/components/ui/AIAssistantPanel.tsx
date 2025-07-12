'use client';

import React, { useState, useEffect } from 'react';
import { Wand2, Sparkles, Image, Download, Trash2, Eye, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassButton } from './GlassButton';
import { toast } from 'sonner';
import { useAITexture, TextureGenerationOptions, GeneratedTexture } from '../../../../../lib/services/ai-texture.service';
import styles from '../../builder.module.css';

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
  const [generatedTextures, setGeneratedTextures] = useState<GeneratedTexture[]>([]);
  
  const aiTexture = useAITexture();

  // Load cached textures on mount
  useEffect(() => {
    setGeneratedTextures(aiTexture.getAllTextures());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    // Validate prompt
    const validation = aiTexture.validatePrompt(prompt);
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

      toast.info('Generating texture with GPT-image-1...', {
        description: 'This may take 10-30 seconds'
      });

      const result = await aiTexture.generateTexture(options);

      if (result.success && result.texture) {
        // Update local state
        const updatedTextures = aiTexture.getAllTextures();
        setGeneratedTextures(updatedTextures);

        // Notify parent component
        if (onTextureGenerated) {
          onTextureGenerated(result.texture.url!, result.texture.id);
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

  const handleDownloadTexture = (texture: GeneratedTexture) => {
    if (texture.url) {
      const link = document.createElement('a');
      link.href = texture.url;
      link.download = `kitra-texture-${texture.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Texture downloaded!');
    }
  };

  const handleDeleteTexture = (textureId: string) => {
    aiTexture.removeTexture(textureId);
    setGeneratedTextures(aiTexture.getAllTextures());
    toast.success('Texture deleted');
  };

  const presetPrompts = [
    "Bold blue and white stripes with modern geometric accents",
    "Classic red jersey with lightning bolt patterns", 
    "Minimalist black kit with subtle gradient textures",
    "Arsenal-inspired design with cannon emblems",
    "Barcelona-style blaugrana with golden details"
  ];

  return (
    <div className={`${styles.controlPanel} ${styles.glassPanel}`}>
      <div className={styles.panelHeader}>
        <Wand2 className={styles.panelIcon} />
        <h2 className={styles.panelTitle}>AI Texture Generator</h2>
        <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full ml-2">
          GPT-image-1
        </span>
      </div>

      {/* Generation Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={styles.glassLabel}>
            Describe your ideal kit texture
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Dynamic lightning patterns in electric blue and white with modern geometric elements..."
            className={styles.glassTextarea}
            rows={3}
            disabled={isGenerating}
          />
        </div>

        {/* Advanced Options Toggle */}
        <GlassButton
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="secondary"
          className="w-full text-sm"
        >
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Advanced Options
        </GlassButton>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-3 border border-white/10 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as any)}
                  disabled={isGenerating}
                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white"
                >
                  <option value="modern">Modern</option>
                  <option value="photorealistic">Photorealistic</option>
                  <option value="artistic">Artistic</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="vintage">Vintage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Kit Type</label>
                <select
                  value={kitType}
                  onChange={(e) => setKitType(e.target.value as any)}
                  disabled={isGenerating}
                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white"
                >
                  <option value="home">Home Kit</option>
                  <option value="away">Away Kit</option>
                  <option value="third">Third Kit</option>
                  <option value="goalkeeper">Goalkeeper</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Team Name (optional)</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Arsenal, Barcelona..."
                disabled={isGenerating}
                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}
        
        <GlassButton
          type="submit"
          variant="primary"
          disabled={!prompt.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Sparkles size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image size={16} />
              Generate Texture
            </>
          )}
        </GlassButton>
      </form>

      {/* Quick Ideas */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400 mb-2">Quick Ideas:</p>
        <div className="space-y-1">
          {presetPrompts.map((presetPrompt, index) => (
            <button
              key={index}
              onClick={() => setPrompt(presetPrompt)}
              disabled={isGenerating}
              className="w-full text-left text-xs text-gray-300 hover:text-white transition-colors py-1 px-2 rounded hover:bg-white/5"
            >
              • {presetPrompt}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Textures */}
      {generatedTextures.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <GlassButton
            type="button"
            onClick={() => setShowTextures(!showTextures)}
            variant="secondary"
            className="w-full text-sm mb-3"
          >
            {showTextures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Generated Textures ({generatedTextures.length})
          </GlassButton>

          {showTextures && (
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {generatedTextures.map((texture) => (
                <div
                  key={texture.id}
                  className="relative group bg-white/5 border border-white/10 rounded-lg p-1"
                >
                  {texture.url && (
                    <img
                      src={texture.url}
                      alt="Generated texture"
                      className="w-full h-12 object-cover rounded"
                    />
                  )}
                  
                  {/* Action buttons overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleApplyTexture(texture.id)}
                      className="p-1 bg-pink-500/80 hover:bg-pink-500 rounded text-white"
                      title="Apply"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => handleDownloadTexture(texture)}
                      className="p-1 bg-white/20 hover:bg-white/30 rounded text-white"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTexture(texture.id)}
                      className="p-1 bg-red-500/80 hover:bg-red-500 rounded text-white"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Metadata */}
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {texture.metadata.style}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400 mb-2">Keyboard Shortcuts:</p>
        <p className="text-xs text-gray-500">Ctrl+H: Toggle panels</p>
        <p className="text-xs text-gray-500">Ctrl+L: Toggle Leva</p>
      </div>
    </div>
  );
}); 