// AI Texture Generation Service
// Handles communication with DALL-E 3 API and texture management

export interface TextureGenerationOptions {
  prompt: string;
  style?: 'photorealistic' | 'artistic' | 'minimalist' | 'vintage' | 'modern';
  kitType?: 'home' | 'away' | 'third' | 'goalkeeper';
  colors?: string[];
  teamName?: string;
  elements?: string[];
}

export interface GeneratedTexture {
  id: string;
  textureData: string; // base64 encoded image
  metadata: {
    prompt: string;
    style: string;
    dimensions: string;
    format: string;
    timestamp: number;
  };
  blob?: Blob;
  url?: string;
}

export interface TextureGenerationResult {
  success: boolean;
  texture?: GeneratedTexture;
  error?: string;
}

export class AITextureService {
  private static instance: AITextureService;
  private baseUrl: string;
  private generatedTextures: Map<string, GeneratedTexture> = new Map();

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
   * Generate a new texture using DALL-E 3
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

      // Create texture object
      const texture = await this.processGeneratedTexture(data.texture, data.metadata);
      
      // Cache the texture
      this.generatedTextures.set(texture.id, texture);

      return {
        success: true,
        texture
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
   * Process the base64 texture data into a usable format
   */
  private async processGeneratedTexture(
    base64Data: string, 
    metadata: any
  ): Promise<GeneratedTexture> {
    const id = this.generateTextureId();
    
    // Convert base64 to blob for better memory management
    const blob = this.base64ToBlob(base64Data, 'image/png');
    const url = URL.createObjectURL(blob);

    return {
      id,
      textureData: base64Data,
      metadata,
      blob,
      url
    };
  }

  /**
   * Convert base64 string to Blob
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Generate unique texture ID
   */
  private generateTextureId(): string {
    return `texture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get cached texture by ID
   */
  getTexture(id: string): GeneratedTexture | undefined {
    return this.generatedTextures.get(id);
  }

  /**
   * Get all cached textures
   */
  getAllTextures(): GeneratedTexture[] {
    return Array.from(this.generatedTextures.values());
  }

  /**
   * Clear texture cache and free memory
   */
  clearCache(): void {
    // Revoke object URLs to prevent memory leaks
    this.generatedTextures.forEach(texture => {
      if (texture.url) {
        URL.revokeObjectURL(texture.url);
      }
    });
    
    this.generatedTextures.clear();
  }

  /**
   * Remove specific texture from cache
   */
  removeTexture(id: string): boolean {
    const texture = this.generatedTextures.get(id);
    if (texture?.url) {
      URL.revokeObjectURL(texture.url);
    }
    return this.generatedTextures.delete(id);
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

  /**
   * Get texture generation statistics
   */
  getStats(): {
    totalGenerated: number;
    cachedTextures: number;
    memoryUsage: string;
  } {
    const cachedCount = this.generatedTextures.size;
    const estimatedSize = cachedCount * 1024 * 1024; // Rough estimate: 1MB per texture
    
    return {
      totalGenerated: cachedCount, // This could be tracked separately
      cachedTextures: cachedCount,
      memoryUsage: `${(estimatedSize / 1024 / 1024).toFixed(1)} MB`
    };
  }
}

// Export singleton instance
export const aiTextureService = AITextureService.getInstance();

// Helper function for React components
export const useAITexture = () => {
  return {
    generateTexture: (options: TextureGenerationOptions) => 
      aiTextureService.generateTexture(options),
    getTexture: (id: string) => aiTextureService.getTexture(id),
    getAllTextures: () => aiTextureService.getAllTextures(),
    clearCache: () => aiTextureService.clearCache(),
    removeTexture: (id: string) => aiTextureService.removeTexture(id),
    generatePromptSuggestions: (prompt: string) => 
      aiTextureService.generatePromptSuggestions(prompt),
    validatePrompt: (prompt: string) => aiTextureService.validatePrompt(prompt),
    getStats: () => aiTextureService.getStats()
  };
}; 