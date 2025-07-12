'use client';

import React, { useRef } from 'react';
import { useControls } from 'leva';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BasicModelProps {
  primaryColor?: string;
  secondaryColor?: string;
  pattern?: string;
  textureUrl?: string | null;
  textureId?: string | null;
}

export const BasicModel = React.memo<BasicModelProps>(function BasicModel({
  primaryColor: propPrimaryColor,
  secondaryColor: propSecondaryColor,
  pattern: propPattern,
  textureUrl,
  textureId
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Leva controls for customization
  const { 
    scale, 
    rotationY, 
    positionY,
    primaryColor, 
    secondaryColor,
    patternType 
  } = useControls('Model Controls', {
    scale: { value: 1, min: 0.5, max: 2, step: 0.1 },
    rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
    positionY: { value: 0, min: -2, max: 2, step: 0.1 },
    primaryColor: propPrimaryColor || '#ec4899',
    secondaryColor: propSecondaryColor || '#ffffff',
    patternType: { value: propPattern || 'solid', options: ['solid', 'stripes', 'gradient'] }
  });

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotationY;
      meshRef.current.position.y = positionY;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main Jersey Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2.5, 0.1]} />
        <meshStandardMaterial 
          color={primaryColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Jersey Sleeves */}
      <mesh position={[-1.2, 0.5, 0]}>
        <boxGeometry args={[0.6, 1.5, 0.1]} />
        <meshStandardMaterial 
          color={primaryColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      <mesh position={[1.2, 0.5, 0]}>
        <boxGeometry args={[0.6, 1.5, 0.1]} />
        <meshStandardMaterial 
          color={primaryColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Jersey Collar */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.1]} />
        <meshStandardMaterial 
          color={secondaryColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Pattern overlays based on selection */}
      {patternType === 'stripes' && (
        <>
          <mesh position={[0, 0.5, 0.05]}>
            <boxGeometry args={[2, 0.3, 0.01]} />
            <meshStandardMaterial color={secondaryColor} />
          </mesh>
          <mesh position={[0, -0.5, 0.05]}>
            <boxGeometry args={[2, 0.3, 0.01]} />
            <meshStandardMaterial color={secondaryColor} />
          </mesh>
        </>
      )}
      
      {/* Jersey Number */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.6, 0.8, 0.01]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
    </group>
  );
}); 