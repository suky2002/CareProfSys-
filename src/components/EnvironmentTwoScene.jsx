import * as THREE from 'three';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sky, useGLTF } from '@react-three/drei';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { XR } from '@react-three/xr';

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

      direction.normalize().multiplyScalar(0.05);
      const newPosition = ref.current.position.clone().add(direction);

      if (!checkCollision(newPosition)) {
        ref.current.position.copy(newPosition);
        ref.current.rotation.y = Math.atan2(direction.x, direction.z);
      }
    }
  });

  return <primitive ref={ref} object={standingModel.scene} scale={[1, 1, 1]} />;
});

const Room = ({ wallColliders }) => {
  const wallTexture = useMemo(() => new THREE.TextureLoader().load('/Imagini/pexels-hieu-697259.jpg'), []);
  const texturedWallMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: wallTexture }), [wallTexture]);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: '#fefefe' });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 'green' });
  const ceilingMaterial = new THREE.MeshStandardMaterial({ color: '#444' });

  useEffect(() => {
    wallColliders.push(
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(-5, 1.5, 0), new THREE.Vector3(0.1, 3, 10)),
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(5, 1.5, 0), new THREE.Vector3(0.1, 3, 10)),
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 1.5, -5), new THREE.Vector3(10, 3, 0.1)),
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 1.5, 5), new THREE.Vector3(10, 3, 0.1))
    );
  }, [wallColliders]);

  return (
    <>
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={floorMaterial}>
        <planeGeometry args={[10, 10]} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMaterial}>
        <planeGeometry args={[10, 10]} />
      </mesh>

      {/* Walls */}
      <mesh position={[-5, 1.5, 0]} material={wallMaterial}>
        <boxGeometry args={[0.1, 3, 10]} />
      </mesh>
      <mesh position={[5, 1.5, 0]} material={wallMaterial}>
        <boxGeometry args={[0.1, 3, 10]} />
      </mesh>
      <mesh position={[0, 1.5, -5]} material={texturedWallMaterial}>
        <boxGeometry args={[10, 3, 0.1]} />
      </mesh>
      <mesh position={[0, 1.5, 5]} material={wallMaterial}>
        <boxGeometry args={[10, 3, 0.1]} />
      </mesh>
    </>
  );
};


const FBXModel = () => {
  const fbx = useLoader(FBXLoader, '/models/Shure_565SD.fbx');

  return (
    <primitive
      object={fbx}
      position={[0, 0, -2]}
      scale={[0.01, 0.01, 0.01]}
    />
  );
};

const Pulpit = () => {
  const pulpitModel = useLoader(OBJLoader, '/models/studio-obj.obj');

  return (
    <primitive
      object={pulpitModel}
      position={[0, 0, 1]}
      scale={[100 , 100, 100]}
    />
  );
};

const CameraSetup = ({ characterRef, isFirstPerson }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (characterRef.current) {
      if (isFirstPerson) {
        const firstPersonPosition = characterRef.current.position.clone().add(new THREE.Vector3(0, 1.5, 0.2));
        camera.position.lerp(firstPersonPosition, 0.1);
        camera.lookAt(characterRef.current.position.x, characterRef.current.position.y + 1.5, characterRef.current.position.z);
      } else {
        const thirdPersonPosition = characterRef.current.position.clone().add(new THREE.Vector3(0, 2, 5));
        camera.position.lerp(thirdPersonPosition, 0.1);
        camera.lookAt(characterRef.current.position);
      }
    }
  });

  return null;
};

const EnvironmentTwoScene = () => {
  const keys = useKeyControls();
  const characterRef = useRef();
  const [isFirstPerson, setIsFirstPerson] = useState(false);
  const wallColliders = useRef([]).current;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows>
        <XR>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Sky />
          <Room wallColliders={wallColliders} />
          <Character ref={characterRef} keys={keys} wallColliders={wallColliders} />
          <CameraSetup characterRef={characterRef} isFirstPerson={isFirstPerson} />
          <Pulpit />
          <FBXModel />
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

export default EnvironmentTwoScene;
