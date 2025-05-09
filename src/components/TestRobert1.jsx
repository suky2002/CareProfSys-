import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Sky, useGLTF, Text } from '@react-three/drei';
import { MathUtils } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import TutorialOverlay from './TutorialOverlay2';
import { TextureLoader } from 'three';
import { useNavigate } from 'react-router-dom';
import { OrbitControls } from '@react-three/drei';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XR } from '@react-three/xr'
// =============================
// 1. CHARACTER & CAMERA SETUP
// =============================
const useKeyControls = () => {
  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  useEffect(() => {
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
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);
  return keys.current;
};

function centerModelAtGround(scene) {
  scene.traverse((child) => {
    if (child.isMesh) {
      child.geometry.computeBoundingBox();
    }
  });
  const box = new THREE.Box3().setFromObject(scene);
  const yOffset = box.min.y;
  scene.position.y -= yOffset;
}

const Character = React.forwardRef(({ keys, wallColliders = [], target, clearTarget }, ref) => {
  const standingModel = useGLTF('/models/Asian_IT_Standing.glb');
  const walkingModel = useGLTF('/models/Deadwalking.glb');

  const mixer = useRef(null);
  const actions = useRef({});
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    if (standingModel && walkingModel) {
      centerModelAtGround(standingModel.scene);
      centerModelAtGround(walkingModel.scene);

      mixer.current = new THREE.AnimationMixer(standingModel.scene);
      actions.current.idle = mixer.current.clipAction(standingModel.animations[0]);
      actions.current.walk = mixer.current.clipAction(walkingModel.animations[0]);
      actions.current.idle.play();
    }
  }, [standingModel, walkingModel]);

  const checkCollision = (newPosition) => {
    for (const collider of wallColliders) {
      if (collider.containsPoint(newPosition)) {
        return true;
      }
    }
    return false;
  };

  useFrame((_, delta) => {
    if (ref.current && mixer.current) {
      let moved = false;
      const speed = 0.1;
      const rotationSpeed = 0.1;

      // Keyboard movement
      if (keys.forward || keys.backward || keys.left || keys.right) {
        if (target && clearTarget) clearTarget();

        const direction = new THREE.Vector3();
        ref.current.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();

        let moveVector = new THREE.Vector3();
        if (keys.forward) {
          moveVector.add(direction.clone().multiplyScalar(speed));
          moved = true;
        }
        if (keys.backward) {
          moveVector.add(direction.clone().multiplyScalar(-speed));
          moved = true;
        }
        if (keys.left) {
          ref.current.rotation.y += 0.05;
          moved = true;
        }
        if (keys.right) {
          ref.current.rotation.y -= 0.05;
          moved = true;
        }

        const newPosition = ref.current.position.clone().add(moveVector);
        if (!checkCollision(newPosition)) {
          ref.current.position.copy(newPosition);
        }
      }
      // Point & click movement (≤ 10 units)
      else if (target) {
        const currentPos = ref.current.position.clone();
        const moveDir = new THREE.Vector3().subVectors(target, currentPos);
        const distance = moveDir.length();
        if (distance > 0.1 && distance <= 10) {
          moveDir.normalize();
          const targetRotation = Math.atan2(moveDir.x, moveDir.z);
          ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotation, rotationSpeed);
          const newPosition = ref.current.position.clone().add(moveDir.clone().multiplyScalar(speed));
          if (!checkCollision(newPosition)) {
            ref.current.position.copy(newPosition);
          }
          moved = true;
        } else if (distance > 10) {
          clearTarget();
        }
      }

      // Switch animations
      if (actions.current.idle && actions.current.walk) {
        if (moved && !isWalking) {
          actions.current.idle.stop();
          actions.current.walk.play();
          setIsWalking(true);
        } else if (!moved && isWalking) {
          actions.current.walk.stop();
          actions.current.idle.play();
          setIsWalking(false);
        }
      }
      mixer.current.update(delta);
    }
  });

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {isWalking ? (
        <primitive object={walkingModel.scene} dispose={null} />
      ) : (
        <primitive object={standingModel.scene} dispose={null} />
      )}
    </group>
  );
});

// =============================
// CAMERA URMĂRIRE
// =============================
const CameraFollow = ({ characterRef, freeCamera }) => {
  const { camera, gl } = useThree();
  const zoomRef = useRef(5);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      zoomRef.current = THREE.MathUtils.clamp(zoomRef.current + e.deltaY * 0.01, 2, 15);
    };
    gl.domElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      gl.domElement.removeEventListener('wheel', handleWheel);
    };
  }, [gl.domElement]);

  useFrame(() => {
    if (freeCamera) return; // Nu actualizează camera când free camera e activă
    if (characterRef.current) {
      const characterPosition = characterRef.current.position.clone();
      const forward = new THREE.Vector3();
      characterRef.current.getWorldDirection(forward);
      forward.normalize();

      const distanceBehind = zoomRef.current;
      const verticalOffset = 3;
      const offset = forward.clone().multiplyScalar(-distanceBehind);
      offset.y += verticalOffset;

      const targetPosition = characterPosition.clone().add(offset);
      camera.position.lerp(targetPosition, 0.1);
      camera.lookAt(characterPosition);
    }
  });

  return null;
};

// =============================
// TASTA "P" => REVENIRE CAMERA URMĂRIRE
// =============================
function CameraReturnHandler({ characterRef, freeCamera, setFreeCamera }) {
  const { camera } = useThree();
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (freeCamera && e.key.toLowerCase() === 'p') {
        setFreeCamera(false);
        if (characterRef.current) {
          const characterPosition = characterRef.current.position.clone();
          camera.position.copy(characterPosition.clone().add(new THREE.Vector3(0, 3, -5)));
          camera.lookAt(characterPosition);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [freeCamera, setFreeCamera, characterRef, camera]);
  return null;
}
function CameraBoundaryEnforcer() {
  
  const { camera } = useThree();
  useFrame(() => {
    // horizontal limits (walls sit at ±10±0.5 → interior ±9.5)
    const xMin = -9.5, xMax =  9.5;
    const zMin = -9.5, zMax =  9.5;
    // vertical limits: floor at y=0, ceiling collider runs y∈[5,6]
    const yMin =  0.0, yMax = 4.5;

    camera.position.x = MathUtils.clamp(camera.position.x, xMin, xMax);
    camera.position.y = MathUtils.clamp(camera.position.y, yMin, yMax);
    camera.position.z = MathUtils.clamp(camera.position.z, zMin, zMax);
  });
  return null;
}
const Ground = ({ setTargetPosition }) => (
  <mesh
  rotation={[-Math.PI / 2, 0, 0]}
    position={[0, 0, 0]}
    receiveShadow
   onPointerDown={(e) => {
      e.stopPropagation();
      // e.point conține coordonatele 3D ale punctului de impact
      setTargetPosition(e.point.clone());
    }}
  >
    {/* extinde planeGeometry ca să primească click‐uri */}
    <planeGeometry args={[20, 20]} />
    {/* fă‐l invizibil, dar să continue să primească evenimente */}
    <meshStandardMaterial transparent opacity={0} />
  </mesh>
);

// =============================
// 2. OPTIONAL "BOOKSHELF" (BOXES)
// =============================
function BookShelf(props) {
  return (
    <group {...props}>
      {/* Back board */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.1, 2, 2]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      {/* Shelves */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.05, 1.8]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.1, 0.05, 1.8]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.1, 0.05, 1.8]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      {/* Exemplu "carte" */}
      <mesh position={[0.15, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
}

// =============================
// 3. SHELVES OBJ COMPONENT
// =============================
function ShelvesObj(props) {
  const shelvesObj = useLoader(OBJLoader, '/models/shelves.obj');
  shelvesObj.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({ color: 'black' });
    }
  });
  return <primitive object={shelvesObj} {...props} />;
}

// =============================
// 4. ROOM (with blue wall)
// =============================
function createBoxCollider(center, size) {
  const half = new THREE.Vector3(size[0] / 2, size[1] / 2, size[2] / 2);
  const min = new THREE.Vector3(center[0] - half.x, center[1] - half.y, center[2] - half.z);
  const max = new THREE.Vector3(center[0] + half.x, center[1] + half.y, center[2] + half.z);
  return new THREE.Box3(min, max);
}

const roomColliders = [
  createBoxCollider([0, 2.5, -10], [20, 5, 1]),
  createBoxCollider([-10, 2.5, 0], [1, 5, 20]),
  createBoxCollider([10, 2.5, 0], [1, 5, 20]),
  createBoxCollider([-5.5, 2.5, 10], [9, 5, 1]),
  createBoxCollider([5.5, 2.5, 10], [9, 5, 1]),
  createBoxCollider([0, 5.5, 0], [20, 1, 20]),
  createBoxCollider([0, 1, -2], [6, 2, 2])
];

const Monitor = ({ monitorImage }) => {
  // Încarci texturile o singură dată
  const dekstopTex = useLoader(TextureLoader, '/Imagini/Dekstopfree.png');
  const woodTex    = useLoader(TextureLoader, '/Imagini/wood.jpeg');

  // Alege textura potrivită
  const texture = monitorImage === 'wood.jpeg'
    ? woodTex
    : dekstopTex;

  return (
    <group position={[0, 1.9, -1.5]}>
      {/* Rama monitorului e mereu neagră */}
      <mesh>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Ecranul: afișăm plane doar dacă avem o imagine setată */}
      {monitorImage && (
        <mesh position={[0, 0, -0.055]}>
          <planeGeometry args={[1.8, 1.0]} />
          <meshStandardMaterial
            map={texture}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
};



const Computer = (props) => {
  const computerObj = useLoader(OBJLoader, '/models/Computer.obj');
  const computerTexture = useLoader(TextureLoader, '/Imagini/Computerimg.jpg');
  computerObj.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({ map: computerTexture });
    }
  });
  return <primitive object={computerObj} {...props} />;
};

// =============================
// TELEPORTARE CU PERSONAJUL (roșu)
// =============================
function TeleportButton({ characterRef }) {
  const { camera } = useThree();

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (characterRef.current) {
      characterRef.current.position.set(50, 0, 50);
      camera.position.set(60, 50, 50);
      camera.lookAt(new THREE.Vector3(20, 0, 0));
    }
  };

 
}

// =============================
// TELEPORTARE DOAR CAMERA (alb)
// =============================
function CameraTeleportButton({ setFreeCamera }) {
  const { camera } = useThree();

  const handlePointerDown = (e) => {
    e.stopPropagation();
    // Mutăm camera mai jos
    camera.position.set(0, -6.5, -50);  
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    setFreeCamera(true);
  };

  return (
    <mesh position={[7.7, 1.1, 4.5]} onPointerDown={handlePointerDown}>
      <boxGeometry args={[1, 0.5, 0.5]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

// =============================
// BOARD MODEL - PUS PE MASA2
// =============================
function BoardModel({ onLCDClick }) {
  // Încărcăm materialele din BoardV2.mtl din folderul "Imagini"
  const materials = useLoader(MTLLoader, '/Imagini/BoardV2.mtl');
  materials.preload();
  // Încărcăm modelul OBJ și setăm materialele
  const boardObj = useLoader(OBJLoader, '/models/BoardV2.obj', (loader) => {
    loader.setMaterials(materials);
  });

  return (
    <group>
      {/* Modelul BoardV2 */}
      <primitive
        object={boardObj}
        position={[-1, -3, -8]}
        scale={[0.3, 0.3, 0.3]}
        rotation={[3, 0, 3.15]}
      />




      {/* Potentiometru */}
      <mesh
        position={[-5, -6, -37]}
        rotation={[3, 0, 0]}
        scale={[2, 2, 2]}
        onClick={() => alert("Potentiometru")}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* US */}
      <mesh
        position={[-4, -9, -37]}
        rotation={[3, 0, 0]}
        scale={[4, 2, 1]}
        onClick={() => alert("US")}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Arduino */}
      <mesh
        position={[1, -8.5, -37]}
        rotation={[3, 0, 0]}
        scale={[4, 5, 1]}
        onClick={() => alert("Arduino")}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* LCD */}
      <mesh
        position={[0, -3.5, -37]}
        rotation={[3, 0, 0]}
        scale={[6, 3, 1]}
        onPointerDown={(e) => { 
                    e.stopPropagation();
                    console.log("LCD clicked");   // ← for debugging
                    onLCDClick();
                  }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* LSR */}
      <mesh
        position={[-2, -7, -37]}
        rotation={[3, 0, 0]}
        scale={[1, 1, 1]}
        onClick={() => alert("LSR")}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Nano */}
      <mesh
        position={[-5, 0, -37]}
        rotation={[3, 0, 0]}
        scale={[3.2, 2, 1]}
        onClick={() => alert("Nano")}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Joystick */}
      <mesh
        position={[-1, 0, -37]}
        rotation={[3, 0, 0]}
        scale={[3, 6, 3]}
        onClick={() => alert("Joystick")}
      >
        <planeGeometry args={[1, 0.5]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* ESP32 */}
      <mesh
        position={[2.8, 0, -37]}
        rotation={[3, 0, 0]}
        scale={[3, 3, 3]}
        onClick={() => alert("ESP32")}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* 7 Segment */}
      <mesh
        position={[6, 0, -37]}
        rotation={[3, 0, 0]}
        scale={[2, 2, 2]}
        onClick={() => alert("7 Segment")}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* LED */}
      <mesh
        position={[6, -4, -37]}
        rotation={[3, 0, 0]}
        scale={[2, 2, 2]}
        onClick={() => alert("LED")}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Servomotor */}
      <mesh
        position={[5.5, -8, -37]}
        rotation={[3, 0, 0]}
        scale={[3, 3, 3]}
        onClick={() => alert("Servomotor")}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}




// =============================
// ROOM
// =============================
const Room = ({ characterRef, monitorImage, handleComputerClick, handleRedClick, setFreeCamera, completeTask }) => {
  const doorRef = useRef();
  const [doorOpen, setDoorOpen] = useState(false);

  const handleDoorClick = (e) => {
    e.stopPropagation();
    if (characterRef && characterRef.current) {
      const doorWorldPos = new THREE.Vector3();
      doorRef.current.getWorldPosition(doorWorldPos);
      const charPos = characterRef.current.position;
      if (doorWorldPos.distanceTo(charPos) <= 10) {
        setDoorOpen((prev) => !prev);
      }
    }
  };

  useFrame(() => {
    if (doorRef.current) {
      const targetAngle = doorOpen ? Math.PI / 2 : 0;
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, targetAngle, 0.1);
    }
  });

  return (
    <group position={[0, 0.1, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333" side={THREE.DoubleSide} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 2.5, -10]}>
        <boxGeometry args={[20, 5, 1]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>

      {/* LEFT WALL => blue */}
      <mesh position={[-10, 2.5, 0]}>
        <boxGeometry args={[1, 5, 20]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* RIGHT WALL */}
      <mesh position={[10, 2.5, 0]}>
        <boxGeometry args={[1, 5, 20]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      <mesh position={[-5.5, 2.5, 10]}>
        <boxGeometry args={[9, 5, 1]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      <mesh position={[5.5, 2.5, 10]}>
        <boxGeometry args={[9, 5, 1]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>

      {/* DOOR */}
      <group ref={doorRef} position={[-1, 0, 9.51]} onPointerDown={handleDoorClick}>
        <mesh position={[1, 1.5, 0]}>
          <boxGeometry args={[2, 3, 0.2]} />
          <meshStandardMaterial color="brown" />
        </mesh>
      </group>
      <mesh position={[0, 4, 10]}>
        <boxGeometry args={[2, 2, 0.2]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>

      {/* CEILING */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#888" side={THREE.DoubleSide} />
      </mesh>

      {/* TABLE */}
      <mesh position={[0, 1, -2]}>
        <boxGeometry args={[6, 0.5, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* TABLE2 */}
      <mesh position={[8, 1, 5]}>
        <boxGeometry args={[4, 0.5, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* MONITOR */}
      <Monitor monitorImage={monitorImage} />

      {/* MOUSE (red) */}
      <mesh
  position={[2.2,1.7,-3.1]}
  onPointerDown={e => { e.stopPropagation(); handleComputerClick() }}
>
  <boxGeometry args={[0.5,0.5,0.5]} />
  <meshStandardMaterial color="blue" />
</mesh>

<mesh
  position={[-1.8,1.25,-2]}
  onPointerDown={e => { e.stopPropagation(); handleRedClick() }}
>
  <boxGeometry args={[0.5,0.5,0.5]} />
  <meshStandardMaterial color="red" />
</mesh>
      {/* MOUSE (blue) */}
      {/* Teleportare cu personajul (roșu) */}
      <TeleportButton characterRef={characterRef} />

      {/* Teleportare doar a camerei (verde) */}
      <CameraTeleportButton setFreeCamera={setFreeCamera} />

      

      {/* POSTER */}
      <mesh position={[0, 4, -9.51]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <Text position={[0, 4.5, -9.5]} fontSize={0.5} color="black">
        Circuit Diagram
      </Text>
      <Text position={[0, 6.5, -9]} fontSize={1} color="yellow">
        Electronics Lab
      </Text>

      {/* COMPUTER (OBJ) */}
      <Computer position={[2.2, 1.3, -2.1]} scale={[0.025, 0.025, 0.025]} rotation={[-Math.PI / 2, 0, Math.PI]} />

      {/* BOX-BASED BOOKSHELF */}
      <BookShelf position={[-9.4, 0, 0]} />

      {/* SHELVES.OBJ */}
      <ShelvesObj position={[-8, 0, 9]} scale={[0.02, 0.02, 0.02]} rotation={[0, Math.PI, 0]} />

      {/* BOARD MODEL PUS PE MASA2 */}
      <BoardModel onLCDClick={() => completeTask(1)} />
    </group>
  );
};

// =============================
// 5. MAIN ENVIRONMENT
// =============================

const TaskList = ({ tasks }) => {
  const navigate = useNavigate();
  const allDone = tasks.every(t => t.completed);

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.7)",
        color: "#fff",
        padding: 12,
        borderRadius: 6,
        zIndex: 1000,
        fontSize: 14,
      }}
    >
      <h3 style={{ margin: "0 0 8px", textAlign: "center" }}>Task-uri</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tasks.map(t => (
          <li
            key={t.id}
            style={{
              marginBottom: 6,
              color: t.completed ? "#4caf50" : "#f44336",
              textDecoration: t.completed ? "line-through" : "none"
            }}
          >
            {t.description}
          </li>
        ))}
      </ul>
      <button
        onClick={() => navigate("/course-recommendations")}
        disabled={!allDone}
        style={{
          marginTop: 8,
          width: "100%",
          padding: "6px 0",
          background: allDone ? "#4caf50" : "#777",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: allDone ? "pointer" : "not-allowed",
        }}
      >
        {allDone ? "Continuă la recomandări" : "Finalizați task-urile întâi"}
      </button>
    </div>
  );
};
const Environment = () => {
    const navigate = useNavigate();
    const controlsRef = useRef(null);
    function ControlsUpdater() {
    useFrame(() => {
      if (controlsRef.current && characterRef.current) {
        controlsRef.current.target.copy(characterRef.current.position);
      }
    });
    return null;
  }
  // 1) tasks state
  const [tasks, setTasks] = useState([
    { id: 1, description: "Apasă pe LCD", completed: false },
    // … you could add more later
  ]);

  const completeTask = (taskId) => {
    setTasks((prev) =>
      prev.map(t => t.id === taskId ? { ...t, completed: true } : t)
    );
  };

  // 2) whenever *all* tasks are done, navigate
 // useEffect(() => {
   // if (tasks.every(t => t.completed)) {
      // small delay so the user sees the UI update
    //  setTimeout(() => navigate("/course-recommendations"), 500);
   // }
 // }, [tasks, navigate]);
  const [showTutorial, setShowTutorial] = useState(true);
  const keys = useKeyControls();
  const characterRef = useRef();
  const [targetPosition, setTargetPosition] = useState(null);
  const clearTarget = () => setTargetPosition(null);

  // Stare pentru monitor (imagini)
  const [monitorImage, setMonitorImage] = useState(null);

  // Stare pentru free camera: false = camera urmărește personajul; true = camera e în mod "free"
  const [freeCamera, setFreeCamera] = useState(false);

  // Blue button => setează "Dekstopfree.png"
 // buton albastru — setează întotdeauna prima imagine
 const handleComputerClick = () => {
  // setează prima imagine doar când apeși
  setMonitorImage('Dekstopfree.png');
};

// buton roșu — a doua imagine
const handleRedClick = () => {
  setMonitorImage('wood.jpeg');
};
  if (showTutorial) {
    return <TutorialOverlay onClose={() => setShowTutorial(false)} />;
  }
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* 1) TASK PANEL */}
      <TaskList tasks={tasks} />
      +   {/* 2) BUTTON TO RETURN CAMERA */}
   <button
     onClick={() => setFreeCamera(false)}
     style={{
       position: "absolute",
       top: 120,
       right: 10,
       zIndex: 1000,
       padding: "6px 12px",
       background: "#4caf50",
       color: "#fff",
       border: "none",
       borderRadius: 4,
       cursor: "pointer",
     }}
   >
     Revenire Cameră
   </button>
      {/* 2) 3D SCENE */}
      <Canvas shadows style={{ width: "100%", height: "100%" }}>
        <XR>
          <Sky />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
  
          <Character
            ref={characterRef}
            keys={keys}
            wallColliders={roomColliders}
            target={targetPosition}
            clearTarget={clearTarget}
          />
  <CameraFollow characterRef={characterRef} freeCamera={freeCamera} />

       {/* listen for P to return the cam to follow‐mode */}
       <CameraReturnHandler
         characterRef={characterRef}
         freeCamera={freeCamera}
         setFreeCamera={setFreeCamera}
       />
  
          {/* Ground invizibil, care primește click-urile */}
          <Ground setTargetPosition={setTargetPosition} />
  
          <Room
            characterRef={characterRef}
            monitorImage={monitorImage}
            handleComputerClick={handleComputerClick}
            handleRedClick={handleRedClick}
            setFreeCamera={setFreeCamera}
            completeTask={completeTask}
          />
  
          {/* orbit liber, pivot pe caracter */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableRotate
            enableZoom
            minDistance={5}
            maxDistance={15}
            minPolarAngle={Math.PI * 0.17}  /* ~30° */
            maxPolarAngle={Math.PI * 0.44}  /* ~80° */
            minAzimuthAngle={-Infinity}
           maxAzimuthAngle={ Infinity }
           onStart={() => setFreeCamera(true)}
           onEnd={() => {/* nothing here; pressing “P” will re-attach */}}
         />
         <ControlsUpdater />
         <CameraBoundaryEnforcer />
        </XR>
      </Canvas>
    </div>
  );
  
};

export default Environment;