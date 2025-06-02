// src/components/Monitor.jsx
import React from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, DoubleSide } from 'three';

const Monitor = ({ monitorImage }) => {
  const dekstopTex = useLoader(TextureLoader, '/Imagini/Dekstopfree.png');
  const numberedTextures = useLoader(TextureLoader, [
    '/Imagini/1.jpg',
    '/Imagini/2.jpg',
    '/Imagini/3.jpg',
    '/Imagini/4.jpg',
    '/Imagini/5.jpg'
  ]);

  let currentTexture = null;
  if (monitorImage === 'Dekstopfree.png') {
    currentTexture = dekstopTex;
  } else {
    const idx = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'].indexOf(monitorImage);
    if (idx >= 0) currentTexture = numberedTextures[idx];
  }

  return (
    <group position={[0, 1.9, -1.5]}>
      <mesh>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="black" />
      </mesh>
      {currentTexture && (
        <mesh position={[0, 0, -0.055]}>
          <planeGeometry args={[1.8, 1.0]} />
          <meshStandardMaterial
            map={currentTexture}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
};

export default Monitor;
