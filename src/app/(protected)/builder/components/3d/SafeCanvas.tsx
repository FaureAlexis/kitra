'use client';

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

interface SafeCanvasProps {
  children: React.ReactNode;
}

export const SafeCanvas = React.memo(function SafeCanvas({ children }: SafeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleContextLost = React.useCallback((event: Event) => {
    console.log('🔴 WebGL Context Lost - preventing default and attempting recovery');
    event.preventDefault();
  }, []);

  const handleContextRestored = React.useCallback((event: Event) => {
    console.log('🟢 WebGL Context Restored');
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [handleContextLost, handleContextRestored]);

  const onCreated = React.useCallback(({ gl }: any) => {
    console.log('🎨 Canvas created successfully');
    console.log('WebGL Context:', gl.getContext().isContextLost() ? 'LOST' : 'ACTIVE');
  }, []);

  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 0, 2.5], fov: 50 }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      gl={{
        antialias: false,
        alpha: true,
        preserveDrawingBuffer: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
        stencil: false,
        depth: true,
        precision: 'highp',
        logarithmicDepthBuffer: false,
        toneMapping: THREE.NoToneMapping,
      }}
      dpr={1}
      performance={{
        min: 0.1,
        max: 1,
        debounce: 200,
        current: 1
      }}
      frameloop="always"
      shadows={false}
      flat
      linear
      onCreated={onCreated}
    >
      {children}
    </Canvas>
  );
}); 