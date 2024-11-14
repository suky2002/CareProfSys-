// EnvironmentTwo.jsx
import * as THREE from 'three';

import { Plane, Sky } from '@react-three/drei';
import React, { useRef } from 'react';

const EnvironmentTwo = () => {
  const walls = useRef([]);

  // Define wall material and dimensions
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 'blue' });
  const wallHeight = 3;
  const wallWidth = 20;

  return (
    <>
      <ambientLight intensity={0.6} />
      <Sky sunPosition={[100, 20, 100]} />
      <Plane rotation={[-Math.PI / 2, 0, 0]} args={[100, 100]} receiveShadow>
        <meshStandardMaterial color="#b0e0e6" /> {/* Light blue ground */}
      </Plane>

      {/* Example wall layout */}
      <mesh ref={(el) => walls.current.push(el)} position={[-wallWidth / 2, wallHeight / 2, 0]} material={wallMaterial}>
        <boxGeometry args={[1, wallHeight, wallWidth]} />
      </mesh>
      <mesh ref={(el) => walls.current.push(el)} position={[wallWidth / 2, wallHeight / 2, 0]} material={wallMaterial}>
        <boxGeometry args={[1, wallHeight, wallWidth]} />
      </mesh>
      <mesh ref={(el) => walls.current.push(el)} position={[0, wallHeight / 2, -wallWidth / 2]} material={wallMaterial}>
        <boxGeometry args={[wallWidth, wallHeight, 1]} />
      </mesh>
      <mesh ref={(el) => walls.current.push(el)} position={[0, wallHeight / 2, wallWidth / 2]} material={wallMaterial}>
        <boxGeometry args={[wallWidth, wallHeight, 1]} />
      </mesh>
    </>
  );
};

export default EnvironmentTwo;
