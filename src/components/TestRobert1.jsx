import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Sky, useGLTF, Text, useAnimations } from '@react-three/drei';
import { MathUtils } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import TutorialOverlay from './TutorialOverlay2';
import { DoubleSide, TextureLoader } from 'three'
import { RepeatWrapping } from 'three';
import { useNavigate } from 'react-router-dom';
import { OrbitControls } from '@react-three/drei';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XR } from '@react-three/xr'
import JobSimulator from './JobSimulator';
import TaskList from './TaskList';
import V2BookShelfModel from './V2BookShelfModel.jsx';
import ElectricalQuiz from './ElectricalQuiz';
import Monitor from './Monitor.jsx';
import QuizIOT from './QuizIOT.jsx';
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
function KeyboardTeleport({ controlsRef, setFreeCamera, setSavedCameraPosition }) {
  const { camera } = useThree();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() === 'm') {
        setFreeCamera(true); // 1. activează freeCamera
        setSavedCameraPosition(camera.position.clone()); // 2. salvează poziția camerei

        if (controlsRef.current) {
          controlsRef.current.enabled = true;
          // 3. dezactivează orbit target lock pe caracter
          controlsRef.current.target.set(0, 0, 0);
        }

        // 4. setează camera într-o poziție fixă
        camera.position.set(0, 5, -15);
        camera.lookAt(0, 0, 0);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [camera, controlsRef, setFreeCamera, setSavedCameraPosition]);

  return null;
}

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
function OfficeChair(props) {
  // Încarcă o singură dată modelul în cache
  const chair = useLoader(FBXLoader, '/models/officechair.fbx');
  
  // Clonează la fiecare redare, astfel încât să poți avea mai multe instanțe simultan:
  const cloned = chair.clone();

  return <primitive object={cloned} {...props} />;
}


function Papers(props) {
  const Papers = useLoader(FBXLoader, '/models/Papers_V2.fbx')
 
  return <primitive object={Papers} {...props} />
}
function BuzzerFBX(props) {
  const buzzerScene = useLoader(FBXLoader, '/models/Buzzer.fbx');

  // Aplică un material simplu pe toate mesh-urile
  buzzerScene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({ color: 'brown' });
    }
  });

  return <primitive object={buzzerScene} {...props} />;

}
const SittingCuteBoy = (props) => {
  const fbx = useLoader(FBXLoader, '/models/fatguy.fbx');
  const { actions, mixer } = useAnimations(fbx.animations, fbx);

  
  useEffect(() => {
   const clipNames = Object.keys(actions);
   if (clipNames.length) {
     actions[clipNames[0]]
       .reset()
       .setLoop(THREE.LoopRepeat)
       .fadeIn(0.2)
       .play();
   }
  }, [actions]);
  
  useFrame((_, delta) => mixer.update(delta));
  
  return <primitive object={fbx} {...props} />;
  }


  function PointingModel(props) {
    // încarcă FBX-ul
    const fbx = useLoader(FBXLoader, '/models/Pointing.fbx');
    // setup pentru animații
    const { actions, mixer } = useAnimations(fbx.animations, fbx);
  
    useEffect(() => {
      // dacă există cel puțin o animație, o pornim pe prima
      const clipNames = Object.keys(actions);
      if (clipNames.length) {
        actions[clipNames[0]]
          .reset()
          .setLoop(THREE.LoopRepeat)
          .fadeIn(0.2)
          .play();
      }
    }, [actions]);
  
    // actualizăm mixer-ul în fiecare frame
    useFrame((_, delta) => {
      mixer.update(delta);
    });
  
    return <primitive object={fbx} {...props} />;
  }
const Character = React.forwardRef(({ keys, wallColliders = [], target, clearTarget, freeCamera }, ref) => {

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
    let moved = false;
    const speed = 0.1;
    const rotationSpeed = 0.1;
  
    // 1) Dacă suntem în freeCamera, blocăm doar mișcarea cu WASD, 
    //    dar permitem point‐and‐click (target există și poate fi procesat).
    if (!freeCamera && (keys.forward || keys.backward || keys.left || keys.right)) {
      // ── Mișcarea prin taste (doar când freeCamera === false) ──
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
    // 2) Point‐and‐click: îl procesăm indiferent de freeCamera
    else if (target) {
      const currentPos = ref.current.position.clone();
      const moveDir = new THREE.Vector3().subVectors(target, currentPos);
      const distance = moveDir.length();
      if (distance > 0.1 && distance <= 10) {
        moveDir.normalize();
        const targetRotation = Math.atan2(moveDir.x, moveDir.z);
        ref.current.rotation.y = THREE.MathUtils.lerp(
          ref.current.rotation.y,
          targetRotation,
          rotationSpeed
        );
        const newPosition = ref.current.position.clone().add(moveDir.clone().multiplyScalar(speed));
        if (!checkCollision(newPosition)) {
          ref.current.position.copy(newPosition);
        }
        moved = true;
      } else if (distance > 10) {
        clearTarget();
      }
    }
  
    // 3) Schimbă animația în funcție de moved
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
  });
  

  return (
    <group ref={ref} position={[0, 0, 0]} scale={[1.15, 1.15, 1.15]}>
      
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
  const zoomRef = useRef(3);

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
      const verticalOffset = 2.5;
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
function CameraReturnHandler({ characterRef, freeCamera, setFreeCamera, savedCameraPosition }) {

  const { camera } = useThree();
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (freeCamera && e.key.toLowerCase() === 'p') {
        setFreeCamera(false);
        if (savedCameraPosition) {
          camera.position.copy(savedCameraPosition); // ← revenim la poziția anterioară
        } else if (characterRef.current) {
          const characterPosition = characterRef.current.position.clone();
          camera.position.copy(characterPosition.clone().add(new THREE.Vector3(0, 1.5, -3)));
        }
        if (characterRef.current) {
          camera.lookAt(characterRef.current.position);
        }
      } 
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [freeCamera, setFreeCamera, characterRef, camera]);
  return null;
}
function CameraBoundaryEnforcer({ freeCamera }) {

  const { camera } = useThree();
  useFrame(() => {
    if (freeCamera) return;
    // horizontal limits (walls sit at ±10±0.5 → interior ±9.5)
    const xMin = -9.5, xMax = 9.5;
    const zMin = -9.5, zMax = 9.5;
    // vertical limits: floor at y=0, ceiling collider runs y∈[5,6]
    const yMin = 0.0, yMax = 4.5;

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
const ElectricPanel = ({ lightOn, toggleLight }) => {
  return (
    <group position={[-8, 2, -5]}>
      {/* Cutie electrică */}
      <mesh>
        <boxGeometry args={[1, 2, 0.3]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Buton de comutare */}
      <mesh
        position={[0, 0.5, 0.55]}
        onClick={(e) => {
          e.stopPropagation();
          toggleLight();
        }}
      >
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial color={lightOn ? 'green' : 'red'} />
      </mesh>

      {/* Bec */}
      <mesh position={[0, 1.2, 0.15]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={lightOn ? 'yellow' : 'gray'} emissive={lightOn ? 'yellow' : 'black'} />
      </mesh>
    </group>
  );
};

// Componentă pentru un task de tip quiz (multiple choice)
function QuizTask({ task, onComplete }) {
  const [selected, setSelected] = React.useState(null);
  const [answered, setAnswered] = React.useState(false);

  const submitAnswer = () => {
    if (selected === task.correctOption) {
      onComplete(true);  // răspuns corect
    } else {
      onComplete(false); // răspuns greșit
    }
    setAnswered(true);
  };

  return (
    <div className="quiz-task">
      <p><strong>{task.intrebare}</strong></p>
      {task.optiuni.map((opt, idx) => (
        <div key={idx}>
          <label>
            <input
              type="radio"
              name="quiz"
              checked={selected === idx}
              onChange={() => setSelected(idx)}
            />
            {opt}
          </label>
        </div>
      ))}
      <button onClick={submitAnswer}>Verifică</button>
      {/* Feedback imediat */}
      {answered && (
        <p>
          {selected === task.correctOption
            ? "Corect! 🟢"
            : "Răspuns greșit. Încearcă din nou. 🔴"}
        </p>
      )}
    </div>
  );
}
// =============================
// 2. OPTIONAL "Panel" COMPONENT
// =============================
function Panel({ onClick, ...props }) {
  return (
    <group {...props}>
      <mesh position={[0, 2, 0]} onPointerDown={(e) => { e.stopPropagation(); onClick?.(); }}>
        <boxGeometry args={[0.1, 2, 2]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <Text
        position={[0.06, 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Electrical Panel
      </Text>
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
      child.material = new THREE.MeshStandardMaterial({ color: 'brown' });
    }
  });
  return <primitive object={shelvesObj} {...props} />;
}
function BoxObj(props) {
  const BoxOBJ = useLoader(OBJLoader, '/models/BoxObj.obj');
  BoxOBJ.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({ color: 'brown' });
    }
  });
  return <primitive object={BoxOBJ} {...props} />;
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

// =============================
// 4. ROOM (with blue wall + mese + scaune)
// =============================
const roomColliders = [
  // 1) Pereți (exact cum aveai deja)
  createBoxCollider([0, 2.5, -10], [20, 5, 1]),    // peretele din față
  createBoxCollider([-10, 2.5, 0], [2, 5, 20]),    // peretele din stânga
  createBoxCollider([10, 2.5, 0], [2, 5, 20]),     // peretele din dreapta
  createBoxCollider([-5.5, 2.5, 10], [9, 5, 1]),   // peretele din spate stânga
  createBoxCollider([5.5, 2.5, 10], [9, 5, 1]),    // peretele din spate dreapta
  createBoxCollider([0, 5.5, 0], [20, 1, 20]),
  createBoxCollider(
    /* center */ [ -9.5, 5/2, -8.5 ], 
    /* size   */ [ 10,   5,   1   ]
  ),

  // ─── COLIZOR LATERAL DREAPTA (3 unităţi în interior, înălţime 5, lăţime 1) ───
  // ‣ Ocupă X ∈ [ +9 , +10],  Y ∈ [0 , 5],  Z ∈ [−10 , −7]
  createBoxCollider(
    /* center */ [ +9.5, 5/2, -8.5 ],
    /* size   */ [ 10,   5,   1     ]
  ),
   // tavanul
  // 2) Ușă / prag (opțional, dacă vrei să nu treci prin ușă când e închisă)
  // (aici, dacă vrei să blochezi întreg spațiul din fața ușii când e închisă, ar trebui să ajustezi dinamic)
  // createBoxCollider([ -1, 1.5, 9.51 ], [ 2, 3, 0.2 ]),

  // ───────────────────────────────
  // 3) Mese (plăcile)
  //     – TABLE 1 la [0,1,-2], blat 6×2 (înălțimea platoului e 0.1, dar extindem la total 2 ca să cuprindem și picioarele)
  createBoxCollider([0, 1, -2], [6, 2, 2]),

  //     – TABLE 2 la [8,1,5], blat 4×2
  createBoxCollider([8, 1, 5], [4, 2, 2]),

  //     – TABLE 3 la [0,1,5], blat 4×2
  createBoxCollider([0, 1, 5], [4, 2, 2]),

  // ───────────────────────────────
  // 4) Scaune (estimăm footprint aproximativ 1×1 și înălțime de 2)
  //     – Scaun 1 la [8,0.1,7]
  createBoxCollider([8, 1, 7], [1, 2, 1]),
  //     – Scaun 2 la [8,0.1,3]
  createBoxCollider([8, 1, 3], [1, 2, 1]),
  //     – Scaun 3 la [0,0.1,-4]
  createBoxCollider([0, 1, -4], [1, 2, 1]),
  createBoxCollider([-1, 1.5, 9.5], [2, 3, 0.2]),
];

const MultiImageMonitor  = ({ monitorImage }) => {
  const dekstopTex = useLoader(TextureLoader, '/Imagini/Dekstopfree.png');
  const numberedTextures = useLoader(TextureLoader, [
    '/Imagini/1.jpg',
    '/Imagini/2.jpg',
    '/Imagini/3.jpg',
    '/Imagini/4.jpg',
    '/Imagini/5.jpg'
  ]);

  let currentTexture = null;
  if (monitorImage === 'Dekstopfree.png') {
    currentTexture = dekstopTex;
  } else {
    const idx = ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg'].indexOf(monitorImage);
    if (idx >= 0) currentTexture = numberedTextures[idx];
  }

  return (
    <group position={[0, 1.9, -1.5]}>
      <mesh>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="black" />
      </mesh>
      {currentTexture && (
        <mesh position={[0, 0, -0.055]}>
          <planeGeometry args={[1.8, 1.0]} />
          <meshStandardMaterial map={currentTexture} side={THREE.DoubleSide} toneMapped={false} />
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
function CameraTeleportButton({ setFreeCamera, lcdRef }) {
  const { camera } = useThree();

  const handlePointerDown = (e) => {
    e.stopPropagation();

    // 1) Mutăm camera exact unde vrei:
    camera.position.set(1, 5, -18);

    // 2) Citim poziția World (Globală) a mesh-ului LCD
    if (lcdRef.current) {
      const worldPos = new THREE.Vector3();
      lcdRef.current.getWorldPosition(worldPos);
      camera.lookAt(worldPos);
    }

    setFreeCamera(true);
  };

  return (
    <mesh position={[0, 1.1, 4.5]} onPointerDown={handlePointerDown}>
      <boxGeometry args={[1, 0.1, 0.5]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}
function ProjectorScreen({ monitorImage }) {
  // 1) Încarcă textura fixă pentru "Dekstopfree.png"
  const dekstopTex = useLoader(TextureLoader, '/Imagini/Dekstopfree.png');

  // 2) Încarcă cele 5 imagini numerotate într-un array
  const numberedTextures = useLoader(TextureLoader, [
    '/Imagini/1.jpg',
    '/Imagini/2.jpg',
    '/Imagini/3.jpg',
    '/Imagini/4.jpg',
    '/Imagini/5.jpg'
  ]);

  // 3) Dacă nu există niciun monitorImage, nu afișa nimic
  if (!monitorImage) return null;

  // 4) Alege textura curentă după valoarea monitorImage
  let currentTexture = null;
  if (monitorImage === 'Dekstopfree.png') {
    currentTexture = dekstopTex;
  } else {
    // array cu aceleași nume exact cum le setezi în state-ul principal
    const names = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'];
    const idx = names.indexOf(monitorImage);
    if (idx >= 0) {
      currentTexture = numberedTextures[idx];
    }
  }

  // 5) Dacă nicio textură nu a fost găsită, nu afișa nimic
  if (!currentTexture) return null;

  return (
    <mesh position={[9.49, 3.2, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[5, 3]} />
      <meshStandardMaterial
        map={currentTexture}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}


// =============================
// BOARD MODEL - PUS PE MASA2
// =============================
function BoardModel({ onLCDClick, onComplete, onShowComponent, lcdRef }) {
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
        position={[0, 2.6, -11]}
        scale={[0.025, 0.025, 0.025]}
        rotation={[3.15, 0, 3.15]}
      />




      {/* Potentiometru */}
      <mesh
        position={[-1.7, 2.4, -11.5]}
        rotation={[3, 0, 0]}
        scale={[0.7, 0.7, 1]}
        onClick={(e) => { e.stopPropagation(); onShowComponent('/Imagini/potentiometer.png'); }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* US */}
      <mesh
        position={[-1.3, 1.2, -11.5]}
        rotation={[3, 0, 0]}
        scale={[1.3, 0.7, 1]}
        onClick={(e) => { e.stopPropagation(); onShowComponent('/Imagini/US.png'); }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Arduino */}
      <mesh
        position={[0.5, 1.6, -11.5]}
        rotation={[3, 0, 0]}
        scale={[1.5, 1.8, 1]}
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onShowComponent('/Imagini/arduino_board.png'); 
                    onComplete?.(3); 
                  }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* LCD */}
      <mesh
      ref={lcdRef}
        position={[0, 3, -11.5]}
        rotation={[3, 0, 0]}
        scale={[2, 1, 1]}
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
        position={[-0.58, 2, -11.5]}
        rotation={[3, 0, 0]}
        scale={[0.3, 0.3, 1]}
        onClick={(e) => { 
                    e.stopPropagation(); 
                    onShowComponent('/Imagini/led.jpg'); 
                    onComplete?.(4); 
                  }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Nano */}
      <mesh
        position={[-1.5, 4.3, -11.5]}
        rotation={[3, 0, 0]}
        scale={[1, 0.5, 1]}
        onClick={(e) => { e.stopPropagation(); onShowComponent('/Imagini/nano.png'); }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Joystick */}
      <mesh
        position={[-0.25, 4.3, -11.5]}
        rotation={[3, 0, 0]}
        scale={[1, 2, 1]}
        onClick={(e) => { e.stopPropagation(); onShowComponent('/Imagini/Joystick.png'); }}
      >
        <planeGeometry args={[1, 0.5]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* ESP32 */}
      <mesh
        position={[1, 4.2, -11.5]}
        rotation={[3, 0, 0]}
        scale={[1, 1, 1]}
        onClick={(e) => { e.stopPropagation(); onShowComponent('/Imagini/ESP32.jpg'); }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* 7 Segment */}
      <mesh
        position={[2, 4, -11.5]}
        rotation={[3, 0, 0]}
        scale={[0.5, 0.5, 0.5]}
        onClick={(e) => { e.stopPropagation(); onShowComponent('/Imagini/7-segment.png'); }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* LED */}
      <mesh
        position={[2, 3, -11.5]}
        rotation={[3, 0, 0]}
        scale={[0.5, 0.5, 0.5]}
        onClick={(e) => { e.stopPropagation(); onShowComponent('/Imagini/led.jpg'); }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Servomotor */}
      <mesh
        position={[1.8, 1.6, -11.5]}
        rotation={[3, 0, 0]}
        scale={[1, 1, 1]}
        onClick={(e) => { e.stopPropagation(); onShowComponent('/Imagini/electromotor.jpg'); }}
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
const Room = ({ characterRef, monitorImage, handleComputerClick, handleRedClick, setFreeCamera, completeTask, openJobSimulator,handleBuzzerClick, handleShowDiagram, onShowComponent, lcdRef, onOpenIotQuiz}) => {

  // State pentru a ține imaginea componentei care trebuie afișată în overlay
const logoTexture = useLoader(TextureLoader, '/Imagini/logo-upb.png');
// 3) textura pentru tavan
const ceilingTexture = useLoader(TextureLoader, '/Imagini/Blue_wall.jpg');
ceilingTexture.wrapS = RepeatWrapping;
ceilingTexture.wrapT = RepeatWrapping;
ceilingTexture.repeat.set(4, 4); 
// ───── Încarcă și configurează textura pentru pereți ─────
const wallTexture = useLoader(TextureLoader, '/Imagini/Walls_texture.jpg');
wallTexture.wrapS = RepeatWrapping;
wallTexture.wrapT = RepeatWrapping;
// Ajustează numărul de repetări pe fiecare pereți (de ex. 4×2)
wallTexture.repeat.set(4, 2);


const parquetTexture = useLoader(TextureLoader, '/Imagini/2145.jpg');
parquetTexture.wrapS = RepeatWrapping;
parquetTexture.wrapT = RepeatWrapping;
// Alege câte repetări (de exemplu 10×10)
parquetTexture.repeat.set(10, 10);
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
    
    
     {/** PLACĂM RAFTURILE în faţa acestui perete, câte unul la stânga și unul la dreapta **/}
     {/* Colţ stânga: x ≈ −9.5, z puţin mai mare ca −10 (ex: −9.4), pentru a nu „clip” pe perete */}
    
      {/** Raftul din colț STÂNGA (orientat către interior) */}
      <V2BookShelfModel
        position={[-7, 0, -9]}
        rotation={[0, Math.PI / 2, 0]}   // +90° pe axa Y
        scale={[0.049, 0.049, 0.049]}       // aceeași scară pentru ambele
      />

      {/** Raftul din colț DREAPTA (orientat către interior) */}
      <V2BookShelfModel
        position={[7, 0, -9]}
        rotation={[0, Math.PI / 2, 0]}  // −90° pe axa Y
        scale={[0.049, 0.049, 0.049]}       // aceeași scală
      />
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial map={parquetTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 2.5, -10]}>
      <boxGeometry args={[20, 5, 1]} />
      <meshStandardMaterial map={wallTexture} />
      </mesh>

      {/* LEFT WALL => blue */}
      <mesh position={[-10, 2.5, 0]}>
        <boxGeometry args={[1, 5, 20]} />
        <meshStandardMaterial map={wallTexture} />
      </mesh>

      {/* RIGHT WALL */}
      <mesh position={[10, 2.5, 0]}>
        <boxGeometry args={[1, 5, 20]} />
        <meshStandardMaterial map={wallTexture} />
      </mesh>
      <mesh position={[-5.5, 2.5, 10]}>
        <boxGeometry args={[9, 5, 1]} />
        <meshStandardMaterial map={wallTexture} />
      </mesh>
      <mesh position={[5.5, 2.5, 10]}>
        <boxGeometry args={[9, 5, 1]} />
        <meshStandardMaterial map={wallTexture} />
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
        <meshStandardMaterial map={ceilingTexture} side={THREE.DoubleSide} />
      </mesh>

     {/* TABLE 1 */}
<mesh position={[0, 1, -2]}>
  <boxGeometry args={[6, 0.1, 2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
{/* Picioarele pentru TABLE 1 */}
{/* Fiecare picior are înălțimea 1 și o secțiune 0.2×0.2 */}
<mesh position={[  2.9, 0.5,  -2.9 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
<mesh position={[  2.9, 0.5,   -1.1 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
<mesh position={[ -2.9, 0.5,  -2.9 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
<mesh position={[ -2.9, 0.5,   -1.1 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
{/* TABLE 2 */}
<mesh position={[8, 1, 5]}>
  <boxGeometry args={[4, 0.1, 2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
{/* Picioarele pentru TABLE 2 */}
<mesh position={[  9.4, 0.5,  4.1 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
<mesh position={[  9.9, 0.5,  5.9 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
<mesh position={[  6.1, 0.5,  4.1 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
<mesh position={[  6.1, 0.5,  5.9 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>

{/* ============================= */}
{/*      TABLE 3 – plasată unde e personajul, la [0, 1, 0] */}
{/* ============================= */}

{/* 1) Suprafața mesei 3 */}
<mesh position={[0, 1, 5]}>
  <boxGeometry args={[4, 0.1, 2]} />
  <meshStandardMaterial color="#654321" />
</mesh>

{/* 2) Picioarele mesei 3 (blatul are dimensiunea 4×2, deci picioarele stau la ±1.9 pe X și ±0.9 pe Z față de centru) */}
<mesh position={[  1.9, 0.5,  5 + 0.9 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
<mesh position={[  1.9, 0.5,  5 - 0.9 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
<mesh position={[ -1.9, 0.5,  5 + 0.9 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>
<mesh position={[ -1.9, 0.5,  5 - 0.9 ]}>
  <boxGeometry args={[0.2, 1, 0.2]} />
  <meshStandardMaterial color="#654321" />
</mesh>

     {/* Adaugă modelul animat de pointing la [1,0,0] */}
     <PointingModel
  position={[5, 0.2, 3]}
  rotation={[0, 2, 0]}
  scale={[0.012, 0.012, 0.012]}
  onPointerDown={(e) => {
    e.stopPropagation();
    onOpenIotQuiz();          // ← call the prop instead
  }}
/>
  {/* Scaunul, rotit spre masă */}
  <OfficeChair
    position={[8, 0.1, 7]}
    rotation={[0, Math.PI / 2, 0]}
    scale={[0.002, 0.002, 0.002]}
  />
   <OfficeChair
        position={[ 8, 0.1, 3 ]}
        rotation={[ 0, -Math.PI / 1, 0 ]}
        scale={[ 0.002, 0.002, 0.002 ]}
      />

<OfficeChair
        position={[ 0, 0.1,  -4 ]}
        rotation={[ 0, -Math.PI / 1, 0 ]}
        scale={[ 0.002, 0.002, 0.002 ]}
      />


  {/* Omuletul, ridicat cu +0.3 faţă de înainte */}
  <SittingCuteBoy
    position={[8, .2, 6.8]}      // 2.3 în loc de 2.0
    rotation={[0, Math.PI / 1, 0]}  // unghi spre masa
    scale={[0.012, 0.012, 0.012]}
  />

 {/* PAPERS – când apeși pe ele, se apelează handleShowDiagram */}
 <Papers
        position={[7, 1.1, 5.6]}
        rotation={[0, Math.PI / 5, 0]}
        scale={[0.012, 0.012, 0.012]}
        onPointerDown={(e) => {
          e.stopPropagation();
          handleShowDiagram(true);
        }}
      />


      {/* MONITOR */}
      <Monitor monitorImage={monitorImage} />
    
      {/* Computer */}
      <mesh
        position={[2.2, 1.55, -2.1]}
        onPointerDown={e => { e.stopPropagation(); handleComputerClick() }}
      >
        <boxGeometry args={[0.4, 0.8, 0.9]} />
        <meshStandardMaterial color="blue" />
      </mesh>
 {/* Mouse */}
      <mesh
        position={[-1.8, 1.1, -2.3]}
        onPointerDown={e => { e.stopPropagation(); handleRedClick() }}
      >
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
      {/* Zona de măsurare (Multimetru) */}
      <mesh
        position={[-8.0, 1.7, 9]}  // ajustează poziția după caz
        rotation={[0, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          alert("Tensiune măsurată: 3.3V");
          completeTask(5);
        }}
      >
        <boxGeometry args={[0.5, 0.2, 0.2]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* MOUSE (blue) */}
      {/* Teleportare cu personajul (roșu) */}
      <TeleportButton characterRef={characterRef} />

      {/* Teleportare doar a camerei (verde) */}
      <CameraTeleportButton setFreeCamera={setFreeCamera} lcdRef={lcdRef}  />



      {/* POSTER */}
      <mesh position={[0, 4, -9.51]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <Text position={[0.2, 4.5, -9.4]} fontSize={0.5} color="black">
      Electronics Lab
      </Text>
      <Text position={[0, 5.5, -9]} rotation={[0, Math.PI, 0]} fontSize={1} color="yellow">
        Electronics Lab
      </Text>
 {/* LOGO-UPB – plasat la 0.1m în faţa peretelui, sub text */}
    <mesh position={[0, 2.5, -9.4]}>
       <planeGeometry args={[2, 2]} />
       <meshBasicMaterial map={logoTexture} transparent />
     </mesh>
      {/* COMPUTER (OBJ) */}
      <Computer position={[2.2, 1, -2.1]} scale={[0.025, 0.025, 0.025]} rotation={[-Math.PI / 2, 0, Math.PI]} />

 

      {/* SHELVES.OBJ */}
      <ShelvesObj position={[-8, 0, 9]} scale={[0.02, 0.02, 0.02]} rotation={[0, Math.PI, 0]} />

       {/* BoxObj.OBJ */}
       <BoxObj position={[-8, 0.9, 9]} scale={[0.02, 0.02, 0.02]} rotation={[0, Math.PI, 0]} />
      {/* BuzzerFBX */}
      <BuzzerFBX
          position={[8, 1.1, 5.7]}        // poziția relativă în interiorul grupului
          rotation={[0, Math.PI, 0]}  // rotit spre camera sau spre jucător
          scale={[0.001, 0.001, 0.001]}   // ajustează după dimensiunea reală a modelului
          onPointerDown={handleBuzzerClick}
        />

      {/* BOARD MODEL PUS PE MASA2 */}
      <BoardModel
        onLCDClick={() => completeTask(1)}
        onComplete={completeTask}
        onShowComponent={onShowComponent} 
        lcdRef={lcdRef}
      />
      {/* Job Simulator Hotspot */}
      <mesh
        position={[7, 1, 5]}
        onPointerDown={e => {
          e.stopPropagation();
          openJobSimulator();
        }}
      >
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </group>
  );
};

// =============================
// 5. MAIN ENVIRONMENT
// =============================
const handleBuzzerClick = (e) => {
  e.stopPropagation();
  completeTask(7);
  console.log("Buzzer apăsat! Task #7 e complet.");
  // dacă ai vreun sunet de redat:
  // new Audio("/sounds/buzzer.wav").play();
};

const Environment = () => {
  const [componentImage, setComponentImage] = useState(null);
  const navigate = useNavigate();
  const controlsRef = useRef(null);
  
  function ControlsUpdater({ freeCamera }) {
    const { camera } = useThree();
    useFrame(() => {
      if (freeCamera) return; // ✅ Blochează actualizarea target-ului când e în mod liber
      if (controlsRef.current && characterRef.current) {
        controlsRef.current.target.copy(characterRef.current.position);
      }
    });
    return null;
  }

const [iotScore, setIotScore] = useState(null);
  const [jobSimScore, setJobSimScore] = useState(null);
  const [electricalScore, setElectricalScore] = useState(null);
  const [showIotQuiz,      setShowIotQuiz]      = useState(false);
  const [showElectricalQuiz, setShowElectricalQuiz] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const toggleLight = () => setLightOn(prev => !prev);
  const [savedCameraPosition, setSavedCameraPosition] = useState(null);
  // 1) tasks state
  const [tasks, setTasks] = useState([
    { id: 2, description: "Open the PC", completed: false },
    { id: 5, description: "Check the objects from shelf", completed: false },
    { id: 6, description: 'Verify the Electric Panel', completed: false },
    { id: 3, description: "Go to your desk and verify your table", completed: false },
    { id: 1, description: "Examinează Arduino-ul de pe masă", completed: false }
    // … you could add more later
  ]);
  const handleIotQuizComplete = (finalScore) => {
    // Save IoT score and close overlay
    setIotScore(finalScore);
    setShowIotQuiz(false);
    console.log('IoT Quiz score:', finalScore);
  };
  const handleElectricalQuizComplete = (finalScore) => {
    // 1) marchezi task‐ul de quiz ca fiind complet
    completeTask(6);
    // 2) salvezi în state scorul primit
    setElectricalScore(finalScore);
    // 3) închizi overlay‐ul
    setShowElectricalQuiz(false);
    console.log("Scor ElectricQuiz:", finalScore);
  };
  const completeTask = (taskId) => {
    setTasks((prev) =>
      prev.map(t => t.id === taskId ? { ...t, completed: true } : t)
    );
  };
  const handleJobSimComplete = (finalScore) => {
    setShowJobSim(false);
    setJobSimScore(finalScore); // ✅ salvăm scorul JobSimulator
    console.log('JobSimulator scor:', finalScore);
    // Dacă vrem să marcăm un task:
    // completeTask(7);
  };
  const handleQuizComplete = (correct) => {
    if (correct) {
      completeTask(6);
      setShowElectricalQuiz(false);
    }
  };
  // 2) whenever *all* tasks are done, navigate
  // useEffect(() => {
  // if (tasks.every(t => t.completed)) {
  // small delay so the user sees the UI update
  //  setTimeout(() => navigate("/course-recommendations"), 500);
  // }
  // }, [tasks, navigate]);
  
  const [showJobSim, setShowJobSim] = useState(false);

  const [showTutorial, setShowTutorial] = useState(true);
  const keys = useKeyControls();
  const characterRef = useRef();
  const [targetPosition, setTargetPosition] = useState(null);
  const clearTarget = () => setTargetPosition(null);

  // Stare pentru monitor (imagini)
 
  const imageList = [
    '1.jpg',
    '2.jpg',
    '3.jpg',
    '4.jpg',
    '5.jpg'
  ];
  const [imageIndex, setImageIndex] = useState(0);
  const [monitorImage, setMonitorImage] = useState(null);
  // Stare pentru free camera: false = camera urmărește personajul; true = camera e în mod "free"
  const [freeCamera, setFreeCamera] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);
  const lcdRef = useRef();
  const handleBuzzerClick = (e) => {
    e.stopPropagation();
    // Exemplu: marchează task-ul 7 ca și complet
    completeTask(7);
    console.log("Buzzer apăsat! Task #7 e complet.");
    // Dacă ai un fișier audio buzzer.wav, l-ai putea reda astfel:
    // new Audio("/sounds/buzzer.wav").play();
  };
  // Blue button => setează "Dekstopfree.png"
  // buton albastru — setează întotdeauna prima imagine
  const handleComputerClick = () => {
    // setează prima imagine doar când apeși
    setMonitorImage('Dekstopfree.png');
    completeTask(2);
  };

  // buton roșu — a doua imagine
  const handleRedClick = () => {
    // Avansăm indexul ciclic
    setImageIndex(prevIndex => {
      const nextIndex = (prevIndex + 1) % imageList.length;
      // Setăm monitorImage pe baza listei
      setMonitorImage(imageList[nextIndex]);
      return nextIndex;
    });
  };
  if (showTutorial) {
    return <TutorialOverlay onClose={() => setShowTutorial(false)} />;
  }
  const totalScore = (jobSimScore || 0) + (electricalScore || 0);
  return (
    <div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  }}
>
          {/* ─── Aici adăugăm un <div> fixat în colțul stânga-jos pentru afișarea scorurilor ─── */}
          <div
  style={{
    position: "absolute",
    bottom: 10,
    left: 10,
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    fontFamily: "sans-serif",
    zIndex: 1000,
  }}
>
  {/* Afișăm mereu scorurile, chiar și când sunt 0 */}
  <div>🏆 Total Score: <strong>{(jobSimScore || 0) + (electricalScore || 0) + (iotScore || 0)}</strong></div>
  <div>🏢 JobSimulator: <strong>{jobSimScore ?? 0}</strong></div>
  <div>⚡ Electrical Quiz: <strong>{electricalScore ?? 0}</strong></div>
  <div>🌐 IoT Quiz: <strong>{iotScore ?? 0}</strong></div>
</div>
      {/* ────── BUTONUL “Revenire Cameră” ────── */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,        // Butonul verde stă în colțul STÂNGA-SUS
          zIndex: 1000
        }}
      >
        <button
          onClick={() => setFreeCamera(false)}
          style={{
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          Revenire Cameră
        </button>
      </div>
        {/* ────── DROPDOWN-UL “Task-uri” ────── */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,       // Dropdown-ul stă în colțul DREAPTA-SUS
          zIndex: 1000
        }}
      >
        <TaskList tasks={tasks} />
      </div>

      {/* ────── JobSimulator și Quiz ────── */}
      {showJobSim && (
  <JobSimulator
    onClose={() => setShowJobSim(false)}
    onComplete={handleJobSimComplete}
  />
)}

      
      {/* ElectricalQuiz overlay */}
      {showElectricalQuiz && (
        <ElectricalQuiz
          onClose={(score) => handleElectricalQuizComplete(score)}
          onComplete={(score) => handleElectricalQuizComplete(score)}
        />
      )}
    {showIotQuiz && (
  <QuizIOT
    onClose={() => setShowIotQuiz(false)}
    onComplete={handleIotQuizComplete}
  />
)}



      {/* Overlay pentru diagramă (showDiagram) */}
      {showDiagram && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <button
            onClick={() => setShowDiagram(false)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              fontSize: 28,
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              zIndex: 2100,
            }}
          >
            &times;
          </button>
          <img
            src="/Imagini/buzzer_electricaldiagram.jpg"
            alt="Buzzer Electrical Diagram"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
              boxShadow: "0 0 16px rgba(0,0,0,0.5)",
              borderRadius: 8,
            }}
          />
        </div>
      )}
 {componentImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,          // on top of everything
            pointerEvents: 'auto', // allow clicking
          }}
          onClick={() => setComponentImage(null)}
        >
          {/* A large “×” in the corner to close */}
          <button
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              fontSize: 32,
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10000,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setComponentImage(null);
            }}
          >
            &times;
          </button>
          {/* The actual component image */}
          <img
            src={componentImage}
            alt="Component Detail"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              boxShadow: '0 0 24px rgba(0,0,0,0.6)',
              borderRadius: 8,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* ────── CANVAS 3D ────── */}
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
            freeCamera={freeCamera}
          />
          <CameraFollow characterRef={characterRef} freeCamera={freeCamera} />

          <CameraReturnHandler
            characterRef={characterRef}
            freeCamera={freeCamera}
            setFreeCamera={setFreeCamera}
            savedCameraPosition={savedCameraPosition}
          />

          <Ground setTargetPosition={setTargetPosition} />

        {/* ROOM + Panel (panelul înlocuiește butonul “Deschide Quiz”) */}
       <Room
         characterRef={characterRef}
         monitorImage={monitorImage}
         handleComputerClick={handleComputerClick}
         handleRedClick={handleRedClick}
         setFreeCamera={setFreeCamera}
         completeTask={completeTask}
         openJobSimulator={() => setShowJobSim(true)}
         handleShowDiagram={setShowDiagram}
         onShowComponent={setComponentImage}
         lcdRef={lcdRef} 
         onOpenIotQuiz={() => setShowIotQuiz(true)}
       />

       {/* Plasăm Panel în scenă, cu onClick ce deschide quiz */}
       <Panel
         position={[-9.4, 0, 0]}
         onClick={() => setShowElectricalQuiz(true)}
       />

          <ElectricPanel lightOn={lightOn} toggleLight={toggleLight} />
          <ProjectorScreen monitorImage={monitorImage} />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableRotate
            enableZoom
            minDistance={5}
            maxDistance={50}
            minPolarAngle={Math.PI * 0.17}
            maxPolarAngle={Math.PI * 0.44}
            onStart={() => setFreeCamera(true)}
            onEnd={() => {}}
          />
          <KeyboardTeleport
            controlsRef={controlsRef}
            setFreeCamera={setFreeCamera}
            setSavedCameraPosition={setSavedCameraPosition}
          />
          <ControlsUpdater />
          <CameraBoundaryEnforcer freeCamera={freeCamera} />
        </XR>
      </Canvas>
    </div>
  );
};

export default Environment;