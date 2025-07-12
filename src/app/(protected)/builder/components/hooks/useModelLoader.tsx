'use client';

import React from 'react';
import { preloadGLBModel } from '../3d/GLBModel';

interface UseModelLoaderProps {
  modelPath: string;
}

export const useModelLoader = ({ modelPath }: UseModelLoaderProps) => {
  React.useEffect(() => {
    console.log('🔍 Checking React environment...');
    console.log('React.StrictMode detected:', document.documentElement.hasAttribute('data-reactroot'));
    
    console.log('🔍 Checking available model files...');
    
    // Check for .glb file
    fetch(modelPath, { method: 'HEAD' })
      .then(response => {
        console.log('📁 GLB status:', response.status, response.ok);
        if (response.ok) {
          // Preload the model if it exists
          preloadGLBModel(modelPath);
        }
      })
      .catch(error => {
        console.log('📁 GLB not found:', error.message);
      });
    
    // Check for .gltf file alternative
    const gltfPath = modelPath.replace('.glb', '.gltf');
    fetch(gltfPath, { method: 'HEAD' })
      .then(response => {
        console.log('📁 GLTF status:', response.status, response.ok);
      })
      .catch(error => {
        console.log('📁 GLTF not found:', error.message);
      });
  }, [modelPath]);
}; 