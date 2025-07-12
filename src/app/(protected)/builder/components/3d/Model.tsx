'use client';

import React, { Suspense, useRef } from 'react';
import { GLBModel } from './GLBModel';
import { BasicModel } from './BasicModel';
import { ErrorBoundary } from './ErrorBoundary';

interface ModelProps {
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

export const Model = React.memo(function Model({ 
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
}: ModelProps) {
  const [useBasicModel, setUseBasicModel] = React.useState(false);
  const hasCheckedRef = useRef(false);
  
  // Check if GLB file exists
  React.useEffect(() => {
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      console.log(`🔍 Checking for GLB file at ${modelPath}`);
      
      fetch(modelPath, { method: 'HEAD' })
        .then(response => {
          console.log('📁 GLB file check response:', response.status, response.ok);
          if (!response.ok) {
            console.log('⚠️ GLB file not found, using basic model');
            setUseBasicModel(true);
          }
        })
        .catch((error) => {
          console.log('⚠️ GLB file not accessible, using basic model', error);
          setUseBasicModel(true);
        });
    }
  }, [modelPath]);
  
  if (useBasicModel) {
    return (
      <BasicModel 
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
    );
  }
  
  return (
    <Suspense fallback={
      <BasicModel 
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
    }>
      <ErrorBoundary fallback={
        <BasicModel 
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
      }>
        <GLBModel 
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
      </ErrorBoundary>
    </Suspense>
  );
}); 