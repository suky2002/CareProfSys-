// V2BookShelfModel.jsx
import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

export default function V2BookShelfModel(props) {

  const fbx = useLoader(FBXLoader, '/models/V2BookShelf.fbx');

  const cloned = useMemo(() => {

    const cloneScene = fbx.clone(true);

    return cloneScene;
  }, [fbx]);


  useMemo(() => {
    cloned.traverse((child) => {
      if (child.isMesh) {
        const map = child.material.map || null;
        child.material = new THREE.MeshStandardMaterial({
          map,
          transparent: false,
          opacity: 1,
          toneMapped: true,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [cloned]);


  return <primitive object={cloned} {...props} />;
}
