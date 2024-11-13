import * as THREE from 'three';

import { OrbitControls, Plane, Sky, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';

import { XR } from '@react-three/xr';

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

// Character Component with Animation and Movement
const Character = ({ keys }) => {
  const characterRef = useRef();
  const { scene, animations } = useGLTF('/models/humanoid.glb'); // Adjust path if necessary
  const mixer = useRef();
  const actions = useRef({});

  useEffect(() => {
    if (scene && animations.length > 0 && characterRef.current) {
      mixer.current = new THREE.AnimationMixer(characterRef.current);

      // Check if animations are available
      actions.current.idle = mixer.current.clipAction(animations[0]);

      // Play idle animation by default
      actions.current.idle?.play();
    } else {
      console.warn("Model or animations are not available. Check model path or animation structure.");
    }
  }, [scene, animations]);

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);

    const direction = new THREE.Vector3();
    if (keys.forward) direction.z -= 0.05;
    if (keys.backward) direction.z += 0.05;
    if (keys.left) direction.x -= 0.05;
    if (keys.right) direction.x += 0.05;

    if (direction.length() > 0 && characterRef.current) {
      direction.normalize().multiplyScalar(0.1);
      characterRef.current.position.add(direction);
      characterRef.current.rotation.y = Math.atan2(direction.x, direction.z);

      // Switch to walking animation if available and if not already playing
      if (actions.current.walk && !actions.current.walk.isRunning()) {
        actions.current.idle?.stop();
        actions.current.walk.play();
      }
    } else if (actions.current.walk && actions.current.walk.isRunning()) {
      // Switch back to idle animation if no movement
      actions.current.walk.stop();
      actions.current.idle?.play();
    }
  });

  return <primitive ref={characterRef} object={scene} scale={[1, 1, 1]} />;
};

const ProfessionVRScene = () => {
  const keys = useKeyControls();

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows>
        <XR>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Sky />

          {/* Ground */}
          <Plane rotation={[-Math.PI / 2, 0, 0]} args={[100, 100]} receiveShadow>
            <meshStandardMaterial color="#a0a0a0" />
          </Plane>

          {/* Character with WASD Controls */}
          <Character keys={keys} />

          {/* Camera Controls with Limited Zoom */}
          <OrbitControls maxDistance={10} minDistance={5} />
        </XR>
      </Canvas>
    </div>
  );
};

export default ProfessionVRScene;
