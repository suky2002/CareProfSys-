// V2BookShelfModel.jsx
import React from 'react';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

export default function V2BookShelfModel(props) {
  const fbx = useLoader(FBXLoader, '/models/V2BookShelf.fbx');

  // Dezactivăm transparența și forțăm un MeshStandardMaterial simplu
  fbx.traverse((child) => {
    if (child.isMesh) {
      const map = child.material.map || null;
      child.material = new THREE.MeshStandardMaterial({
        map,
        transparent: false,
        opacity: 1,
        // dacă textura originală are toneMapping greșit, poți face `toneMapped: false`
        toneMapped: true,
      });
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return <primitive object={fbx} {...props} />;
}
