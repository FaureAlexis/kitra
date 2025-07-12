// AI Texture Generation Service
// Handles communication with GPT-image-1 API and texture management

import { useTextureStorage, type StoredTexture } from '../../hooks/useTextureStorage';

export interface TextureGenerationOptions {
  prompt: string;
  style?: 'photorealistic' | 'artistic' | 'minimalist' | 'vintage' | 'modern';
  kitType?: 'home' | 'away' | 'third' | 'goalkeeper';
  colors?: string[];
  teamName?: string;
  elements?: string[];
}

export interface TextureGenerationResult {
  success: boolean;
  texture?: StoredTexture;
  error?: string;
}

export class AITextureService {
  private static instance: AITextureService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com/api' 
      : '/api';
  }

  static getInstance(): AITextureService {
    if (!AITextureService.instance) {
      AITextureService.instance = new AITextureService();
    }
    return AITextureService.instance;
  }

  /**
   * Generate a new texture using GPT-image-1
   */
  async generateTexture(options: TextureGenerationOptions): Promise<TextureGenerationResult> {
    try {
      // Validate input
      if (!options.prompt?.trim()) {
        return {
          success: false,
          error: 'Prompt is required'
        };
      }

      // Show loading state could be handled by the calling component
      const response = await fetch(`${this.baseUrl}/generate-texture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      if (!data.success || !data.texture) {
        return {
          success: false,
          error: data.error || 'Failed to generate texture'
        };
      }

      // Create StoredTexture object
      const storedTexture: StoredTexture = {
        id: this.generateTextureId(),
        textureData: data.texture,
        metadata: {
          prompt: options.prompt,
          style: options.style || 'modern',
          kitType: options.kitType || 'home',
          timestamp: Date.now(),
          dimensions: data.metadata?.dimensions || '1024x1024',
          format: data.metadata?.format || 'png'
        }
      };

      return {
        success: true,
        texture: storedTexture
      };

    } catch (error) {
      console.error('Texture generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate unique texture ID
   */
  private generateTextureId(): string {
    return `texture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate example prompts based on user input
   */
  generatePromptSuggestions(basePrompt: string): string[] {
    const suggestions = [
      `${basePrompt} with bold geometric patterns`,
      `${basePrompt} with subtle gradient effects`, 
      `${basePrompt} with dynamic lightning bolt designs`,
      `${basePrompt} with classic stripes and modern accents`,
      `${basePrompt} with abstract artistic elements`
    ];
    
    return suggestions;
  }

  /**
   * Validate prompt for content policy compliance
   */
  validatePrompt(prompt: string): { valid: boolean; suggestions?: string[] } {
    const issues: string[] = [];
    
    // Basic validation rules
    if (prompt.length > 1000) {
      issues.push('Prompt is too long (max 1000 characters)');
    }
    
    if (prompt.length < 10) {
      issues.push('Prompt is too short (min 10 characters)');
    }
    
    // Content policy checks (basic)
    const problematicTerms = ['violence', 'inappropriate', 'offensive'];
    const hasProblematicContent = problematicTerms.some(term => 
      prompt.toLowerCase().includes(term)
    );
    
    if (hasProblematicContent) {
      issues.push('Prompt may contain inappropriate content');
    }
    
    return {
      valid: issues.length === 0,
      suggestions: issues.length > 0 ? issues : undefined
    };
  }
}

// Export singleton instance
export const aiTextureService = AITextureService.getInstance();

// Helper function for React components
export const useAITexture = () => {
  const textureStorage = useTextureStorage();
  
  return {
    generateTexture: async (options: TextureGenerationOptions) => {
      const result = await aiTextureService.generateTexture(options);
      if (result.success && result.texture) {
        // Store texture in browser storage
        textureStorage.addTexture(result.texture);
      }
      return result;
    },
    ...textureStorage,
    generatePromptSuggestions: (prompt: string) => 
      aiTextureService.generatePromptSuggestions(prompt),
    validatePrompt: (prompt: string) => aiTextureService.validatePrompt(prompt)
  };
}; 