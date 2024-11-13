import * as THREE from 'three';

import { Box, OrbitControls, Plane, Sky } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';

import { XR } from '@react-three/xr';

// Custom VR Button
const addVRButton = () => {
  const button = document.createElement('button');
  button.innerText = 'Enter VR';
  button.style.position = 'absolute';
  button.style.bottom = '20px';
  button.style.left = '20px';
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.backgroundColor = '#007ACC';
  button.style.color = '#FFF';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';

  button.onclick = () => {
    if (navigator.xr) {
      navigator.xr.requestSession('immersive-vr').then((session) => {
        session.requestReferenceSpace('local').then((refSpace) => {
          button.remove();
        });
      });
    }
  };

  document.body.appendChild(button);
};

// Room Component with walls and floor
const Room = () => (
  <>
    <Plane rotation={[-Math.PI / 2, 0, 0]} args={[100, 100]} receiveShadow>
      <meshStandardMaterial color="#a0a0a0" />
    </Plane>
    <Box position={[0, 2, -5]} args={[10, 4, 1]} name="wall" />
    <Box position={[0, 2, 5]} args={[10, 4, 1]} name="wall" />
    <Box position={[-5, 2, 0]} args={[1, 4, 10]} name="wall" />
    <Box position={[5, 2, 0]} args={[1, 4, 10]} name="wall" />
  </>
);

// Character Component with collision detection
const Character = ({ keys, walls }) => {
  const characterRef = useRef();
  const speed = 0.1;

  useFrame(() => {
    const direction = new THREE.Vector3();

    if (keys.forward) direction.z -= speed;
    if (keys.backward) direction.z += speed;
    if (keys.left) direction.x -= speed;
    if (keys.right) direction.x += speed;

    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(speed);

      const nextPosition = characterRef.current.position.clone().add(direction);
      const characterBox = new THREE.Box3().setFromObject(characterRef.current);

      let collision = false;

      // Check collision with each wall
      walls.forEach((wall) => {
        const wallBox = new THREE.Box3().setFromObject(wall);
        if (characterBox.intersectsBox(wallBox)) {
          collision = true;
        }
      });

      // Move only if no collision is detected
      if (!collision) {
        characterRef.current.position.add(direction);
      }
    }
  });

  return (
    <Box ref={characterRef} position={[0, 1, 0]} args={[1, 2, 1]}>
      <meshStandardMaterial color="orange" />
    </Box>
  );
};

// Custom hook for key controls
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

  useEffect(() => {
    addVRButton();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows>
        <XR>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          <Sky />
          <Room ref={(room) => (walls.current = room.children)} />
          <Character keys={keys} walls={walls.current} />

          <OrbitControls />
        </XR>
      </Canvas>
    </div>
  );
};

export default ProfessionVRScene;
