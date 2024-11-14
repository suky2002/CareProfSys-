// EnvironmentTwoScene.jsx
import * as THREE from 'three';

import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';

import { XR } from '@react-three/xr';
import EnvironmentTwo from './EnvironmentTwo'; // Import the new environment

// Character Component with Animation Control
const Character = ({ keys }) => {
  const characterRef = useRef();
  const mixer = useRef();
  const [isWalking, setIsWalking] = useState(false);
  const { scene, animations } = useGLTF('/models/humanoid.glb'); // Make sure this path is correct

  useEffect(() => {
    if (animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      const idleAction = mixer.current.clipAction(animations[0]);
      const walkAction = animations[1] ? mixer.current.clipAction(animations[1]) : null;

      if (idleAction) idleAction.play();
      mixer.current.stopAllAction(); // Ensure all animations stop initially

      const toggleAnimation = (shouldWalk) => {
        if (shouldWalk) {
          if (walkAction) {
            idleAction.stop();
            walkAction.reset().play();
          }
        } else {
          if (walkAction) walkAction.stop();
          idleAction.reset().play();
        }
      };

      toggleAnimation(isWalking);

      return () => {
        mixer.current.stopAllAction();
      };
    }
  }, [animations, isWalking]);

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);

    const direction = new THREE.Vector3();
    if (keys.forward) direction.z -= 0.05;
    if (keys.backward) direction.z += 0.05;
    if (keys.left) direction.x -= 0.05;
    if (keys.right) direction.x += 0.05;

    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(0.05);
      characterRef.current.position.add(direction);
      characterRef.current.rotation.y = Math.atan2(direction.x, direction.z);
      setIsWalking(true);
    } else {
      setIsWalking(false);
    }
  });

  return <primitive ref={characterRef} object={scene} scale={[1, 1, 1]} />;
};

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

const EnvironmentTwoScene = () => {
  const keys = useKeyControls();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows>
        <XR>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls />
          <EnvironmentTwo />
          <Character keys={keys} /> {/* Add Character with controls */}
        </XR>
      </Canvas>
    </div>
  );
};

export default EnvironmentTwoScene;
