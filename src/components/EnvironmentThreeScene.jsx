import React, { useEffect, useRef } from 'react';

import { Canvas } from '@react-three/fiber';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from '@react-three/drei';

const StudioModel = () => {
  const modelRef = useRef();

  useEffect(() => {
    const loadModel = async () => {
      // Load materials
      const mtlLoader = new MTLLoader();
      mtlLoader.setPath('/models/');
      mtlLoader.load('004obj.mtl', (materials) => {
        materials.preload();

        // Load OBJ with materials
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('/models/');
        objLoader.load('004obj.obj', (object) => {
          object.scale.set(0.1, 0.1, 0.1); // Adjust the scale
          object.position.set(0, 0, 0); // Adjust the position
          modelRef.current.add(object);
        });
      });
    };

    loadModel();
  }, []);

  return <group ref={modelRef} />;
};

const EnvironmentThree = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight
          intensity={1}
          position={[10, 10, 5]}
          shadow-mapSize={[1024, 1024]}
          castShadow
        />

        {/* Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#aaa" />
        </mesh>

        {/* Studio Model */}
        <StudioModel />

        {/* Camera Controls */}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default EnvironmentThree;
