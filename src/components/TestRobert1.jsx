import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Sky, useGLTF, Text } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TextureLoader } from 'three';

// ====================================================
// 1. CHARACTER MOVEMENT & CAMERA SETUP
// ====================================================

// Hook for key controls (W, A, S, D)
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

// Helper: center a model so its bottom is at y=0
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

// Character with idle/walk animations
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

  // Simple collision check
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

// CameraFollow: slightly raised behind the character
const CameraFollow = ({ characterRef }) => {
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

// Ground: plane for optional point & click
const Ground = ({ setTargetPosition }) => (
  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    position={[0, 0, 0]}
    onPointerDown={(e) => {
      e.stopPropagation();
      setTargetPosition(e.point.clone());
    }}
  >
    <planeGeometry args={[50, 50]} />
    <meshStandardMaterial color="green" />
  </mesh>
);

// ====================================================
// 2. ROOM (Electronics Lab)
// ====================================================

// Helper: Create a Box3 collider from a center + size
const createBoxCollider = (center, size) => {
  const half = new THREE.Vector3(size[0] / 2, size[1] / 2, size[2] / 2);
  const min = new THREE.Vector3(center[0] - half.x, center[1] - half.y, center[2] - half.z);
  const max = new THREE.Vector3(center[0] + half.x, center[1] + half.y, center[2] + half.z);
  return new THREE.Box3(min, max);
};

// Colliders: walls, ceiling, table at y=1
const roomColliders = [
  // Walls
  createBoxCollider([0, 2.5, -10], [20, 5, 1]),
  createBoxCollider([-10, 2.5, 0], [1, 5, 20]),
  createBoxCollider([10, 2.5, 0], [1, 5, 20]),
  createBoxCollider([-5.5, 2.5, 10], [9, 5, 1]),
  createBoxCollider([5.5, 2.5, 10], [9, 5, 1]),
  // Ceiling
  createBoxCollider([0, 5.5, 0], [20, 1, 20]),
  // Table at y=1: geometry is 6 wide, 0.5 thick, 2 deep
  // but we want to block the character at y=0. So let's
  // extend collider down to y=0 => center ~ y=1, size ~ [6,2,2]
  // that means half = [3,1,1], so min = [-3,0,-3], max=[3,2,-1].
  // Enough to block the character from going under the table.
  createBoxCollider([0, 1, -2], [6, 2, 2])
];

// Computer OBJ with a texture
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

const Room = ({ characterRef }) => {
  const doorRef = useRef();
  const [doorOpen, setDoorOpen] = useState(false);

  // Only toggle door if character is within 10 units
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

  useFrame((_, delta) => {
    if (doorRef.current) {
      const targetAngle = doorOpen ? Math.PI / 2 : 0;
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, targetAngle, 0.1);
    }
  });

  return (
    // Room is raised by 0.1 on Y
    <group position={[0, 0.1, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333" side={THREE.DoubleSide} />
      </mesh>
      {/* Back Wall */}
      <mesh position={[0, 2.5, -10]}>
        <boxGeometry args={[20, 5, 1]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-10, 2.5, 0]}>
        <boxGeometry args={[1, 5, 20]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Right Wall */}
      <mesh position={[10, 2.5, 0]}>
        <boxGeometry args={[1, 5, 20]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Front Wall Left */}
      <mesh position={[-5.5, 2.5, 10]}>
        <boxGeometry args={[9, 5, 1]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Front Wall Right */}
      <mesh position={[5.5, 2.5, 10]}>
        <boxGeometry args={[9, 5, 1]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>

      {/* Door Group */}
      <group ref={doorRef} position={[-1, 0, 9.51]} onPointerDown={handleDoorClick}>
        <mesh position={[1, 1.5, 0]}>
          <boxGeometry args={[2, 3, 0.2]} />
          <meshStandardMaterial color="brown" />
        </mesh>
      </group>
      {/* Header above door */}
      <mesh position={[0, 4, 10]}>
        <boxGeometry args={[2, 2, 0.2]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#888" side={THREE.DoubleSide} />
      </mesh>

      {/* Table geometry at y=1 */}
      {/* The table is 6 wide, 0.5 thick, 2 deep. */}
      <mesh position={[0, 1, -2]}>
        <boxGeometry args={[6, 0.5, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Monitor on table, top is at y=1.5 => place monitor a bit above. */}
      <mesh position={[0, 1.5, -1.5]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="#000" />
      </mesh>

      {/* "Mouse" (red box) on table */}
      <mesh position={[-1, 1.25, -2]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* "Computer button" (blue box) on table */}
      <mesh position={[1, 1.25, -2]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Poster on back wall */}
      <mesh position={[0, 4, -9.51]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <Text position={[0, 4.5, -9.5]} fontSize={0.5} color="black">
        Circuit Diagram
      </Text>

      {/* Lab Title */}
      <Text position={[0, 6.5, -9]} fontSize={1} color="yellow">
        Electronics Lab
      </Text>

      {/* Computer (OBJ) on table */}
      <Computer
        position={[2, 1.25, -2]}
        scale={[0.03, 0.03, 0.03]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
      />
    </group>
  );
};

// ====================================================
// 3. COMBINED ENVIRONMENT
// ====================================================
const Environment = () => {
  const keys = useKeyControls();
  const characterRef = useRef();
  const [targetPosition, setTargetPosition] = useState(null);
  const clearTarget = () => setTargetPosition(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
      <Canvas shadows style={{ width: '100%', height: '100%' }}>
        <Sky />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* Character with collisions (including the raised table) */}
        <Character
          ref={characterRef}
          keys={keys}
          wallColliders={roomColliders}
          target={targetPosition}
          clearTarget={clearTarget}
        />
        {/* Camera following the character */}
        <CameraFollow characterRef={characterRef} />
        {/* Ground for point & click */}
        <Ground setTargetPosition={setTargetPosition} />
        {/* The room, passing characterRef for door distance check if needed */}
        <Room characterRef={characterRef} />
      </Canvas>
    </div>
  );
};

export default Environment;
