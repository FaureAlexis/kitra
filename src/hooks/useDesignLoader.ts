import { useState, useCallback } from 'react';
import { DesignDetails, DesignDetailsResponse } from '../app/api/designs/[id]/route';
import { StoredTexture } from './useTextureStorage';

export interface UseDesignLoaderResult {
  design: DesignDetails | null;
  loading: boolean;
  error: string | null;
  loadDesign: (designId: string) => Promise<boolean>;
  clearDesign: () => void;
  applyToBuilder: () => StoredTexture | null;
}

export const useDesignLoader = (): UseDesignLoaderResult => {
  const [design, setDesign] = useState<DesignDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDesign = useCallback(async (designId: string): Promise<boolean> => {
    if (!designId) {
      setError('Design ID is required');
      return false;
    }

    console.log('🔍 [useDesignLoader] Loading design:', designId);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/designs/${designId}`);
      
      console.log('📡 [useDesignLoader] API response:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Design not found');
        }
        throw new Error(`Failed to load design: ${response.status}`);
      }

      const data: DesignDetailsResponse = await response.json();
      
      console.log('📥 [useDesignLoader] API data:', {
        success: data.success,
        hasDesign: !!data.design,
        designName: data.design?.name
      });

      if (!data.success || !data.design) {
        throw new Error(data.error || 'Failed to load design');
      }

      setDesign(data.design);
      console.log('✅ [useDesignLoader] Design loaded successfully:', data.design.name);
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ [useDesignLoader] Error loading design:', errorMessage);
      setError(errorMessage);
      setDesign(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDesign = useCallback(() => {
    console.log('🧹 [useDesignLoader] Clearing loaded design');
    setDesign(null);
    setError(null);
  }, []);

  const applyToBuilder = useCallback((): StoredTexture | null => {
    if (!design || !design.textureData) {
      console.warn('⚠️ [useDesignLoader] No design or texture data to apply');
      return null;
    }

    console.log('🎨 [useDesignLoader] Converting design to StoredTexture for builder');

    // Create a StoredTexture object that the builder can use
    const storedTexture: StoredTexture = {
      id: `loaded_${design.id}`, // Prefix to indicate this is a loaded design
      textureData: design.textureData,
      metadata: {
        prompt: design.prompt,
        style: design.style,
        kitType: design.kitType,
        timestamp: new Date(design.createdAt).getTime(),
        dimensions: '1024x1024', // Default dimensions
        format: 'png'
      },
      // IPFS data from the loaded design
      ipfsHash: design.ipfsHash,
      ipfsUrl: design.ipfsUrl,
      designName: design.name,
      designDescription: design.description,
      isUploaded: true
    };

    console.log('✅ [useDesignLoader] StoredTexture created:', {
      id: storedTexture.id,
      hasTextureData: !!storedTexture.textureData,
      hasIPFSData: !!storedTexture.ipfsHash,
      prompt: storedTexture.metadata.prompt?.substring(0, 50) + '...'
    });

    return storedTexture;
  }, [design]);

  return {
    design,
    loading,
    error,
    loadDesign,
    clearDesign,
    applyToBuilder
  };
}; 