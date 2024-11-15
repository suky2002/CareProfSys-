import * as THREE from 'three';

import { Plane, Sky, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';

import { XR } from '@react-three/xr';

// Key Controls Hook
const useKeyControls = () => {
  const keys = useRef({ forward: false, backward: false, left: false, right: false, lookDown: false, openDoor: false });

  const onKeyDown = (e) => {
    if (e.key === 'w') keys.current.forward = true;
    if (e.key === 's') keys.current.backward = true;
    if (e.key === 'a') keys.current.left = true;
    if (e.key === 'd') keys.current.right = true;
    if (e.key === 'q') keys.current.lookDown = true;
    if (e.key === 'e') keys.current.openDoor = true;
  };

  const onKeyUp = (e) => {
    if (e.key === 'w') keys.current.forward = false;
    if (e.key === 's') keys.current.backward = false;
    if (e.key === 'a') keys.current.left = false;
    if (e.key === 'd') keys.current.right = false;
    if (e.key === 'q') keys.current.lookDown = false;
    if (e.key === 'e') keys.current.openDoor = false;
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

// Character Component with Collision Detection
const Character = React.forwardRef(({ keys, wallColliders }, ref) => {
  const standingModel = useGLTF('/models/Asian_IT_Standing.glb');
  const walkingModel = useGLTF('/models/Deadwalking.glb');

  const mixer = useRef();
  const actions = useRef({});
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    if (standingModel && walkingModel) {
      mixer.current = new THREE.AnimationMixer(standingModel.scene);

      actions.current.idle = mixer.current.clipAction(standingModel.animations[0]);
      actions.current.walk = mixer.current.clipAction(walkingModel.animations[0]);

      actions.current.idle.play();
    }
  }, [standingModel, walkingModel]);

  const checkCollision = (newPosition) => {
    for (const collider of wallColliders) {
      if (collider.containsPoint(newPosition)) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  };

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);

    const shouldWalk = keys.forward || keys.backward || keys.left || keys.right;

    // Toggle between idle and walk based on key inputs
    if (shouldWalk && !isWalking) {
      setIsWalking(true);
      actions.current.idle.stop();
      actions.current.walk.reset().play();
    } else if (!shouldWalk && isWalking) {
      setIsWalking(false);
      actions.current.walk.stop();
      actions.current.idle.reset().play();
    }

    // Move the character
    if (shouldWalk && ref.current) {
      const direction = new THREE.Vector3();
      if (keys.forward) direction.z -= 0.05;
      if (keys.backward) direction.z += 0.05;
      if (keys.left) direction.x -= 0.05;
      if (keys.right) direction.x += 0.05;

      direction.normalize().multiplyScalar(0.05);
      const newPosition = ref.current.position.clone().add(direction);

      // Check collision before updating position
      if (!checkCollision(newPosition)) {
        ref.current.position.copy(newPosition);
        ref.current.rotation.y = Math.atan2(direction.x, direction.z);
      }
    }
  });

  return <primitive ref={ref} object={standingModel.scene} scale={[1, 1, 1]} />;
});

// Camera Control Component
const CharacterCamera = ({ characterRef, isFirstPerson }) => {
  const { camera, gl } = useThree();
  const [pitch, setPitch] = useState(0); // Up and down rotation
  const [yaw, setYaw] = useState(0); // Left and right rotation
  const isPointerLocked = useRef(false);

  const keys = useKeyControls();

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
    setYaw((prev) => prev + e.movementX * 0.002);
    setPitch((prev) => Math.max(-Math.PI / 4, Math.min(Math.PI / 4, prev - e.movementY * 0.002)));
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
        const firstPersonPosition = characterRef.current.position.clone().add(new THREE.Vector3(0, 1.5, 0.2));
        camera.position.lerp(firstPersonPosition, 0.1);

        const adjustedPitch = keys.lookDown ? -Math.PI / 4 : pitch;
        camera.rotation.set(adjustedPitch, yaw + characterRef.current.rotation.y, 0);
      } else {
        const thirdPersonPosition = characterRef.current.position.clone().add(new THREE.Vector3(0, 2, 5));
        camera.position.lerp(thirdPersonPosition, 0.1);
        camera.lookAt(characterRef.current.position);
      }
    }
  });

  return null;
};

// Walls, Floor, Ceiling, and Door Component
const WallsWithExtras = ({ wallColliders }) => {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 'red' });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 'white' });
  const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 'gray' });
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 'brown' });

  const wallHeight = 3;
  const wallWidth = 20;

  const walls = [
    { position: [-wallWidth / 2, wallHeight / 2, 0], size: [1, wallHeight, wallWidth] },
    { position: [wallWidth / 2, wallHeight / 2, 0], size: [1, wallHeight, wallWidth] },
    { position: [0, wallHeight / 2, -wallWidth / 2], size: [wallWidth, wallHeight, 1] },
    { position: [0, wallHeight / 2, wallWidth / 2], size: [wallWidth, wallHeight, 1] },
  ];

  useEffect(() => {
    walls.forEach(({ position, size }) => {
      const box = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(...position),
        new THREE.Vector3(...size)
      );
      wallColliders.push(box);
    });
  }, [wallColliders]);

  return (
    <>
      {/* Walls */}
      {walls.map((wall, index) => (
        <mesh key={index} position={wall.position} material={wallMaterial}>
          <boxGeometry args={wall.size} />
        </mesh>
      ))}

      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={floorMaterial}>
        <planeGeometry args={[wallWidth, wallWidth]} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, wallHeight, 0]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMaterial}>
        <planeGeometry args={[wallWidth, wallWidth]} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1, -10]} material={doorMaterial}>
        <boxGeometry args={[1, 2, 0.2]} />
      </mesh>
    </>
  );
};

const ProfessionVRScene = () => {
  const keys = useKeyControls();
  const characterRef = useRef();
  const wallColliders = useRef([]); // Store all wall bounding boxes
  const [isFirstPerson, setIsFirstPerson] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows>
        <XR>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Sky />

          {/* Walls, Floor, Ceiling, and Door */}
          <WallsWithExtras wallColliders={wallColliders.current} />

          {/* Character */}
          <Character ref={characterRef} keys={keys} wallColliders={wallColliders.current} />

          {/* Camera */}
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
