'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useControls } from 'leva';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { textureLoader } from '../../../../../lib/texture-loader';
import { useTextureStorage } from '../../../../../hooks/useTextureStorage';

interface BasicModelProps {
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

export const BasicModel = React.memo<BasicModelProps>(function BasicModel({
  primaryColor: propPrimaryColor,
  secondaryColor: propSecondaryColor,
  pattern: propPattern,
  textureUrl,
  textureId,
  playerName = '',
  playerNumber = '',
  flockingColor = '#ffffff',
  fontSize = 0.4
}) {
  const meshRef = useRef<THREE.Group>(null);
  const materialRefs = useRef<THREE.MeshStandardMaterial[]>([]);
  const [appliedTexture, setAppliedTexture] = useState<THREE.Texture | null>(null);
  const { getTexture } = useTextureStorage();
  
  // Leva controls for customization
  const { 
    scale, 
    rotationY, 
    positionY,
    primaryColor, 
    secondaryColor,
    patternType,
    useTexture
  } = useControls('Model Controls', {
    scale: { value: 1, min: 0.5, max: 2, step: 0.1 },
    rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
    positionY: { value: 0, min: -2, max: 2, step: 0.1 },
    primaryColor: propPrimaryColor || '#ec4899',
    secondaryColor: propSecondaryColor || '#ffffff',
    patternType: { value: propPattern || 'solid', options: ['solid', 'stripes', 'gradient'] },
    useTexture: !!textureId
  });

  // Auto-enable texture when textureId is provided
  const shouldUseTexture = textureId ? true : useTexture;

  // Load and apply texture when textureId changes
  useEffect(() => {
    console.log('BasicModel texture effect:', { textureId, shouldUseTexture });
    
    if (textureId && shouldUseTexture) {
      const storedTexture = getTexture(textureId);
      console.log('Found stored texture:', !!storedTexture);
      
      if (storedTexture) {
        textureLoader.loadFromBase64(storedTexture.textureData)
          .then(texture => {
            console.log('Texture loaded successfully, applying to', materialRefs.current.length, 'materials');
            setAppliedTexture(texture);
            
            // Apply texture to all materials
            materialRefs.current.forEach((material, index) => {
              if (material) {
                console.log(`Applying texture to material ${index}`);
                textureLoader.applyTextureToMaterial(material, texture);
              }
            });
          })
          .catch(error => {
            console.error('Failed to load texture:', error);
          });
      }
    } else {
      // Remove texture
      console.log('Removing texture from materials');
      materialRefs.current.forEach(material => {
        if (material) {
          textureLoader.removeTextureFromMaterial(material);
        }
      });
      setAppliedTexture(null);
    }
  }, [textureId, shouldUseTexture, getTexture]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotationY;
      meshRef.current.position.y = positionY;
      meshRef.current.scale.setScalar(scale);
    }
  });

  // Create material ref and return JSX
  const createMaterial = (color: string, index: number) => {
    return (
      <meshStandardMaterial 
        ref={(material) => {
          if (material) {
            materialRefs.current[index] = material;
          }
        }}
        color={color}
        roughness={0.3}
        metalness={0.1}
        transparent={true}
        side={THREE.FrontSide}
      />
    );
  };

  return (
    <group ref={meshRef}>
      {/* Main Jersey Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2.5, 0.1]} />
        {createMaterial(primaryColor, 0)}
      </mesh>
      
      {/* Jersey Sleeves */}
      <mesh position={[-1.2, 0.5, 0]}>
        <boxGeometry args={[0.6, 1.5, 0.1]} />
        {createMaterial(primaryColor, 1)}
      </mesh>
      
      <mesh position={[1.2, 0.5, 0]}>
        <boxGeometry args={[0.6, 1.5, 0.1]} />
        {createMaterial(primaryColor, 2)}
      </mesh>
      
      {/* Jersey Collar */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.1]} />
        {createMaterial(secondaryColor, 3)}
      </mesh>
      
      {/* Pattern overlays based on selection */}
      {patternType === 'stripes' && !shouldUseTexture && (
        <>
          <mesh position={[0, 0.5, 0.05]}>
            <boxGeometry args={[2, 0.3, 0.01]} />
            {createMaterial(secondaryColor, 4)}
          </mesh>
          <mesh position={[0, -0.5, 0.05]}>
            <boxGeometry args={[2, 0.3, 0.01]} />
            {createMaterial(secondaryColor, 5)}
          </mesh>
        </>
      )}
      
      {/* Jersey Number */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.6, 0.8, 0.01]} />
        {createMaterial(secondaryColor, 6)}
      </mesh>
      
      {/* Player Name on back of jersey - Simple geometry approach */}
      {playerName && (
        <group position={[0, 0.3, -0.8]} rotation={[0, Math.PI, 0]}>
          <mesh>
            <boxGeometry args={[playerName.length * fontSize * 0.4, fontSize * 0.6, 0.02]} />
            <meshStandardMaterial 
              color={flockingColor}
              transparent={true}
              opacity={1.0}
              emissive={flockingColor}
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      )}
      
      {/* Player Number on back of jersey - Simple geometry approach */}
      {playerNumber && (
        <group position={[0, -0.4, -0.8]} rotation={[0, Math.PI, 0]}>
          <mesh>
            <boxGeometry args={[playerNumber.length * fontSize * 0.8, fontSize * 1.4, 0.02]} />
            <meshStandardMaterial 
              color={flockingColor}
              transparent={true}
              opacity={1.0}
              emissive={flockingColor}
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      )}
      
      {/* Texture overlay indicator */}
      {shouldUseTexture && appliedTexture && (
        <mesh position={[0, -1.5, 0.1]}>
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