'use client';

import React, { Suspense } from 'react';
import { BuilderLayout } from './components/layout/BuilderLayout';

export default function BuilderPage() {
  return (
    <Suspense fallback={<div>Loading builder...</div>}>
      <BuilderLayout modelPath="/models/jersey.glb" />
    </Suspense>
  );
} 