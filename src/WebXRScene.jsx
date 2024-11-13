import { OrbitControls } from '@react-three/drei';
import { Controllers, VRButton, XR } from '@react-three/xr';

import { Canvas } from '@react-three/fiber';
import React from 'react';

function DeskScene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={0.5} />

      {/* Sample Desk Objects */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshStandardMaterial color={'#8b4513'} />
      </mesh>
      <mesh position={[0, 0.55, -0.3]}>
        <boxGeometry args={[0.2, 0.05, 0.1]} />
        <meshStandardMaterial color={'#333'} />
      </mesh>
    </>
  );
}

export default function WebXRScene() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <VRButton />
      <Canvas>
        <XR>
          <DeskScene />
          <OrbitControls />
          <Controllers />
        </XR>
      </Canvas>
    </div>
  );
}
