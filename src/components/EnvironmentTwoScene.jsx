import * as THREE from 'three';

import { OrbitControls, Sky, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { XR } from '@react-three/xr';
import { TextureLoader } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

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
  const wallTexture = useMemo(() => new THREE.TextureLoader().load('/Imagini/robert.jpeg'), []);
  const texturedWallMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: wallTexture }), [wallTexture]);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: '#000000' });
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
  const texture = useLoader(TextureLoader, '/Imagini/robert.jpeg'); // Ensure this path is correct

  useEffect(() => {
    if (fbx) {
      fbx.traverse((child) => {
        if (child.isMesh) {
          console.log('Applying texture to:', child);
          child.material.map = texture; // Set the texture
          child.material.needsUpdate = true; // Force material update
        }
      });
    }
  }, [fbx, texture]);

  return (
    <primitive
      object={fbx}
      position={[1.1, 0.88, -1.9]}
      scale={[0.01, 0.01, 0.01]}
    />
  );
};
// const FBXlights = () => { 
//   const fbxlights = useLoader(FBXLoader, '/models/Curve_Panel_Spot_Light.fbx');

//   return (
//     <primitive
//       object={fbxlights}
//       position={[-4.5, 1.4, -1]}
//       rotation={[0, Math.PI / 1.5, 0]} // Rotate 45 degrees on the y-axis
//       scale={[0.009, 0.009, 0.009]}
//     />
//   );
// };

const FBXlights = () => { 
  const fbxlights = useLoader(FBXLoader, '/models/Curve_Panel_Spot_Light.fbx');
  const texture = useLoader(TextureLoader, '/models/Curve_Panel_Spot_Light_Texture/Curve_Panel_Light_Bulb_M_Base_color.png');

  useEffect(() => {
    if (fbxlights) {
      fbxlights.traverse((child) => {
        if (child.isMesh) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      });
    }
  }, [fbxlights, texture]);

  return (
    <group>
      {/* Reflector */}
      <primitive
        object={fbxlights}
        position={[-4.5, 1.4, -1]}
        rotation={[0, Math.PI / 1.5, 0]} 
        scale={[0.009, 0.009, 0.009]}
      />
      {/* Point Light */}
      <pointLight
        position={[-4.2, 2.4, -1.2]}
        intensity={3}
        color="#ffffff"
        distance={5}
        decay={2}
        castShadow={true}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}ds
      />
      {/* Light Sphere */}
      <mesh position={[-4.2, 2.4, -1.2]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};



const FBXsecondlights = () => { 
  const fbxsecondlights = useLoader(FBXLoader, '/models/Box_Panel_Spot_Light.fbx');
  const texture = useLoader(TextureLoader, '/models/Curve_Panel_Spot_Light_Texture/Curve_Panel_Light_Bulb_M_Base_color.png');

  return (
    <group>
      {/* Reflector model */}
      <primitive
        object={fbxsecondlights}
        position={[4.5, 1.4, -1]}
        rotation={[0, Math.PI / -1.5, 0]} 
        scale={[0.009, 0.009, 0.009]}
      />
      {/* Point light */}
      <pointLight
        position={[4.2, 2.4, -1.2]}
        intensity={10}
        color="#ffffff"
        distance={5}
        decay={2}
        castShadow={true}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
        {/* Light Sphere */}
        <mesh position={[4.3, 2.5, -1.4]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};



const OBJwindow = () => { 
  const objwindow = useLoader(OBJLoader, '/models/window.obj');

  // Adăugare textură pentru oglindă - în acest caz, se folosește un fișier de textură existent.
  const mirrorTexture = useLoader(THREE.TextureLoader, '/Imagini/palatul.jpeg'); 

  return (
    <group>
      {/* Obiectul original pentru fereastră */}
      <primitive
        object={objwindow}
        position={[-4.9, 0.5, 3]}
        rotation={[0, Math.PI / 2, 0]} // Rotire la 90 de grade în jurul axei Y
        scale={[0.3, 0.3, 0.3]}
      />

      {/* Panou pentru oglindă */}
      <mesh position={[-4.7, 0.1, 3]} rotation={[0, Math.PI / 2, 0]}>
        {/* Geometria plană folosită pentru a crea suprafața oglinzii */}
        <planeGeometry args={[2, 2]} />
        {/* Material standard cu textură pentru oglindă */}
        <meshStandardMaterial map={mirrorTexture} metalness={0.8} roughness={0.2} />
        {/* 
          - `map={mirrorTexture}`: Aplică textură pe panou.
          - `metalness={0.8}`: Face materialul să pară metalic (oglinda e reflectorizantă).
          - `roughness={0.2}`: Face oglinda mai puțin mată, dar păstrează o oarecare textură realistă.
        */}
      </mesh>
    </group>
  );
};

const Pulpit = () => {
  const pulpitModel = useLoader(OBJLoader, '/models/studio.obj');
  const texture = useLoader(TextureLoader, '/Imagini/istockphoto-2161705945-612x612.jpg'); // Ensure this path is correct

  useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
    }

    if (pulpitModel) {
      pulpitModel.traverse((child) => {
        if (child.isMesh) {
          child.material.map = texture; // Set the texture
          child.material.needsUpdate = true; // Force material update
        }
      });
    }
  }, [pulpitModel, texture]);

  return (
    <primitive
      object={pulpitModel}
      position={[0, 0, -2]}
      scale={[0.007, 0.007, 0.007]}
    />
  );
};

// const CameraSetup = ({ characterRef, isFirstPerson }) => {
//   const { camera } = useThree();

//   useFrame(() => {
//     if (characterRef.current) {
//       if (isFirstPerson) {
//         const firstPersonPosition = characterRef.current.position.clone().add(new THREE.Vector3(0, 1.5, 0.2));
//         camera.position.lerp(firstPersonPosition, 0.1);
//         camera.lookAt(characterRef.current.position.x, characterRef.current.position.y + 1.5, characterRef.current.position.z);
//       } else {
//         const thirdPersonPosition = characterRef.current.position.clone().add(new THREE.Vector3(0, 2, 5));
//         camera.position.lerp(thirdPersonPosition, 0.1);
//         camera.lookAt(characterRef.current.position);
//       }
//     }
//   });

//   return null;
// };

const CameraSetup = ({ characterRef, keys }) => {
  const { camera } = useThree();
  const targetOffset = new THREE.Vector3(0, 2, -5); // Offset behind the character
  const smoothSpeed = 0.1; // Adjust smoothness of movement and rotation

  useFrame(() => {
    if (characterRef.current) {
      // Determine movement direction
      const direction = new THREE.Vector3();
      if (keys.forward) direction.z -= 1;
      if (keys.backward) direction.z += 1;
      if (keys.left) direction.x -= 1;
      if (keys.right) direction.x += 1;

      if (direction.length() > 0) {
        direction.normalize();

        // Calculate the rotation angle for the character
        const targetRotationY = Math.atan2(direction.x, direction.z);
        characterRef.current.rotation.y = THREE.MathUtils.lerp(
          characterRef.current.rotation.y,
          targetRotationY,
          smoothSpeed
        );

        // Update camera position relative to character
        const characterPosition = characterRef.current.position.clone();
        const offset = targetOffset.clone().applyEuler(characterRef.current.rotation);
        const newPosition = characterPosition.add(offset);

        camera.position.lerp(newPosition, smoothSpeed);
        camera.lookAt(characterRef.current.position);
      } else {
        // When no movement, keep looking at the character
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
          <CameraSetup characterRef={characterRef} isFirstPerson={isFirstPerson} keys={keys}/>
          <Pulpit />
          <FBXModel />
          <FBXlights />
          <FBXsecondlights />
          <OBJwindow />
          <OrbitControls
  enablePan={false} // Disable panning (optional)
  enableZoom={true} // Enable zoom (optional)
  maxPolarAngle={Math.PI * 2} // Allow 360° vertical rotation
  minPolarAngle={0} // Allow full vertical range
  maxAzimuthAngle={Infinity} // No horizontal rotation limits
  minAzimuthAngle={-Infinity} // No horizontal rotation limits
/>

          
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

export default EnvironmentTwoScene;3