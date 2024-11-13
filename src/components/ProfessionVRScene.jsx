import * as THREE from 'three';

import { OrbitControls, Plane, Sky, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';

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

// Character Component with Walking and Idle Animations
const Character = ({ keys }) => {
  const characterRef = useRef();
  const { scene, animations } = useGLTF('/models/humanoid.glb');
  const mixer = useRef();
  const actions = useRef({});
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (scene && animations.length > 0 && characterRef.current) {
      mixer.current = new THREE.AnimationMixer(characterRef.current);

      // Setup animations
      actions.current.idle = mixer.current.clipAction(animations[0]); // Idle animation
      actions.current.walk = animations.length > 1 ? mixer.current.clipAction(animations[1]) : null; // Walking animation

      actions.current.idle.play(); // Start with idle animation
    }
  }, [scene, animations]);

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);

    const direction = new THREE.Vector3();
    if (keys.forward) direction.z -= 0.05;
    if (keys.backward) direction.z += 0.05;
    if (keys.left) direction.x -= 0.05;
    if (keys.right) direction.x += 0.05;

    // Determine if we should be moving
    const shouldMove = direction.length() > 0;
    if (shouldMove !== isMoving) {
      setIsMoving(shouldMove);

      // Switch to walking animation if moving
      if (shouldMove) {
        actions.current.idle.stop();
        actions.current.walk.reset().play();
      } else {
        // Switch to idle animation if stopped
        actions.current.walk.stop();
        actions.current.idle.play();
      }
    }

    // Apply movement to character if keys are pressed
    if (shouldMove && characterRef.current) {
      direction.normalize().multiplyScalar(0.05);
      characterRef.current.position.add(direction);
      characterRef.current.rotation.y = Math.atan2(direction.x, direction.z);
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
