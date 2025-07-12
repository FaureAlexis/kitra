'use client';

import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useControls } from 'leva';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GLBModelProps {
  modelPath: string;
  primaryColor?: string;
  secondaryColor?: string;
  pattern?: string;
  textureUrl?: string | null;
  textureId?: string | null;
}

export const GLBModel = React.memo(function GLBModel({ 
  modelPath,
  primaryColor: propPrimaryColor,
  secondaryColor: propSecondaryColor,
  pattern: propPattern,
  textureUrl,
  textureId
}: GLBModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const hasLoadedRef = useRef(false);
  
  const gltf = useGLTF(modelPath, true);
  
  // Leva controls for customization
  const { 
    scale, 
    rotationY, 
    positionY,
    primaryColor, 
    secondaryColor 
  } = useControls('Model Controls', {
    scale: { value: 1, min: 0.5, max: 2, step: 0.1 },
    rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
    positionY: { value: 0, min: -2, max: 2, step: 0.1 },
    primaryColor: propPrimaryColor || '#ec4899',
    secondaryColor: propSecondaryColor || '#ffffff'
  });

  React.useEffect(() => {
    if (gltf && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      console.log('✅ GLB Model loaded successfully');
    }
  }, [gltf]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth rotation and positioning
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y, 
        rotationY, 
        delta * 2
      );
      meshRef.current.position.y = positionY;
      meshRef.current.scale.setScalar(scale);
    }
  });

  if (!gltf?.scene) {
    console.log('⚠️ GLB scene not ready');
    return null;
  }

  return (
    <group ref={meshRef}>
      <primitive object={gltf.scene} />
    </group>
  );
});

// Preload function
export const preloadGLBModel = (path: string) => {
  useGLTF.preload(path);
}; 