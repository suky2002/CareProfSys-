import * as THREE from 'three';
import { OrbitControls, Plane, Sky, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { XR } from '@react-three/xr';

// Key Controls Hook
const useKeyControls = () => {
  const keys = useRef({ forward: false, backward: false, left: false, right: false, lookDown: false });

  const onKeyDown = (e) => {
    if (e.key === 'w') keys.current.forward = true;
    if (e.key === 's') keys.current.backward = true;
    if (e.key === 'a') keys.current.left = true;
    if (e.key === 'd') keys.current.right = true;
    if (e.key === 'q') keys.current.lookDown = true;
  };

  const onKeyUp = (e) => {
    if (e.key === 'w') keys.current.forward = false;
    if (e.key === 's') keys.current.backward = false;
    if (e.key === 'a') keys.current.left = false;
    if (e.key === 'd') keys.current.right = false;
    if (e.key === 'q') keys.current.lookDown = false;
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

// Character Component
const Character = React.forwardRef(({ keys }, ref) => {
  const { scene, animations } = useGLTF('/models/humanoid.glb');
  const mixer = useRef();
  const actions = useRef({});
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    if (scene && animations.length > 0 && ref.current) {
      mixer.current = new THREE.AnimationMixer(ref.current);
      actions.current.idle = mixer.current.clipAction(animations[0]);
      actions.current.walk = animations.length > 1 ? mixer.current.clipAction(animations[1]) : null;
      actions.current.idle.play();
      actions.current.idle.setLoop(THREE.LoopRepeat);
    }
  }, [scene, animations]);

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);

    const shouldWalk = keys.forward || keys.backward || keys.left || keys.right;
    if (shouldWalk && !isWalking) {
      setIsWalking(true);
      if (actions.current.idle) actions.current.idle.stop();
      if (actions.current.walk) actions.current.walk.reset().play();
    } else if (!shouldWalk && isWalking) {
      setIsWalking(false);
      if (actions.current.walk) actions.current.walk.stop();
      if (actions.current.idle) actions.current.idle.reset().play();
    }

    if (shouldWalk && ref.current) {
      const direction = new THREE.Vector3();
      if (keys.forward) direction.z -= 0.05;
      if (keys.backward) direction.z += 0.05;
      if (keys.left) direction.x -= 0.05;
      if (keys.right) direction.x += 0.05;

      direction.normalize().multiplyScalar(0.05);
      ref.current.position.add(direction);
      ref.current.rotation.y = Math.atan2(direction.x, direction.z);
    }
  });

  return <primitive ref={ref} object={scene} scale={[1, 1, 1]} />;
});

// Camera Control Component with Corrected Mouse Look Direction
const CharacterCamera = ({ characterRef, isFirstPerson }) => {
  const { camera, gl } = useThree();
  const [pitch, setPitch] = useState(0); // Up and down rotation
  const [yaw, setYaw] = useState(0); // Left and right rotation
  const isPointerLocked = useRef(false);

  const keys = useKeyControls(); // Access key states, including Q key

  // Activate pointer lock for mouse look on click
  useEffect(() => {
    const handlePointerLock = () => {
      gl.domElement.requestPointerLock();
    };

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    gl.domElement.addEventListener('click', handlePointerLock);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    return () => {
      gl.domElement.removeEventListener('click', handlePointerLock);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
    };
  }, [gl.domElement]);

  const handleMouseMove = (e) => {
    if (!isPointerLocked.current || keys.lookDown) return;
    setYaw((prev) => prev + e.movementX * 0.002); // Positive movementX to turn right
    setPitch((prev) => Math.max(-Math.PI / 4, Math.min(Math.PI / 4, prev - e.movementY * 0.002))); // Inverted for natural up/down
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame(() => {
    if (characterRef.current) {
      if (isFirstPerson) {
        // First-person camera position
        const firstPersonPosition = characterRef.current.position.clone().add(new THREE.Vector3(0, 1.5, 0.2));
        camera.position.lerp(firstPersonPosition, 0.1);

        // If Q is pressed, force pitch down; otherwise, apply normal pitch and yaw
        const adjustedPitch = keys.lookDown ? -Math.PI / 4 : pitch; // 45-degree downward angle when Q is pressed
        camera.rotation.set(adjustedPitch, yaw + characterRef.current.rotation.y, 0);
      } else {
        // Third-person camera
        const thirdPersonPosition = characterRef.current.position.clone().add(new THREE.Vector3(0, 2, 5));
        camera.position.lerp(thirdPersonPosition, 0.1);
        camera.lookAt(characterRef.current.position);
      }
    }
  });

  return null;
};

const ProfessionVRScene = () => {
  const keys = useKeyControls();
  const characterRef = useRef();
  const [isFirstPerson, setIsFirstPerson] = useState(true); // Toggle between first and third person

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows>
        <XR>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Sky />
          <Plane rotation={[-Math.PI / 2, 0, 0]} args={[100, 100]} receiveShadow>
            <meshStandardMaterial color="#a0a0a0" />
          </Plane>

          {/* Character Model */}
          <Character ref={characterRef} keys={keys} />

          {/* Camera Control */}
          <CharacterCamera characterRef={characterRef} isFirstPerson={isFirstPerson} />
        </XR>
      </Canvas>

      {/* Toggle Button */}
      <button
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px',
          zIndex: 1,
          backgroundColor: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={() => setIsFirstPerson(!isFirstPerson)}
      >
        {isFirstPerson ? 'Switch to Third-Person View' : 'Switch to First-Person View'}
      </button>
    </div>
  );
};

export default ProfessionVRScene;
