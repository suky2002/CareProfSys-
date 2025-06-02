// V2BookShelfModel.jsx
import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

export default function V2BookShelfModel(props) {
  // 1) Încarcă FBX-ul o singură dată din cache:
  const fbx = useLoader(FBXLoader, '/models/V2BookShelf.fbx');

  // 2) Clonează întregul obiect încărcat o singură dată per instanță:
  const cloned = useMemo(() => {
    // Dacă modelul tău nu are armătură/skinning, poți folosi directly .clone(true)
    const cloneScene = fbx.clone(true);
    // Alternativ, dacă e FBX animat/skinned, folosește:
    // import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';
    // const cloneScene = SkeletonUtils.clone(fbx);
    return cloneScene;
  }, [fbx]);

  // 3) Aplică material (sau remix) pe fiecare mesh din clonă – nu pe fbx original:
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

  // 4) Returnează clonă, nu fbx original
  return <primitive object={cloned} {...props} />;
}
