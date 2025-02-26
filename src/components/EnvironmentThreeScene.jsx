import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

const StudioModel = () => {
  const modelRef = useRef();

  useEffect(() => {
    const loadModel = async () => {
      const mtlLoader = new MTLLoader();
      mtlLoader.setPath('/models/');
      mtlLoader.load('004obj.mtl', (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('/models/');
        objLoader.load('004obj.obj', (object) => {
          object.scale.set(0.1, 0.1, 0.1);
          object.position.set(0, 0, 0);

          // Accesăm sub-obiectele modelului
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.name.includes('Chair')) {
                child.material.color.set('blue'); // Schimbă culoarea scaunelor
                child.position.y += 0.1; // Ridică scaunele
              }
              if (child.name.includes('Wall')) {
                child.material.color.set('red'); // Schimbă culoarea pereților
              }
            }
          });

          modelRef.current.add(object);
        });
      });
    };

    loadModel();
  }, []);

  return <group ref={modelRef} />;
};

// Mișcare jucător
const PlayerControls = ({ speed = 0.1 }) => {
  const controlsRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const keysPressed = useRef({});

  useEffect(() => {
    const handleKeyDown = (event) => {
      keysPressed.current[event.key.toLowerCase()] = true;
    };
    const handleKeyUp = (event) => {
      keysPressed.current[event.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const direction = new THREE.Vector3();
    if (keysPressed.current['w']) direction.z -= speed;
    if (keysPressed.current['s']) direction.z += speed;
    if (keysPressed.current['a']) direction.x -= speed;
    if (keysPressed.current['d']) direction.x += speed;

    velocity.current.lerp(direction, delta * 10);
    state.camera.position.add(velocity.current);
  });

  return <PointerLockControls ref={controlsRef} />;
};

// Scena
const EnvironmentThree = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
        {/* Iluminare */}
        <ambientLight intensity={0.5} />
        <directionalLight
          intensity={1}
          position={[10, 10, 5]}
          shadow-mapSize={[1024, 1024]}
          castShadow
        />

        {/* Podeaua */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#aaa" />
        </mesh>

        {/* Model 3D */}
        <StudioModel />

        {/* Controale */}
        <PlayerControls speed={0.2} />
      </Canvas>
    </div>
  );
};

export default EnvironmentThree;

