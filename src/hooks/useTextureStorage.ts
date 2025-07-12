import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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
  getStorageInfo: () => {
    totalSize: number;
    maxSize: number;
    usagePercent: number;
    textureCount: number;
    maxTextureCount: number;
    remainingSpace: number;
    formattedSize: string;
    formattedMaxSize: string;
    formattedRemainingSpace: string;
    isNearLimit: boolean;
    isFull: boolean;
  };
  cleanup: () => void;
  // New IPFS-related methods
  updateTextureIPFS: (id: string, ipfsData: { ipfsHash: string; ipfsUrl: string; designName?: string; designDescription?: string }) => void;
  getUploadedTextures: () => StoredTexture[];
  getUnuploadedTextures: () => StoredTexture[];
}

const STORAGE_KEY = 'kitra_textures';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit (realistic for localStorage)
const MAX_TEXTURE_COUNT = 15;

export const useTextureStorage = (): TextureStorageHook => {
  const [textures, setTextures] = useState<StoredTexture[]>([]);

  // Load textures from localStorage on mount
  useEffect(() => {
    console.log('🔄 [INIT] Loading textures from localStorage...');
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('📦 [INIT] Raw stored data:', {
        hasData: !!stored,
        dataLength: stored?.length || 0,
        dataPreview: stored?.substring(0, 100) + '...'
      });
      
      if (stored) {
        const parsedTextures: StoredTexture[] = JSON.parse(stored);
        console.log('📋 [INIT] Parsed textures:', {
          count: parsedTextures.length,
          ids: parsedTextures.map(t => t.id),
          totalSize: parsedTextures.reduce((total, t) => total + (t.textureData.length * 0.75), 0)
        });
        
        // Create Object URLs for display
        const texturesWithUrls = parsedTextures.map(texture => ({
          ...texture,
          url: createObjectURL(texture.textureData)
        }));
        
        console.log('✅ [INIT] Created Object URLs and setting textures state');
        setTextures(texturesWithUrls);
      } else {
        console.log('📭 [INIT] No stored textures found');
      }
    } catch (error) {
      console.error('❌ [INIT] Failed to load textures from storage:', error);
      // Clear corrupted storage
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ [INIT] Cleared corrupted storage');
    }
  }, []);

  // Debug effect to track texture state changes
  useEffect(() => {
    console.log('📊 [STATE] Textures state changed:', {
      count: textures.length,
      ids: textures.map(t => t.id),
      totalSize: textures.reduce((total, t) => total + (t.textureData.length * 0.75), 0),
      hasUrls: textures.map(t => ({ id: t.id, hasUrl: !!t.url }))
    });
  }, [textures]);

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

  // Save textures to localStorage with progressive cleanup on quota exceeded
  const saveToStorage = useCallback((newTextures: StoredTexture[]) => {
    console.log('🔄 [STORAGE] Starting saveToStorage with:', {
      inputCount: newTextures.length,
      inputIds: newTextures.map(t => t.id)
    });
    
    const originalCount = newTextures.length;
    let attemptCount = 0;
    
    const attemptSave = (texturesToSave: StoredTexture[]): StoredTexture[] => {
      attemptCount++;
      console.log(`📝 [STORAGE] Attempt ${attemptCount} - trying to save ${texturesToSave.length} textures`);
      
      try {
        // Remove Object URLs before saving (they can't be serialized)
        const texturesForStorage = texturesToSave.map(({ url, ...texture }) => texture);
        const dataToSave = JSON.stringify(texturesForStorage);
        const sizeInBytes = new Blob([dataToSave]).size;
        
        console.log(`💾 [STORAGE] Attempt ${attemptCount} - data size: ${sizeInBytes} bytes (${Math.round(sizeInBytes/1024)}KB)`);
        
        localStorage.setItem(STORAGE_KEY, dataToSave);
        
        console.log(`✅ [STORAGE] Successfully saved ${texturesToSave.length} textures`);
        
        // Show notification if textures were removed (but defer toast to avoid render issues)
        const removedCount = originalCount - texturesToSave.length;
        if (removedCount > 0) {
          console.log(`🗑️ [STORAGE] Removed ${removedCount} textures due to space constraints`);
          // Defer toast to avoid React render cycle issues
          setTimeout(() => {
            toast.warning(`Storage full! Removed ${removedCount} oldest texture${removedCount > 1 ? 's' : ''} to make space.`, {
              description: 'Your browser storage is limited. Consider clearing old textures.',
              duration: 4000,
            });
          }, 100);
        }
        
        return texturesToSave;
      } catch (error) {
        console.error(`❌ [STORAGE] Attempt ${attemptCount} failed:`, error);
        
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn(`⚠️ [STORAGE] QuotaExceededError on attempt ${attemptCount}. Current texture count: ${texturesToSave.length}`);
          
          // Prevent infinite recursion
          if (attemptCount > 10) {
            console.error('🔄 [STORAGE] Too many attempts, bailing out');
            localStorage.removeItem(STORAGE_KEY);
            setTimeout(() => {
              toast.error('Storage quota exceeded! Unable to save textures after multiple attempts.', {
                description: 'Please clear browser storage manually.',
                duration: 6000,
              });
            }, 100);
            return [];
          }
          
          // Remove oldest texture and try again
          if (texturesToSave.length > 1) {
            const reducedTextures = texturesToSave.slice(0, -1);
            const removed = texturesToSave[texturesToSave.length - 1];
            console.log(`🗑️ [STORAGE] Removing oldest texture: ${removed.id}`);
            
            if (removed.url) {
              URL.revokeObjectURL(removed.url);
            }
            
            return attemptSave(reducedTextures);
          } else {
            // If we're down to 1 texture and still can't save, clear storage
            console.error('💥 [STORAGE] Cannot save even single texture due to quota limits');
            localStorage.removeItem(STORAGE_KEY);
            setTimeout(() => {
              toast.error('Storage quota exceeded! Unable to save textures. Please clear browser storage.', {
                description: 'Try clearing cache or using fewer textures.',
                duration: 6000,
              });
            }, 100);
            return [];
          }
        } else {
          console.error('💥 [STORAGE] Non-quota error:', error);
          setTimeout(() => {
            toast.error('Failed to save textures to storage', {
              description: 'Please try again or clear browser storage.',
              duration: 4000,
            });
          }, 100);
          return texturesToSave;
        }
      }
    };

    const result = attemptSave(newTextures);
    console.log('🏁 [STORAGE] saveToStorage completed with result:', {
      outputCount: result.length,
      outputIds: result.map(t => t.id),
      removedCount: originalCount - result.length,
      totalAttempts: attemptCount
    });
    
    return result;
  }, []);

  // Calculate total storage size
  const getTotalSize = useCallback((): number => {
    return textures.reduce((total, texture) => {
      return total + (texture.textureData.length * 0.75); // base64 is ~33% larger than binary
    }, 0);
  }, [textures]);

  // Get storage usage information
  const getStorageInfo = useCallback(() => {
    const totalSize = getTotalSize();
    const maxSize = MAX_STORAGE_SIZE;
    const usagePercent = (totalSize / maxSize) * 100;
    
    return {
      totalSize,
      maxSize,
      usagePercent,
      textureCount: textures.length,
      maxTextureCount: MAX_TEXTURE_COUNT,
      remainingSpace: maxSize - totalSize,
      formattedSize: formatBytes(totalSize),
      formattedMaxSize: formatBytes(maxSize),
      formattedRemainingSpace: formatBytes(maxSize - totalSize),
      isNearLimit: usagePercent > 80,
      isFull: usagePercent > 95
    };
  }, [textures, getTotalSize]);

  // Format bytes for display
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Add new texture
  const addTexture = useCallback((texture: StoredTexture) => {
    console.log('➕ [ADD_TEXTURE] Starting addTexture with:', {
      textureId: texture.id,
      textureSize: texture.textureData.length,
      prompt: texture.metadata.prompt.substring(0, 50) + '...'
    });
    
    setTextures(prev => {
      console.log('📊 [ADD_TEXTURE] Previous state:', {
        prevCount: prev.length,
        prevIds: prev.map(t => t.id)
      });
      
      let newTextures = [...prev];
      
      // Check if texture already exists
      const existingIndex = newTextures.findIndex(t => t.id === texture.id);
      if (existingIndex !== -1) {
        console.log('🔄 [ADD_TEXTURE] Updating existing texture at index:', existingIndex);
        // Update existing texture
        if (newTextures[existingIndex].url) {
          URL.revokeObjectURL(newTextures[existingIndex].url!);
        }
        newTextures[existingIndex] = {
          ...texture,
          url: createObjectURL(texture.textureData)
        };
      } else {
        console.log('✨ [ADD_TEXTURE] Adding new texture');
        // Add new texture
        const textureWithUrl = {
          ...texture,
          url: createObjectURL(texture.textureData)
        };
        newTextures.unshift(textureWithUrl); // Add to beginning
      }

      console.log('📏 [ADD_TEXTURE] After adding/updating:', {
        newCount: newTextures.length,
        maxCount: MAX_TEXTURE_COUNT
      });

      // Enforce limits
      if (newTextures.length > MAX_TEXTURE_COUNT) {
        console.log(`✂️ [ADD_TEXTURE] Enforcing count limit: removing ${newTextures.length - MAX_TEXTURE_COUNT} textures`);
        const removed = newTextures.splice(MAX_TEXTURE_COUNT);
        removed.forEach(t => {
          console.log(`🗑️ [ADD_TEXTURE] Removing excess texture: ${t.id}`);
          if (t.url) URL.revokeObjectURL(t.url);
        });
      }

      // Check storage size
      const totalSize = newTextures.reduce((total, t) => total + (t.textureData.length * 0.75), 0);
      console.log('📏 [ADD_TEXTURE] Size check:', {
        totalSize,
        maxSize: MAX_STORAGE_SIZE,
        exceedsLimit: totalSize > MAX_STORAGE_SIZE
      });
      
      if (totalSize > MAX_STORAGE_SIZE) {
        console.log('✂️ [ADD_TEXTURE] Enforcing size limit');
        // Remove oldest textures until under limit
        let currentSize = totalSize;
        while (newTextures.length > 0 && currentSize > MAX_STORAGE_SIZE) {
          const removed = newTextures.pop();
          if (removed) {
            console.log(`🗑️ [ADD_TEXTURE] Removing oversized texture: ${removed.id}`);
            currentSize -= (removed.textureData.length * 0.75);
            if (removed.url) URL.revokeObjectURL(removed.url);
          }
        }
        console.log('📏 [ADD_TEXTURE] After size enforcement:', {
          remainingCount: newTextures.length,
          finalSize: currentSize
        });
      }

      console.log('💾 [ADD_TEXTURE] About to save to storage:', {
        finalCount: newTextures.length,
        finalIds: newTextures.map(t => t.id)
      });

      // Save to storage and use the result (which may be reduced due to quota limits)
      const savedTextures = saveToStorage(newTextures);
      
      console.log('🏁 [ADD_TEXTURE] Final result:', {
        savedCount: savedTextures.length,
        savedIds: savedTextures.map(t => t.id),
        wasReduced: savedTextures.length < newTextures.length
      });
      
      return savedTextures;
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
      const savedTextures = saveToStorage(newTextures);
      return savedTextures;
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
        const savedTextures = saveToStorage(newTextures);
        return savedTextures;
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
      const savedTextures = saveToStorage(newTextures);
      return savedTextures;
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
    getStorageInfo,
    cleanup,
    updateTextureIPFS,
    getUploadedTextures,
    getUnuploadedTextures
  };
}; 