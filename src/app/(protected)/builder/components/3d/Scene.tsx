'use client';

import React from 'react';
import { OrbitControls } from '@react-three/drei';
import { Model } from './Model';

interface SceneProps {
  modelPath: string;
  primaryColor?: string;
  secondaryColor?: string;
  pattern?: string;
  textureUrl?: string | null;
  textureId?: string | null;
}

export const Scene = React.memo(function Scene({ 
  modelPath,
  primaryColor,
  secondaryColor,
  pattern,
  textureUrl,
  textureId
}: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8}
        castShadow={false}
      />
      <Model 
        modelPath={modelPath}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        pattern={pattern}
        textureUrl={textureUrl}
        textureId={textureId}
      />
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={10}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
      />
    </>
  );
}); 