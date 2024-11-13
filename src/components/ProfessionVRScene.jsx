import * as THREE from 'three';

import { Box, OrbitControls, Plane, Sky, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef } from 'react';

import { XR } from '@react-three/xr';

// Room Component
const Room = ({ walls }) => (
  <>
    <Plane rotation={[-Math.PI / 2, 0, 0]} args={[100, 100]} receiveShadow>
      <meshStandardMaterial color="#a0a0a0" />
    </Plane>
    <Box ref={(el) => walls.push(el)} position={[0, 2, -5]} args={[10, 4, 1]} />
    <Box ref={(el) => walls.push(el)} position={[0, 2, 5]} args={[10, 4, 1]} />
    <Box ref={(el) => walls.push(el)} position={[-5, 2, 0]} args={[1, 4, 10]} />
    <Box ref={(el) => walls.push(el)} position={[5, 2, 0]} args={[1, 4, 10]} />
  </>
);

// Character Component with Model and Animation
const Character = ({ keys, walls }) => {
  const characterRef = useRef();
  const { scene, animations } = useGLTF('/models/humanoid.glb');
  const mixer = useRef();

  useEffect(() => {
    if (animations && animations.length > 0 && characterRef.current) {
      mixer.current = new THREE.AnimationMixer(characterRef.current);
      const idleAction = mixer.current.clipAction(animations[0]); // Assuming the first animation is idle
      idleAction.play();
    }
  }, [animations]);

  useFrame((_, delta) => {
    if (!characterRef.current || !mixer.current) return;

    mixer.current.update(delta);

    const direction = new THREE.Vector3();
    if (keys.forward) direction.z -= 0.1;
    if (keys.backward) direction.z += 0.1;
    if (keys.left) direction.x -= 0.1;
    if (keys.right) direction.x += 0.1;

    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(0.1);
      const nextPosition = characterRef.current.position.clone().add(direction);

      const characterBox = new THREE.Box3().setFromObject(characterRef.current);
      let collisionDetected = false;

      walls.forEach((wall) => {
        const wallBox = new THREE.Box3().setFromObject(wall);
        if (characterBox.intersectsBox(wallBox)) {
          collisionDetected = true;
        }
      });

      if (!collisionDetected) {
        characterRef.current.position.add(direction);
        characterRef.current.rotation.y = Math.atan2(direction.x, direction.z);
      }
    }
  });

  return <primitive ref={characterRef} object={scene} scale={[1, 1, 1]} />;
};

useGLTF.preload('/models/humanoid.glb'); // Preload the model for efficiency

// Key Controls Hook
const useKeyControls = () => {
  const keys = useRef({ forward: false, backward: false, left: false, right: false });

  const onKeyDown = (e) => {
    if (e.key === 'w') keys.current.forward = true;
    if (e.key === 's') keys.current.backward = true;
    if (e.key === 'a') keys.current.left = true;
    if (e.key === 'd') keys.current.right = true;
  };

  const onKeyUp = (e) => {
    if (e.key === 'w') keys.current.forward = false;
    if (e.key === 's') keys.current.backward = false;
    if (e.key === 'a') keys.current.left = false;
    if (e.key === 'd') keys.current.right = false;
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return keys.current;
};

const ProfessionVRScene = () => {
  const keys = useKeyControls();
  const walls = useRef([]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <XR>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Sky />
            <Room walls={walls.current} />
            <Character keys={keys} walls={walls.current} />
            <OrbitControls maxDistance={15} minDistance={5} />
          </XR>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ProfessionVRScene;
