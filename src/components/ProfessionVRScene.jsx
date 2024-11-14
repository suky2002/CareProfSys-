import * as THREE from 'three';
import { OrbitControls, Plane, Sky, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
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


const FollowCamera = ({ characterRef }) => {
  const { camera } = useThree();
  const offset = new THREE.Vector3(0, 2, 5); // Adjust the offset for third-person view

  useFrame(() => {
    if (characterRef.current) {
      const position = characterRef.current.position.clone().add(offset);
      camera.position.lerp(position, 0.1); // Smoothly follow the character
      camera.lookAt(characterRef.current.position);
    }
  });

  return null;
};

const ProfessionVRScene = () => {
  const keys = useKeyControls();
  const characterRef = useRef(); // Ref for the character
  const [useThirdPerson, setUseThirdPerson] = useState(true); // State to toggle camera

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
          
          {/* Pass characterRef to Character component */}
          <Character ref={characterRef} keys={keys} />

          {/* Conditionally render FollowCamera or OrbitControls based on useThirdPerson */}
          {useThirdPerson ? (
            <FollowCamera characterRef={characterRef} />
          ) : (
            <OrbitControls maxDistance={10} minDistance={5} />
          )}
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
        onClick={() => {
          setUseThirdPerson((prev) => !prev);
          console.log("Camera mode toggled:", !useThirdPerson ? "Third-Person" : "Orbit");
        }}
      >
        {useThirdPerson ? 'Switch to Orbit View' : 'Switch to Third-Person View'}
      </button>
    </div>
  );
};


export default ProfessionVRScene;
