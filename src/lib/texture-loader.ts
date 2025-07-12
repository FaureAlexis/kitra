import * as THREE from 'three';

export interface TextureLoaderOptions {
  flipY?: boolean;
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  minFilter?: THREE.MinificationTextureFilter;
  magFilter?: THREE.MagnificationTextureFilter;
  format?: THREE.PixelFormat;
  type?: THREE.TextureDataType;
  anisotropy?: number;
}

export class TextureLoader {
  private loader: THREE.TextureLoader;
  private cache: Map<string, THREE.Texture> = new Map();

  constructor() {
    this.loader = new THREE.TextureLoader();
  }

  /**
   * Load texture from base64 data
   */
  async loadFromBase64(
    base64Data: string,
    options: TextureLoaderOptions = {}
  ): Promise<THREE.Texture> {
    const cacheKey = `b64_${base64Data.substring(0, 50)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!.clone();
    }

    try {
      // Convert base64 to blob URL
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);

      const texture = await this.loadFromUrl(blobUrl, options);
      
      // Cache the texture
      this.cache.set(cacheKey, texture);
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
      
      return texture;
    } catch (error) {
      console.error('Failed to load texture from base64:', error);
      throw error;
    }
  }

  /**
   * Load texture from URL
   */
  async loadFromUrl(
    url: string,
    options: TextureLoaderOptions = {}
  ): Promise<THREE.Texture> {
    const cacheKey = `url_${url}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!.clone();
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          this.applyOptions(texture, options);
          this.cache.set(cacheKey, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error('Failed to load texture:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Apply texture options
   */
  private applyOptions(texture: THREE.Texture, options: TextureLoaderOptions): void {
    const {
      flipY = true,
      wrapS = THREE.RepeatWrapping,
      wrapT = THREE.RepeatWrapping,
      minFilter = THREE.LinearMipmapLinearFilter,
      magFilter = THREE.LinearFilter,
      format = THREE.RGBAFormat,
      type = THREE.UnsignedByteType,
      anisotropy = 16
    } = options;

    texture.flipY = flipY;
    texture.wrapS = wrapS;
    texture.wrapT = wrapT;
    texture.minFilter = minFilter;
    texture.magFilter = magFilter;
    texture.format = format;
    texture.type = type;
    texture.anisotropy = Math.min(anisotropy, 16); // Clamp to reasonable value
    texture.needsUpdate = true;
  }

  /**
   * Create material with texture
   */
  createMaterialWithTexture(
    texture: THREE.Texture,
    baseColor: string = '#ffffff',
    materialType: 'standard' | 'basic' = 'standard'
  ): THREE.Material {
    const commonProps = {
      map: texture,
      transparent: true,
      side: THREE.FrontSide,
    };

    if (materialType === 'standard') {
      return new THREE.MeshStandardMaterial({
        ...commonProps,
        color: new THREE.Color(baseColor),
        roughness: 0.7,
        metalness: 0.1,
      });
    } else {
      return new THREE.MeshBasicMaterial({
        ...commonProps,
        color: new THREE.Color(baseColor),
      });
    }
  }

  /**
   * Apply texture to existing material
   */
  applyTextureToMaterial(
    material: THREE.Material,
    texture: THREE.Texture
  ): void {
    if (material instanceof THREE.MeshStandardMaterial || 
        material instanceof THREE.MeshBasicMaterial) {
      material.map = texture;
      material.needsUpdate = true;
    }
  }

  /**
   * Remove texture from material
   */
  removeTextureFromMaterial(material: THREE.Material): void {
    if (material instanceof THREE.MeshStandardMaterial || 
        material instanceof THREE.MeshBasicMaterial) {
      if (material.map) {
        material.map.dispose();
        material.map = null;
        material.needsUpdate = true;
      }
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.forEach(texture => texture.dispose());
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Dispose specific texture from cache
   */
  disposeTexture(cacheKey: string): void {
    const texture = this.cache.get(cacheKey);
    if (texture) {
      texture.dispose();
      this.cache.delete(cacheKey);
    }
  }
}

// Singleton instance
export const textureLoader = new TextureLoader(); 