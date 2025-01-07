import * as THREE from 'three';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TextureLoader } from 'three';
import TutorialOverlay from './TutorialOverlay';
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
  
    if (ref.current) {
      const velocity = new THREE.Vector3();
  
      // Aplicați direcțiile în funcție de taste
      if (keys.forward) velocity.z -= 1;
      if (keys.backward) velocity.z += 1;
      if (keys.left) velocity.x -= 1;
      if (keys.right) velocity.x += 1;
  
      if (velocity.length() > 0) {
        velocity.normalize().multiplyScalar(0.05); // Setăm viteza
  
        // Calculează noua poziție
        const newPosition = ref.current.position.clone().add(velocity);
  
        // Verifică coliziunile
        if (!checkCollision(newPosition)) {
          ref.current.position.copy(newPosition);
  
          // Setează rotația în direcția mișcării
          ref.current.rotation.y = Math.atan2(velocity.x, velocity.z);
        }
      }
    }
  });
  
  
  return (
    <>
      <primitive ref={ref} object={standingModel.scene} scale={[1, 1, 1]} />
      <PointAndClickControls
        characterRef={ref}
        wallColliders={wallColliders}
        mixer={mixer.current}
        actions={actions.current}
        setIsWalking={setIsWalking}
      />
    </>
  );
  
});
const Room1 = ({ wallColliders, position }) => {
  const wallHeight = 3;
  const roomSize = 10;

  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#00FF00' }); // Green
  const ceilingMaterial = new THREE.MeshStandardMaterial({ color: '#444444' }); // Dark Gray

  useEffect(() => {
    const x = position[0];
    const z = position[2];

    wallColliders.push(
      // Left wall
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x - 5, 1.5, z), new THREE.Vector3(0.1, wallHeight, roomSize)),
      // Back wall (yellow)
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.5, z + 5), new THREE.Vector3(roomSize, wallHeight, 0.1)),
      // Blue wall (add collision here)
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.5, z - 5), new THREE.Vector3(roomSize, wallHeight, 0.1)),
      // New Left Wall by Entrance
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x + 5, 1.5, z + 3.5), new THREE.Vector3(0.2, wallHeight, 3)),
      // New Right Wall by Entrance
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x + 5, 1.5, z - 3.5), new THREE.Vector3(0.2, wallHeight, 3))
    );
  }, [wallColliders, position]);

  return (
    <>
      {/* Floor */}
      <mesh position={[position[0], 0, position[2]]} rotation={[-Math.PI / 2, 0, 0]} material={floorMaterial}>
        <planeGeometry args={[roomSize, roomSize]} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[position[0], 3, position[2]]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMaterial}>
        <planeGeometry args={[roomSize, roomSize]} />
      </mesh>

      {/* Walls */}
      <mesh position={[position[0] - 5, 1.5, position[2]]} material={new THREE.MeshStandardMaterial({ color: '#FF0000' })}>
        <boxGeometry args={[0.1, wallHeight, roomSize]} />
      </mesh>
      <mesh position={[position[0], 1.5, position[2] - 5]} material={new THREE.MeshStandardMaterial({ color: '#0000FF' })}>
        <boxGeometry args={[roomSize, wallHeight, 0.1]} />
      </mesh>
      <mesh position={[position[0], 1.5, position[2] + 5]} material={new THREE.MeshStandardMaterial({ color: '#FFFF00' })}>
        <boxGeometry args={[roomSize, wallHeight, 0.1]} />
      </mesh>

      {/* New Left Wall by Entrance */}
      <mesh
        position={[position[0] + 5, 1.5, position[2] + 3.5]}
        material={new THREE.MeshStandardMaterial({ color: '#8A2BE2' })}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[3, wallHeight, 0.2]} />
      </mesh>

      {/* New Right Wall by Entrance */}
      <mesh
        position={[position[0] + 5, 1.5, position[2] - 3.5]}
        material={new THREE.MeshStandardMaterial({ color: '#8A2BE2' })}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[3, wallHeight, 0.2]} />
      </mesh>
    </>
  );

  useFrame(() => {
    if (
      characterRef.current &&
      characterRef.current.position.x < 5 &&
      characterRef.current.position.z < 5
    ) {
      completeTask(1); // Marchează Task 1 ca fiind complet
    }
  });
  
};


const Room2 = ({ wallColliders, position }) => {
  const wallHeight = 3;
  const roomSize = 10;

  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#0000FF' }); // Blue
  const ceilingMaterial = new THREE.MeshStandardMaterial({ color: '#555555' }); // Darker Gray
  const wallMaterials = [
    null, // Eliminăm peretele cyan
    new THREE.MeshStandardMaterial({ color: '#FF00FF' }), // Magenta
    new THREE.MeshStandardMaterial({ color: '#FFFFFF' }), // White
    new THREE.MeshStandardMaterial({ color: '#000000' }), // Black
  ];

  useEffect(() => {
    const x = position[0];
    const z = position[2];
    wallColliders.push(
      // Right wall
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x + 5, 1.5, z), new THREE.Vector3(0.1, wallHeight, roomSize)),
      // Back wall (white)
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.5, z - 5), new THREE.Vector3(roomSize, wallHeight, 0.1)),
      // New Left Wall by Entrance
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x - 5, 1.5, z + 3.5), new THREE.Vector3(0.2, wallHeight, 3)),
      // New Right Wall by Entrance
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x - 5, 1.5, z - 3.5), new THREE.Vector3(0.2, wallHeight, 3)),
      // Black wall (front)
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.5, z + 5), new THREE.Vector3(roomSize, wallHeight, 0.1))
    );
  }, [wallColliders, position]);

  return (
    <>
      {/* Floor */}
      <mesh position={[position[0], 0, position[2]]} rotation={[-Math.PI / 2, 0, 0]} material={floorMaterial}>
        <planeGeometry args={[roomSize, roomSize]} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[position[0], 3, position[2]]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMaterial}>
        <planeGeometry args={[roomSize, roomSize]} />
      </mesh>

      {/* Walls */}
      <mesh position={[position[0] + 5, 1.5, position[2]]} material={wallMaterials[1]}>
        <boxGeometry args={[0.1, wallHeight, roomSize]} />
      </mesh>
      <mesh position={[position[0], 1.5, position[2] - 5]} material={wallMaterials[2]}>
        <boxGeometry args={[roomSize, wallHeight, 0.1]} />
      </mesh>
      <mesh position={[position[0], 1.5, position[2] + 5]} material={wallMaterials[3]}>
        <boxGeometry args={[roomSize, wallHeight, 0.1]} />
      </mesh>

      {/* New Left Wall by Entrance */}
      <mesh
        position={[position[0] - 5, 1.5, position[2] + 3.5]}
        material={new THREE.MeshStandardMaterial({ color: '#8A2BE2' })}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[3, wallHeight, 0.2]} />
      </mesh>

      {/* New Right Wall by Entrance */}
      <mesh
        position={[position[0] - 5, 1.5, position[2] - 3.5]}
        material={new THREE.MeshStandardMaterial({ color: '#8A2BE2' })}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[3, wallHeight, 0.2]} />
      </mesh>
    </>
  );

  useFrame(() => {
    if (
      characterRef.current &&
      characterRef.current.position.x > 15 &&
      characterRef.current.position.x < 25
    ) {
      completeTask(3); // Marchează Task 3 ca fiind complet
    }
  });
  
};

const Hallway = ({ wallColliders, position, characterRef }) => {
  const wallMaterial1 = new THREE.MeshStandardMaterial({ color: '#FF00FF' }); // Magenta
  const wallMaterial2 = new THREE.MeshStandardMaterial({ color: '#00FFFF' }); // Cyan
  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#CCCCCC' }); // Gray
  const switchMaterial = new THREE.MeshStandardMaterial({ color: '#FFAA00' }); // Orange for the switch

  const wallHeight = 3;
  const hallLength = 10;
  const hallWidth = 4;

  // Switch position - manually placed on the magenta wall
  const switchPosition = [
    position[0] - hallLength / 2 + 2, // Centered horizontally with a slight offset
    1.5, // Mid-height of the wall
    position[2] - hallWidth / 2 + 0.05, // Slightly offset from the wall's surface
  ];

  const [showOverlay, setShowOverlay] = useState(false);
  const [screenPosition, setScreenPosition] = useState({ x: 0, y: 0 }); // Position for the pop-up
  const switchRef = useRef();
  const helperRef = useRef();
  const { camera, size } = useThree(); // Access camera and screen size

  useEffect(() => {
    const x = position[0];
    const z = position[2];
    wallColliders.push(
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.5, z - hallWidth / 2), new THREE.Vector3(hallLength, wallHeight, 0.1)), // Left wall
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.5, z + hallWidth / 2), new THREE.Vector3(hallLength, wallHeight, 0.1)) // Right wall
    );
  }, [wallColliders, position]);
  useFrame(() => {
    if (characterRef?.current && switchRef.current) {
      // Calculăm distanța între caracter și switch
      const characterPosition = characterRef.current.position;
      const distance = characterPosition.distanceTo(new THREE.Vector3(...switchPosition));
  
      // Convertim poziția 3D a switch-ului în coordonate 2D pe ecran
      const vector = new THREE.Vector3(...switchPosition);
      vector.project(camera);
  
      // Coordonate 2D pe ecran (luând în calcul dimensiunea ferestrei)
      const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
  
      setScreenPosition({ x, y });
  
      // Afișăm overlay-ul dacă distanța <= 2
      if (distance <= 2) {
        setShowOverlay(true);
      } else {
        setShowOverlay(false);
      }
  
      // Adaugă console.log pentru debugging
      console.log('Switch 3D Position:', switchPosition);
      console.log('Projected 2D Position:', { x, y });
      console.log('Distance to switch:', distance);
  
      // Actualizează distanța rămasă în state
      setDistanceToSwitch(distance.toFixed(2)); // Rotunjim la 2 zecimale
      
      useFrame(() => {
        if (
          characterRef.current &&
          characterRef.current.position.x > 5 &&
          characterRef.current.position.x < 15
        ) {
          completeTask(2); // Marchează Task 2 ca fiind complet
        }
      });
      
    }
  });
  
  
  

  return (
    <>
      {/* Floor */}
      <mesh position={[position[0], 0, position[2]]} rotation={[-Math.PI / 2, 0, 0]} material={floorMaterial}>
        <planeGeometry args={[hallLength, hallWidth]} />
      </mesh>

      {/* Magenta Wall */}
      <mesh position={[position[0], 1.5, position[2] - hallWidth / 2]} material={wallMaterial1}>
        <boxGeometry args={[hallLength, wallHeight, 0.1]} />
      </mesh>

      {/* Cyan Wall */}
      <mesh position={[position[0], 1.5, position[2] + hallWidth / 2]} material={wallMaterial2}>
        <boxGeometry args={[hallLength, wallHeight, 0.1]} />
      </mesh>

      {/* Switch on the Correct Side of the Magenta Wall */}
      <mesh ref={switchRef} position={switchPosition} material={switchMaterial}>
        <boxGeometry args={[0.6, 0.6, 0.4]} />
      </mesh>

      {/* Small Pop-Up near the switch */}
      {showOverlay && (
        <div
          style={{
            position: 'absolute',
            top: `${screenPosition.y}px`,
            left: `${screenPosition.x}px`,
            transform: 'translate(-50%, -100%)', // Center above the button
            background: '#333',
            color: '#fff',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
          }}
        >
          <h4>Interacționează</h4>
          <p>Apasă pe buton pentru a continua.</p>
          <button
            onClick={() => setShowOverlay(false)}
            style={{
              padding: '5px 10px',
              background: '#FFAA00',
              color: '#000',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            OK
          </button>
        </div>
      )}
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


const Obj1test = () => {
  const obj1test = useLoader(OBJLoader, '/models/uploads_files_2774758_D&R+Electrical+Sockets+and+Switches+FREE+SAMPLE.obj');

  return (
    <primitive
      object={obj1test}
      position={[6.1, 1.5, -1.9]}
      scale={[3, 3, 3]}
      rotation={[0,0,0]}
    />
  );
};
const Obj2test = () => {
  const obj2test = useLoader(OBJLoader, '/models/uploads_files_2423186_old+school+camera+nd+projector+obj+file 2.obj');

  return (
    <primitive
      object={obj2test}
      position={[0.3, 0, 2.2]}
      scale={[0.13, 0.13, 0.15]}
      rotation={[0, 1.5, 0]}
    />
  );
};


const Obj3test = () => {
  const obj3test = useLoader(OBJLoader, '/models/Qled UHD TV - Q9F/Q9F.obj');
  const texture = useLoader(TextureLoader, '/Imagini/logo-euronews-romania-horizontal-white-on-blue-rgb-01.png');

  useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
    }

    if (obj3test) {
      obj3test.traverse((child) => {
        if (child.isMesh) {
          child.material.map = texture; // Apply texture
          child.material.needsUpdate = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [obj3test, texture]);

  return (
    <primitive
      object={obj3test}
      position={[0, 0, -4.7]}
      scale={[0.066, 0.035, 0.039]}
      rotation={[0, 6.29, 0]}
    />
  );
};

const Obj1Interaction = ({ characterRef, changeLightIntensity }) => {
  const obj1Ref = useRef();

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'e') {
        // Verifică distanța dintre personaj și Ob1
        const characterPosition = characterRef.current?.position;
        const obj1Position = obj1Ref.current?.position;

        if (characterPosition && obj1Position) {
          const distance = characterPosition.distanceTo(obj1Position);
          if (distance <= 2) { // Distanță maximă pentru interacțiune
            changeLightIntensity();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [characterRef, changeLightIntensity]);

  return (
    <primitive
      ref={obj1Ref}
      object={useLoader(OBJLoader, '/models/uploads_files_2774758_D&R+Electrical+Sockets+and+Switches+FREE+SAMPLE.obj')}
      position={[6.1, 1.5, -1.9]}
      scale={[3, 3, 3]}
      rotation={[0, 0, 0]}
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

const FBXlights = ({ lightIntensity }) => { 
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
      <primitive
        object={fbxlights}
        position={[-4.5, 1.4, -1]}
        rotation={[0, Math.PI / 1.5, 0]} 
        scale={[0.009, 0.009, 0.009]}
      />
      <pointLight
        position={[-4.2, 2.4, -1.2]}
        intensity={lightIntensity} // Actualizează cu valoarea din prop
        color="#ffffff"
        distance={5}
        decay={2}
        castShadow={true}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <mesh position={[-4.2, 2.4, -1.2]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={lightIntensity / 2} />
      </mesh>
    </group>
  );
};


const FBXsecondlights = ({ lightIntensity }) => { 
  const fbxsecondlights = useLoader(FBXLoader, '/models/Box_Panel_Spot_Light.fbx');
  const texture = useLoader(TextureLoader, '/models/Curve_Panel_Spot_Light_Texture/Curve_Panel_Light_Bulb_M_Base_color.png');

  return (
    <group>
      <primitive
        object={fbxsecondlights}
        position={[4.5, 1.4, -1]}
        rotation={[0, Math.PI / -1.5, 0]} 
        scale={[0.009, 0.009, 0.009]}
      />
      <pointLight
        position={[4.2, 2.4, -1.2]}
        intensity={lightIntensity} // Actualizează cu valoarea din prop
        color="#ffffff"
        distance={5}
        decay={2}
        castShadow={true}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <mesh position={[4.3, 2.5, -1.4]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={lightIntensity / 2} />
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

const Pulpit = ({ onCollision }) => {
  const pulpitModel = useLoader(OBJLoader, '/models/studio.obj');
  const texture = useLoader(TextureLoader, '/Imagini/istockphoto-2161705945-612x612.jpg');
  const boundingBoxRef = useRef(new THREE.Box3());
  const modelRef = useRef();

  useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
    }

    if (pulpitModel) {
      pulpitModel.traverse((child) => {
        if (child.isMesh) {
          child.material.map = texture; // Apply texture
          child.material.needsUpdate = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [pulpitModel, texture]);

  useFrame(() => {
    if (modelRef.current) {
      const boundingBox = boundingBoxRef.current;
      boundingBox.setFromObject(modelRef.current);

      // Example collision detection
      if (onCollision) {
        const otherBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 0, -2), new THREE.Vector3(1, 1, 1));
        if (boundingBox.intersectsBox(otherBox)) {
          onCollision();
        }
      }
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={pulpitModel}
      position={[0, 0, -2]}
      scale={[0.007, 0.007, 0.007]}
    />
  );
};





const PointAndClickControls = ({ characterRef, wallColliders, mixer, actions, setIsWalking }) => {
  const { scene, camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());
  const targetPosition = useRef(null);
  const maxDistance = 5; // Maximum distance for point-and-click movement

  const handlePointerDown = (event) => {
    if (event.button !== 0) return; // Ignore right-click or other mouse buttons

    // Convert screen coordinates to normalized device coordinates
    pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Perform raycasting
    raycaster.current.setFromCamera(pointer.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;

      // Restrict movement to the horizontal plane
      const characterPosition = characterRef.current.position.clone();
      point.y = characterPosition.y;

      // Ensure the target is within range and doesn't collide with walls
      if (
        characterPosition.distanceTo(point) <= maxDistance &&
        !wallColliders.some((collider) => collider.intersectsBox(new THREE.Box3().setFromCenterAndSize(point, new THREE.Vector3(1, 1, 1))))
      ) {
        targetPosition.current = point;

        // Trigger walking animation
        if (!setIsWalking) return;
        setIsWalking(true);
        if (actions.idle) actions.idle.fadeOut(0.2);
        if (actions.walk) actions.walk.reset().fadeIn(0.2).play();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);

    if (characterRef.current && targetPosition.current) {
      const position = characterRef.current.position;
      const direction = targetPosition.current.clone().sub(position).normalize();

      // Move the character towards the target position
      const speed = 0.05; // Adjust speed as needed
      const distance = position.distanceTo(targetPosition.current);

      if (distance > 0.1) {
        characterRef.current.position.add(direction.multiplyScalar(speed));
        characterRef.current.rotation.y = Math.atan2(direction.x, direction.z);
      } else {
        // Stop moving and reset target position
        targetPosition.current = null;

        // Stop walking animation, return to idle
        setIsWalking(false);
        if (actions.walk) actions.walk.fadeOut(0.2);
        if (actions.idle) actions.idle.reset().fadeIn(0.2).play();
      }
    }
  });

  return null;
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
  const targetOffset = new THREE.Vector3(0, 1, -5); // Offset behind the character
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

        // Calculate the rotation angle for the characters
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

const TaskLogic = ({ characterRef, completeTask, lightIntensity }) => {
  useFrame(() => {
    if (characterRef.current) {
      const { x, z } = characterRef.current.position;

      // Task 1: Explorează camera 1
      if (x < 5 && z < 5) {
        completeTask(1);
      }

      // Task 2: Treci prin hol
      if (x > 5 && x < 15) {
        completeTask(2);
      }

      // Task 3: Ajungi la camera 2
      if (x > 15 && x < 25) {
        completeTask(3);
      }

      // Task 4: Schimbă intensitatea luminii
      if (lightIntensity >= 5) {
        completeTask(4);
      }
    }
  });

  return null; // Acest component nu are nevoie de un UI
};

// const DoorWithAnimation = ({ position, rotation, scale = [1, 1, 1] }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [doorModel, setDoorModel] = useState();
//   const doorRef = useRef();

//   useEffect(() => {
//     // Încarcă materialele (MTL)
//     const mtlLoader = new MTLLoader();
//     mtlLoader.load("/models/door/Project Name.mtl", (materials) => {
//       materials.preload();
//       const objLoader = new OBJLoader();
//       objLoader.setMaterials(materials);
//       objLoader.load("/models/door/Project Name.obj", (object) => {
//         object.position.set(...position);
//         object.rotation.set(...rotation);
//         setDoorModel(object);
//       });
//     });
//   }, [position, rotation]);

//   useEffect(() => {
//     if (doorModel) {
//       doorModel.traverse((child) => {
//         if (child.isMesh) {
//           child.castShadow = true;
//           child.receiveShadow = true;
//         }
//       });
//     }
//   }, [doorModel]);

//   const toggleDoor = () => {
//     if (!doorRef.current) return;

//     const targetRotation = isOpen ? 0 : Math.PI / 2; // 90° pentru deschidere
//     const doorAnimation = {
//       duration: 1000,
//       easing: "easeInOutSine",
//     };

//     // Animația rotației
//     doorRef.current.rotation.y = THREE.MathUtils.lerp(
//       doorRef.current.rotation.y,
//       targetRotation,
//       0.1
//     );

//     setIsOpen(!isOpen);
//   };

//   return (
//     <group ref={doorRef} scale={scale}>
//       {doorModel && <primitive object={doorModel} />}
//       <mesh onClick={toggleDoor}>
//         {/* Hitbox pentru interacțiune */}
//         <boxGeometry args={[1, 2, 0.1]} />
//         <meshBasicMaterial transparent opacity={0.0} />
//       </mesh>
//     </group>
//   );
// };



const EnvironmentTwoScene = () => {
  const keys = useKeyControls();
  const characterRef = useRef();
  const wallColliders = useRef([]).current;
  const [isFirstPerson, setIsFirstPerson] = useState(false);
  const [showEntryOverlay, setShowEntryOverlay] = useState(true); // Entry Overlay este vizibil inițial
const [showTutorial, setShowTutorial] = useState(false); // Tutorialul este ascuns inițial
const [lightIntensity, setLightIntensity] = useState(3);



const [tasks, setTasks] = useState([
  { id: 1, description: "Explorează camera 1", completed: false },
  { id: 2, description: "Treci prin hol", completed: false },
  { id: 3, description: "Ajungi la camera 2", completed: false },
  { id: 4, description: "Schimbă intensitatea luminii", completed: false }, // Task nou
]);
const completeTask = (taskId) => {
  setTasks((prevTasks) =>
    prevTasks.map((task) =>
      task.id === taskId ? { ...task, completed: true } : task
    )
  );
};
const changeLightIntensity = () => {
  setLightIntensity((prev) => (prev >= 5 ? 1 : prev + 1)); // Ciclu între 1 și 5
  completeTask(4); // Marchează task-ul de schimbare a intensității ca complet
};





  // useEffect(() => {
  //   const timer1 = setTimeout(() => {
  //     setShowEntryOverlay(false); // Ascunde primul overlay
      
  //     // Setează al doilea timer doar după ce primul overlay dispare
  //     const timer2 = setTimeout(() => {
  //       setShowTutorial(true); // Afișează tutorialul
  //     }, 1); // Tutorialul apare la 1ms după ce primul overlay dispare
      
  //     return () => clearTimeout(timer2); // Cleanup pentru al doilea timer
  //   }, 3000); // Primul overlay dispare după 3 secunde
  
  //   return () => clearTimeout(timer1); // Cleanup pentru primul timer
  // }, []);
  
  
  
  const TaskList = ({ tasks }) => {
    return (
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "#fff",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          maxWidth: "300px",
          zIndex: 1000,
          fontSize: "14px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", textAlign: "center" }}>
          Task-uri
        </h3>
        <ul style={{ listStyleType: "none", padding: "0", margin: "0" }}>
          {tasks.map((task) => (
            <li
              key={task.id}
              style={{
                marginBottom: "8px",
                color: task.completed ? "green" : "red",
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.description}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
      <TaskList tasks={tasks} /> {/* Aici se plasează TaskList */}
      


      <Canvas shadows>
  <XR>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} />
    <Sky />
    <TaskLogic characterRef={characterRef} completeTask={completeTask} lightIntensity={lightIntensity} />

    {/* Prima cameră */}
    <Room1 wallColliders={wallColliders} position={[0, 0, 0]} />

    {/* Hol */}
    <Hallway wallColliders={wallColliders} position={[10, 0, 0]} />

    {/* A doua cameră */}
    <Room2 wallColliders={wallColliders} position={[20, 0, 0]} />

    {/* Personaj */}
    <Character ref={characterRef} keys={keys} wallColliders={wallColliders} />

    {/* Cameră */}
    <CameraSetup characterRef={characterRef} keys={keys} />

    {/* Alte componente */}
    <Obj1test />
    <Obj1Interaction characterRef={characterRef} changeLightIntensity={changeLightIntensity} />
d
    <Obj2test />
    <Obj3test />
    <Pulpit />
    <FBXlights lightIntensity={lightIntensity} />
    <FBXsecondlights lightIntensity={lightIntensity} /> 
    {/* <DoorWithAnimation position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={[0.001, 0.001, 0.001]} /> */}


    <OBJwindow />
    <PointAndClickControls characterRef={characterRef} wallColliders={wallColliders} />

    {/* OrbitControls */}
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      maxPolarAngle={Math.PI * 2}
      minPolarAngle={0}
      maxAzimuthAngle={Infinity}
      minAzimuthAngle={-Infinity}
    />
    
  </XR>
</Canvas>

      
      {/* Overlay that appears when entering the scene */}
      {showEntryOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <h1>Bine ai venit!</h1>
          <p>Explorează scena și interacționează cu obiectele din jurul tău.</p>
          <button
            onClick={() => setShowEntryOverlay(false)}
            style={{
              padding: '10px 20px',
              background: '#FFAA00',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            OK
          </button>
        </div>
      )}


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