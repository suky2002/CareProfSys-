import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, useFBX } from '@react-three/drei';

// --------------------------------------------------
// Hook pentru controlul tastelor (W, A, S, D)
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

// --------------------------------------------------
// Funcție helper: Centrează modelul astfel încât partea de jos să fie la y = 0.
function centerModelAtGround(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      child.geometry.computeBoundingBox();
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const yOffset = box.min.y;
  model.position.y -= yOffset;
}

// --------------------------------------------------
// Componenta Character
const Character = React.forwardRef(({ keys, wallColliders = [], target, clearTarget }, ref) => {
    // Încărcăm modelele FBX: unul pentru idle (standing) și unul pentru walk.
    const standingModel = useFBX('/models/qw.fbx');
    const walkingModel = useFBX('/models/qwe.fbx');
  
    // Folosim două mixere separate pentru fiecare model
    const idleMixer = useRef(null);
    const walkMixer = useRef(null);
    const actions = useRef({});
    // Inițial, personajul este în starea idle (standing)
    const [isWalking, setIsWalking] = useState(false);
  
    useEffect(() => {
      if (standingModel && walkingModel) {
        // Centrează modelele la sol
        centerModelAtGround(standingModel);
        centerModelAtGround(walkingModel);
  
        // Inițializăm câte un mixer pentru fiecare model
        idleMixer.current = new THREE.AnimationMixer(standingModel);
        walkMixer.current = new THREE.AnimationMixer(walkingModel);
  
        // Verifică dacă modelele conțin animații
        if (!standingModel.animations.length || !walkingModel.animations.length) {
          console.warn('FBX-urile nu conțin animații!');
        }
  
        // Preluăm animațiile (presupunând că indexul 0 este corect)
        actions.current.idle = idleMixer.current.clipAction(standingModel.animations[0]);
        actions.current.walk = walkMixer.current.clipAction(walkingModel.animations[0]);
  
        // Pornim animația idle inițial
        actions.current.idle.play();
        // Pornim și animația walk, dar aceasta va fi invizibilă la început
        actions.current.walk.play();
      }
    }, [standingModel, walkingModel]);
  
    // Funcție simplă de verificare a coliziunilor
    const checkCollision = (newPosition) => {
      for (const collider of wallColliders) {
        if (collider.containsPoint(newPosition)) {
          return true;
        }
      }
      return false;
    };
  
    useFrame((_, delta) => {
        if (ref.current) {
          const speed = 0.1;
          const rotationSpeed = 0.1;
      
          // Calculăm direcția de deplasare (folosind W/S)
          const direction = new THREE.Vector3();
          ref.current.getWorldDirection(direction);
          direction.y = 0;
          direction.normalize();
      
          let moveVector = new THREE.Vector3();
          if (keys.forward) {
            moveVector.add(direction.clone().multiplyScalar(speed));
          }
          if (keys.backward) {
            moveVector.add(direction.clone().multiplyScalar(-speed));
          }
          // Rotația se aplică separate
          if (keys.left) {
            ref.current.rotation.y += 0.05;
          }
          if (keys.right) {
            ref.current.rotation.y -= 0.05;
          }
      
          // Actualizează poziția, dacă există deplasare efectivă (W/S)
          if (moveVector.length() > 0) {
            const newPosition = ref.current.position.clone().add(moveVector);
            if (!checkCollision(newPosition)) {
              ref.current.position.copy(newPosition);
            }
          }
          
          // Dacă oricare tastă este apăsată, considerăm că se dorește mișcarea
          const anyKeyPressed = keys.forward || keys.backward || keys.left || keys.right;
      
          // Comutare între animații în funcție de starea tastelor
          if (anyKeyPressed && !isWalking) {
            actions.current.idle.fadeOut(0.2);
            actions.current.walk.fadeIn(0.2).play();
            setIsWalking(true);
          } else if (!anyKeyPressed && isWalking) {
            actions.current.walk.fadeOut(0.2);
            actions.current.idle.fadeIn(0.2).play();
            setIsWalking(false);
          }
      
          // Actualizează mixerele (fără reset, pentru o tranziție continuă)
          if (idleMixer.current) idleMixer.current.update(delta);
          if (walkMixer.current) walkMixer.current.update(delta);
        }
      });
      
  
    return (
      <group ref={ref} position={[0, 0, 0]}>
        {/* Afișăm modelul idle (standing) când nu se mișcă și modelul walk când se mișcă */}
        <primitive object={standingModel} dispose={null} visible={!isWalking} />
        <primitive object={walkingModel} dispose={null} visible={isWalking} />
      </group>
    );
  });
  

// --------------------------------------------------
// CameraFollow: Camera care urmărește personajul
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
      const verticalOffset = 2;
      const offset = forward.clone().multiplyScalar(-distanceBehind);
      offset.y += verticalOffset;

      const targetPosition = characterPosition.clone().add(offset);
      camera.position.lerp(targetPosition, 0.1);
      camera.lookAt(characterPosition);
    }
  });

  return null;
};

// --------------------------------------------------
// Ground: Planul pe care se mișcă personajul; setare target la click
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

// --------------------------------------------------
// Environment: Combină toate componentele într-o scenă R3F.
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
        <Character
          ref={characterRef}
          keys={keys}
          wallColliders={[]} // Dacă ai coliziuni, adaugă-le aici
          target={targetPosition}
          clearTarget={clearTarget}
        />
        <CameraFollow characterRef={characterRef} />
        <Ground setTargetPosition={setTargetPosition} />
      </Canvas>
    </div>
  );
};

export default Environment;
