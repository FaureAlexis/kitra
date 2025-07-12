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
  playerName?: string;
  playerNumber?: string;
  flockingColor?: string;
  fontSize?: number;
}

export const Scene = React.memo(function Scene({ 
  modelPath,
  primaryColor,
  secondaryColor,
  pattern,
  textureUrl,
  textureId,
  playerName,
  playerNumber,
  flockingColor,
  fontSize
}: SceneProps) {
  return (
    <>
      {/* Very bright ambient light for light mode */}
      <ambientLight intensity={2.0} />
      
      {/* Main directional light from top-front */}
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={2.5}
        castShadow={false}
      />
      
      {/* Secondary directional light from opposite side for even lighting */}
      <directionalLight 
        position={[-5, 8, 3]} 
        intensity={2.0}
        castShadow={false}
      />
      
      {/* Fill light from below to prevent harsh shadows */}
      <directionalLight 
        position={[0, -5, 2]} 
        intensity={1.5}
        castShadow={false}
      />
      
      {/* Additional side lighting for full coverage */}
      <directionalLight 
        position={[8, 0, 0]} 
        intensity={1.2}
        castShadow={false}
      />
      
      {/* Back lighting to illuminate the rear view */}
      <directionalLight 
        position={[0, 8, -8]} 
        intensity={2.0}
        castShadow={false}
      />
      
      {/* Additional back-side lighting from angles */}
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={1.8}
        castShadow={false}
      />
      
      {/* Additional back-side lighting from angles */}
      <directionalLight 
        position={[5, 5, -5]} 
        intensity={1.8}
        castShadow={false}
      />
      
      {/* Bottom-back fill light */}
      <directionalLight 
        position={[0, -3, -3]} 
        intensity={1.0}
        castShadow={false}
      />
      
      <Model 
        modelPath={modelPath}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        pattern={pattern}
        textureUrl={textureUrl}
        textureId={textureId}
        playerName={playerName}
        playerNumber={playerNumber}
        flockingColor={flockingColor}
        fontSize={fontSize}
      />
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={1.5}
        maxDistance={8}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
      />
    </>
  );
}); 