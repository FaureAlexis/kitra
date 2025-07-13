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

export interface SaveDesignToIPFSResult {
  success: boolean;
  ipfsHash?: string;
  ipfsUrl?: string;
  metadataHash?: string;
  metadataUrl?: string;
  error?: string;
}

export interface SaveDesignRequest {
  textureId: string;
  designName: string;
  designDescription: string;
  userAddress?: string;
}

export interface SaveDesignAPIRequest {
  textureData: string; // base64 encoded
  designName: string;
  designDescription: string;
  prompt: string;
  style: string;
  kitType: string;
  userAddress?: string;
  mintAsNFT?: boolean; // Add flag to mint as NFT candidate
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
   * Save a design to IPFS permanently
   */
  async saveDesignToIPFS(apiRequest: SaveDesignAPIRequest): Promise<SaveDesignToIPFSResult> {
    console.log('🚀 [CLIENT] Starting IPFS save process...');
    console.log('📋 [CLIENT] API Request data:', {
      designName: apiRequest.designName,
      designDescription: apiRequest.designDescription?.substring(0, 100) + '...',
      prompt: apiRequest.prompt?.substring(0, 100) + '...',
      style: apiRequest.style,
      kitType: apiRequest.kitType,
      userAddress: apiRequest.userAddress,
      textureDataLength: apiRequest.textureData?.length || 0,
      textureDataPrefix: apiRequest.textureData?.substring(0, 50) + '...'
    });
    
    try {
      // Validate input
      console.log('🔍 [CLIENT] Validating input...');
      if (!apiRequest.textureData || !apiRequest.designName || !apiRequest.prompt) {
        console.error('❌ [CLIENT] Missing required fields:', {
          hasTextureData: !!apiRequest.textureData,
          hasDesignName: !!apiRequest.designName,
          hasPrompt: !!apiRequest.prompt
        });
        return {
          success: false,
          error: 'Texture data, design name, and prompt are required'
        };
      }
      console.log('✅ [CLIENT] Input validation passed');

      console.log('🌐 [CLIENT] Sending request to API...');
      const response = await fetch(`${this.baseUrl}/designs/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest),
      });

      console.log('📡 [CLIENT] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      console.log('📥 [CLIENT] Response data:', data);

      if (!response.ok) {
        console.error('❌ [CLIENT] API request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error
        });
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      if (!data.success) {
        console.error('❌ [CLIENT] API returned failure:', data.error);
        return {
          success: false,
          error: data.error || 'Failed to save design to IPFS'
        };
      }

      console.log('🎉 [CLIENT] Design saved successfully!', {
        ipfsHash: data.ipfsHash,
        ipfsUrl: data.ipfsUrl,
        metadataHash: data.metadataHash,
        metadataUrl: data.metadataUrl
      });

      return {
        success: true,
        ipfsHash: data.ipfsHash,
        ipfsUrl: data.ipfsUrl,
        metadataHash: data.metadataHash,
        metadataUrl: data.metadataUrl
      };

    } catch (error) {
      console.error('💥 [CLIENT] Critical error occurred:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
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
      console.log('🎯 [AI_SERVICE] Starting generateTexture...', {
        prompt: options.prompt.substring(0, 50) + '...',
        style: options.style,
        kitType: options.kitType
      });
      const result = await aiTextureService.generateTexture(options);
      console.log('🎯 [AI_SERVICE] Service returned result:', {
        success: result.success,
        hasTexture: !!result.texture,
        textureId: result.texture?.id,
        hasUrl: !!result.texture?.url,
        error: result.error
      });
      
      if (result.success && result.texture) {
        console.log('🎯 [AI_SERVICE] Adding texture to storage...');
        
        // Create Object URL immediately for the modal (before storage)
        const createObjectURL = (base64Data: string): string => {
          try {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            return URL.createObjectURL(blob);
          } catch (error) {
            console.error('Failed to create object URL:', error);
            return '';
          }
        };
        
        // Add Object URL to texture for immediate modal display
        result.texture.url = createObjectURL(result.texture.textureData);
        console.log('🎯 [AI_SERVICE] Created Object URL for modal:', {
          textureId: result.texture.id,
          hasUrl: !!result.texture.url
        });
        
        // Store texture in browser storage (may be evicted if storage is full)
        textureStorage.addTexture(result.texture);
        
        console.log('🎯 [AI_SERVICE] Texture added to storage');
      }
      
      console.log('🎯 [AI_SERVICE] Final result being returned:', {
        success: result.success,
        hasTexture: !!result.texture,
        hasUrl: !!result.texture?.url,
        textureId: result.texture?.id
      });
      
      return result;
    },
    saveDesignToIPFS: async (request: SaveDesignRequest) => {
      console.log('🚀 [HOOK] Starting save design to IPFS...');
      console.log('📋 [HOOK] Request data:', {
        textureId: request.textureId,
        designName: request.designName,
        designDescription: request.designDescription?.substring(0, 100) + '...',
        userAddress: request.userAddress
      });
      
      // Get the texture data from storage
      console.log('🔍 [HOOK] Retrieving texture from storage...');
      const texture = textureStorage.getTexture(request.textureId);
      console.log('📦 [HOOK] Texture retrieval result:', {
        found: !!texture,
        textureId: request.textureId,
        availableTextures: textureStorage.textures.length,
        availableTextureIds: textureStorage.textures.map(t => t.id)
      });
      
      if (!texture) {
        console.error('❌ [HOOK] Texture not found in storage');
        return {
          success: false,
          error: 'Texture not found in storage'
        };
      }
      
      console.log('✅ [HOOK] Texture found:', {
        id: texture.id,
        prompt: texture.metadata.prompt?.substring(0, 100) + '...',
        style: texture.metadata.style,
        kitType: texture.metadata.kitType,
        textureDataLength: texture.textureData?.length || 0,
        hasIPFSData: !!texture.ipfsHash
      });

      // Construct API request with texture data
      console.log('🔧 [HOOK] Constructing API request...');
      const apiRequest: SaveDesignAPIRequest = {
        textureData: texture.textureData,
        designName: request.designName,
        designDescription: request.designDescription,
        prompt: texture.metadata.prompt,
        style: texture.metadata.style,
        kitType: texture.metadata.kitType,
        userAddress: request.userAddress,
        mintAsNFT: true // Set default to true for minting
      };
      console.log('✅ [HOOK] API request constructed');

      console.log('🌐 [HOOK] Calling service...');
      const result = await aiTextureService.saveDesignToIPFS(apiRequest);
      console.log('📥 [HOOK] Service result:', result);
      
      if (result.success) {
        console.log('🎉 [HOOK] Save successful, updating texture with IPFS data...');
        // Update the texture with IPFS data
        textureStorage.updateTextureIPFS(request.textureId, {
          ipfsHash: result.ipfsHash!,
          ipfsUrl: result.ipfsUrl!,
          designName: request.designName,
          designDescription: request.designDescription
        });
        console.log('✅ [HOOK] Texture updated with IPFS data');
      } else {
        console.error('❌ [HOOK] Save failed:', result.error);
      }
      
      return result;
    },
    ...textureStorage,
    generatePromptSuggestions: (prompt: string) => 
      aiTextureService.generatePromptSuggestions(prompt),
    validatePrompt: (prompt: string) => aiTextureService.validatePrompt(prompt)
  };
}; 