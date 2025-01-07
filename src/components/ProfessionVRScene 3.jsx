import * as THREE from 'three';

import { Plane, Sky, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
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

// Character Component
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
        return true; // Coliziune detectată
      }
    }
    return false; // Nicio coliziune
  };

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);

    const isMoving = keys.forward || keys.backward || keys.left || keys.right;

    if (isMoving && !isWalking) {
      setIsWalking(true);
      if (actions.current.idle) actions.current.idle.fadeOut(0.2);
      if (actions.current.walk) actions.current.walk.reset().fadeIn(0.2).play();
    } else if (!isMoving && isWalking) {
      setIsWalking(false);
      if (actions.current.walk) actions.current.walk.fadeOut(0.2);
      if (actions.current.idle) actions.current.idle.reset().fadeIn(0.2).play();
    }

    if (isMoving && ref.current) {
      const direction = new THREE.Vector3();
      if (keys.forward) direction.z -= 0.05;
      if (keys.backward) direction.z += 0.05;
      if (keys.left) direction.x -= 0.05;
      if (keys.right) direction.x += 0.05;

      direction.normalize().multiplyScalar(0.025);
      const newPosition = ref.current.position.clone().add(direction);

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
// Table Component
const Table = ({ position, rotation, scale }) => {
  const { scene } = useGLTF('/models/table.glb'); // Înlocuiește cu calea corectă a fișierului tău table.glb

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale || [1, 1, 1]} // Poți ajusta scala în funcție de mărimea modelului
    />
  );
};

// Door Component
const Door = ({ position, rotation, characterRef, keys }) => {
  const doorRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const doorCollider = useRef(new THREE.Box3());
  const interactionZone = useRef(new THREE.Box3());

  const doorMaterial = new THREE.MeshStandardMaterial({ color: 'black' });
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 'brown' });

  useEffect(() => {
    if (doorRef.current) {
      doorCollider.current.setFromObject(doorRef.current);
      interactionZone.current.setFromCenterAndSize(
        doorRef.current.position.clone(),
        new THREE.Vector3(2, 2, 1) // Interaction zone size
      );
    }
  }, []);

  useFrame(() => {
    if (characterRef.current && doorCollider.current) {
      const characterPosition = new THREE.Vector3().copy(characterRef.current.position);

      if (interactionZone.current.containsPoint(characterPosition)) {
        setShowPrompt(true);

        if (keys.openDoor) {
          setIsOpen((prev) => !prev);
        }
      } else {
        setShowPrompt(false);
      }
    }

    if (doorRef.current) {
      const openRotation = rotation[1] + Math.PI / 2; // Rotate 90 degrees when open
      doorRef.current.rotation.y = isOpen ? openRotation : rotation[1];
    }
  });

  return (
    <>
      {showPrompt && (
        <Html position={position}>
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              borderRadius: '5px',
              textAlign: 'center',
            }}
          >
            Apasă SPACE să deschizi ușa
          </div>
        </Html>
      )}
      <group ref={doorRef} position={position} rotation={rotation}>
        <mesh material={doorMaterial}>
          <boxGeometry args={[1, 2, 0.2]} />
        </mesh>
        <mesh position={[0.4, 0, 0.15]} material={handleMaterial}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
        </mesh>
      </group>
    </>
  );
};

// WallsWithDoors Component
const WallsWithDoors = ({ wallColliders, characterRef, keys }) => {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 'red' });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 'white' });
  const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 'gray' });

  const wallHeight = 3;
  const wallWidth = 20;

  const walls = [
    { position: [-5, wallHeight / 2, wallWidth / 2], size: [5, wallHeight, 1] }, // Left side of front wall
    { position: [5, wallHeight / 2, wallWidth / 2], size: [5, wallHeight, 1] }, // Right side of front wall
    { position: [0, wallHeight / 2, wallWidth / 2], size: [1, wallHeight, 1] }, // Wall between doors
    { position: [-wallWidth / 2, wallHeight / 2, 0], size: [1, wallHeight, wallWidth] }, // Left wall
    { position: [wallWidth / 2, wallHeight / 2, 0], size: [1, wallHeight, wallWidth] }, // Right wall
    { position: [0, wallHeight / 2, -wallWidth / 2], size: [wallWidth, wallHeight, 1] }, // Back wall
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
      {walls.map((wall, index) => (
        <mesh key={index} position={wall.position} material={wallMaterial}>
          <boxGeometry args={wall.size} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={floorMaterial}>
        <planeGeometry args={[wallWidth, wallWidth]} />
      </mesh>
      <mesh position={[0, wallHeight, 0]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMaterial}>
        <planeGeometry args={[wallWidth, wallWidth]} />
      </mesh>
      <Door position={[-2, 1, wallWidth / 2]} rotation={[0, 0, 0]} characterRef={characterRef} keys={keys} />
      <Door position={[2, 1, wallWidth / 2]} rotation={[0, 0, 0]} characterRef={characterRef} keys={keys} />
    </>
  );
};


const ProfessionVRScene = () => {
  const keys = useKeyControls();
  const characterRef = useRef();
  const wallColliders = useRef([]);
  const [isFirstPerson, setIsFirstPerson] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows>
        <XR>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Sky />
          {/* Zidurile și ușile */}
          <WallsWithDoors wallColliders={wallColliders.current} characterRef={characterRef} keys={keys} />
          {/* Personajul */}
          <Character ref={characterRef} keys={keys} wallColliders={wallColliders.current} />
          {/* Camera */}
          <CharacterCamera characterRef={characterRef} isFirstPerson={isFirstPerson} />
          {/* Masa */}
          <Table position={[0, 0.5, 2]} scale={[1.5, 1.5, 1.5]} rotation={[0, 0, 0]} />
        </XR>
      </Canvas>
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
