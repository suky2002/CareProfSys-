import React from 'react';
import * as THREE from 'three';

function ElectricPanel({ lightOn, toggleLight }) {
  return (
    <group position={[-8, 1, -8]}>

      <mesh onClick={toggleLight}>
        <boxGeometry args={[1, 2, 0.2]} />
        <meshStandardMaterial color={lightOn ? 'yellow' : 'gray'} />
      </mesh>

      <mesh position={[0, 1.2, 0.15]}>
        <sphereGeometry args={[.1, 16, 16]} />
        <meshStandardMaterial color={lightOn ? 'lime' : 'black'} emissive={lightOn ? 'lime' : 'black'} />
      </mesh>

      <Text position={[0, -1.2, 0.15]} fontSize={0.2} color="white">
        {lightOn ? 'ON' : 'OFF'}
      </Text>
    </group>
  );
}

export default ElectricPanel;
