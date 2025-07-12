import { useState, useEffect, useCallback } from 'react';

export interface StoredTexture {
  id: string;
  textureData: string; // base64 encoded
  metadata: {
    prompt: string;
    style: string;
    kitType: string;
    timestamp: number;
    dimensions: string;
    format: string;
  };
  url?: string; // Object URL for display
  // IPFS Integration fields
  ipfsHash?: string; // IPFS hash for permanent storage
  ipfsUrl?: string; // IPFS gateway URL for sharing
  designName?: string; // User-provided name for the design
  designDescription?: string; // User-provided description
  isUploaded?: boolean; // Whether texture has been uploaded to IPFS
}

interface TextureStorageHook {
  textures: StoredTexture[];
  addTexture: (texture: StoredTexture) => void;
  removeTexture: (id: string) => void;
  getTexture: (id: string) => StoredTexture | undefined;
  clearAll: () => void;
  getTotalSize: () => number;
  cleanup: () => void;
  // New IPFS-related methods
  updateTextureIPFS: (id: string, ipfsData: { ipfsHash: string; ipfsUrl: string; designName?: string; designDescription?: string }) => void;
  getUploadedTextures: () => StoredTexture[];
  getUnuploadedTextures: () => StoredTexture[];
}

const STORAGE_KEY = 'kitra_textures';
const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB limit
const MAX_TEXTURE_COUNT = 20;

export const useTextureStorage = (): TextureStorageHook => {
  const [textures, setTextures] = useState<StoredTexture[]>([]);

  // Load textures from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTextures: StoredTexture[] = JSON.parse(stored);
        
        // Create Object URLs for display
        const texturesWithUrls = parsedTextures.map(texture => ({
          ...texture,
          url: createObjectURL(texture.textureData)
        }));
        
        setTextures(texturesWithUrls);
      }
    } catch (error) {
      console.error('Failed to load textures from storage:', error);
    }
  }, []);

  // Helper to create Object URL from base64
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

  // Save textures to localStorage
  const saveToStorage = useCallback((newTextures: StoredTexture[]) => {
    try {
      // Remove Object URLs before saving (they can't be serialized)
      const texturesForStorage = newTextures.map(({ url, ...texture }) => texture);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(texturesForStorage));
    } catch (error) {
      console.error('Failed to save textures to storage:', error);
    }
  }, []);

  // Calculate total storage size
  const getTotalSize = useCallback((): number => {
    return textures.reduce((total, texture) => {
      return total + (texture.textureData.length * 0.75); // base64 is ~33% larger than binary
    }, 0);
  }, [textures]);

  // Add new texture
  const addTexture = useCallback((texture: StoredTexture) => {
    setTextures(prev => {
      let newTextures = [...prev];
      
      // Check if texture already exists
      const existingIndex = newTextures.findIndex(t => t.id === texture.id);
      if (existingIndex !== -1) {
        // Update existing texture
        if (newTextures[existingIndex].url) {
          URL.revokeObjectURL(newTextures[existingIndex].url!);
        }
        newTextures[existingIndex] = {
          ...texture,
          url: createObjectURL(texture.textureData)
        };
      } else {
        // Add new texture
        const textureWithUrl = {
          ...texture,
          url: createObjectURL(texture.textureData)
        };
        newTextures.unshift(textureWithUrl); // Add to beginning
      }

      // Enforce limits
      if (newTextures.length > MAX_TEXTURE_COUNT) {
        const removed = newTextures.splice(MAX_TEXTURE_COUNT);
        removed.forEach(t => {
          if (t.url) URL.revokeObjectURL(t.url);
        });
      }

      // Check storage size
      const totalSize = newTextures.reduce((total, t) => total + (t.textureData.length * 0.75), 0);
      if (totalSize > MAX_STORAGE_SIZE) {
        // Remove oldest textures until under limit
        while (newTextures.length > 0 && totalSize > MAX_STORAGE_SIZE) {
          const removed = newTextures.pop();
          if (removed?.url) URL.revokeObjectURL(removed.url);
        }
      }

      saveToStorage(newTextures);
      return newTextures;
    });
  }, [saveToStorage]);

  // Remove texture
  const removeTexture = useCallback((id: string) => {
    setTextures(prev => {
      const newTextures = prev.filter(t => {
        if (t.id === id) {
          if (t.url) URL.revokeObjectURL(t.url);
          return false;
        }
        return true;
      });
      saveToStorage(newTextures);
      return newTextures;
    });
  }, [saveToStorage]);

  // Get specific texture
  const getTexture = useCallback((id: string): StoredTexture | undefined => {
    return textures.find(t => t.id === id);
  }, [textures]);

  // Clear all textures
  const clearAll = useCallback(() => {
    textures.forEach(texture => {
      if (texture.url) URL.revokeObjectURL(texture.url);
    });
    setTextures([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [textures]);

  // Cleanup old textures
  const cleanup = useCallback(() => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    setTextures(prev => {
      const newTextures = prev.filter(texture => {
        if (texture.metadata.timestamp < thirtyDaysAgo) {
          if (texture.url) URL.revokeObjectURL(texture.url);
          return false;
        }
        return true;
      });
      if (newTextures.length !== prev.length) {
        saveToStorage(newTextures);
      }
      return newTextures;
    });
  }, [saveToStorage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      textures.forEach(texture => {
        if (texture.url) URL.revokeObjectURL(texture.url);
      });
    };
  }, []);

  // Update texture with IPFS data
  const updateTextureIPFS = useCallback((id: string, ipfsData: { ipfsHash: string; ipfsUrl: string; designName?: string; designDescription?: string }) => {
    setTextures(prev => {
      const newTextures = prev.map(texture => {
        if (texture.id === id) {
          return {
            ...texture,
            ipfsHash: ipfsData.ipfsHash,
            ipfsUrl: ipfsData.ipfsUrl,
            designName: ipfsData.designName,
            designDescription: ipfsData.designDescription,
            isUploaded: true
          };
        }
        return texture;
      });
      saveToStorage(newTextures);
      return newTextures;
    });
  }, [saveToStorage]);

  // Get textures that have been uploaded to IPFS
  const getUploadedTextures = useCallback((): StoredTexture[] => {
    return textures.filter(texture => texture.isUploaded);
  }, [textures]);

  // Get textures that haven't been uploaded to IPFS yet
  const getUnuploadedTextures = useCallback((): StoredTexture[] => {
    return textures.filter(texture => !texture.isUploaded);
  }, [textures]);

  return {
    textures,
    addTexture,
    removeTexture,
    getTexture,
    clearAll,
    getTotalSize,
    cleanup,
    updateTextureIPFS,
    getUploadedTextures,
    getUnuploadedTextures
  };
}; 