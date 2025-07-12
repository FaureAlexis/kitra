'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, Text } from '@react-three/drei';
import { useControls } from 'leva';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { textureLoader } from '../../../../../lib/texture-loader';
import { useTextureStorage } from '../../../../../hooks/useTextureStorage';

interface GLBModelProps {
  modelPath: string;
  primaryColor?: string;
  secondaryColor?: string;
  pattern?: string;
  textureUrl?: string | null;
  textureId?: string | null;
  playerName?: string;
  playerNumber?: string;
  flockingColor?: string;
  fontSize?: number;
}

export const GLBModel = React.memo(function GLBModel({ 
  modelPath,
  primaryColor: propPrimaryColor,
  secondaryColor: propSecondaryColor,
  pattern: propPattern,
  textureUrl,
  textureId,
  playerName = '',
  playerNumber = '',
  flockingColor = '#ffffff',
  fontSize = 0.4
}: GLBModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const hasLoadedRef = useRef(false);
  const originalMaterialsRef = useRef<Map<string, THREE.Material>>(new Map());
  const [appliedTexture, setAppliedTexture] = useState<THREE.Texture | null>(null);
  const { getTexture } = useTextureStorage();
  
  const gltf = useGLTF(modelPath, true);
  
  // Leva controls for customization
  const { 
    scale, 
    rotationY, 
    positionY,
    primaryColor, 
    secondaryColor,
    useTexture
  } = useControls('Model Controls', {
    scale: { value: 1, min: 0.5, max: 2, step: 0.1 },
    rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
    positionY: { value: 0, min: -2, max: 2, step: 0.1 },
    primaryColor: propPrimaryColor || '#ec4899',
    secondaryColor: propSecondaryColor || '#ffffff',
    useTexture: !!textureId
  });

  // Auto-enable texture when textureId is provided
  const shouldUseTexture = textureId ? true : useTexture;

  // Store original materials when GLB loads
  useEffect(() => {
    if (gltf?.scene && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      console.log('✅ GLB Model loaded successfully');
      
      // Store original materials
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material;
          if (material instanceof THREE.MeshStandardMaterial) {
            // Clone the original material to preserve it
            const clonedMaterial = material.clone();
            originalMaterialsRef.current.set(child.uuid, clonedMaterial);
          }
        }
      });
    }
  }, [gltf]);

  // Load and apply texture when textureId changes
  useEffect(() => {
    console.log('GLBModel texture effect:', { textureId, shouldUseTexture, hasScene: !!gltf?.scene });
    
    if (textureId && shouldUseTexture && gltf?.scene) {
      const storedTexture = getTexture(textureId);
      console.log('GLB found stored texture:', !!storedTexture);
      
      if (storedTexture) {
        textureLoader.loadFromBase64(storedTexture.textureData)
          .then(texture => {
            console.log('GLB texture loaded successfully');
            setAppliedTexture(texture);
            
            // Apply texture to all mesh materials
            let materialCount = 0;
            gltf.scene.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material) {
                const material = child.material;
                if (material instanceof THREE.MeshStandardMaterial) {
                  console.log(`GLB applying texture to material ${materialCount}`);
                  textureLoader.applyTextureToMaterial(material, texture);
                  materialCount++;
                }
              }
            });
            console.log(`GLB applied texture to ${materialCount} materials`);
          })
          .catch(error => {
            console.error('Failed to load texture:', error);
          });
      }
    } else {
      // Remove texture and restore original materials
      console.log('GLB removing texture from materials');
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const originalMaterial = originalMaterialsRef.current.get(child.uuid);
          if (originalMaterial) {
            // Restore original material
            child.material = originalMaterial.clone();
          } else {
            // Fallback: just remove texture
            textureLoader.removeTextureFromMaterial(child.material);
          }
        }
      });
      setAppliedTexture(null);
    }
  }, [textureId, shouldUseTexture, getTexture, gltf]);

  // Update colors when color controls change
  useEffect(() => {
    if (gltf?.scene && !shouldUseTexture) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material;
          if (material instanceof THREE.MeshStandardMaterial) {
            // Apply color based on material name or position
            const materialName = material.name.toLowerCase();
            if (materialName.includes('primary') || materialName.includes('body')) {
              material.color.set(primaryColor);
            } else if (materialName.includes('secondary') || materialName.includes('accent')) {
              material.color.set(secondaryColor);
            }
          }
        }
      });
    }
  }, [primaryColor, secondaryColor, shouldUseTexture, gltf]);

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
      
      {/* Player Name on back of jersey */}
      {playerName && (
        <Text
          position={[0, 0.5, -0.1]}
          fontSize={fontSize * 0.8}
          color={flockingColor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.02}
          rotation={[0, Math.PI, 0]}
        >
          {playerName.toUpperCase()}
        </Text>
      )}
      
      {/* Player Number on back of jersey */}
      {playerNumber && (
        <Text
          position={[0, -0.2, -0.1]}
          fontSize={fontSize * 1.5}
          color={flockingColor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          rotation={[0, Math.PI, 0]}
        >
          {playerNumber}
        </Text>
      )}
      
      {/* Texture overlay indicator */}
      {shouldUseTexture && appliedTexture && (
        <mesh position={[0, -2, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.01]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#003300"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
});

// Preload function
export const preloadGLBModel = (path: string) => {
  useGLTF.preload(path);
}; 