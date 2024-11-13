import { Box, OrbitControls, Plane, Sky } from '@react-three/drei';

import { Canvas } from '@react-three/fiber';
import React from 'react';
// ProfessionVRScene.jsx
import { XR } from '@react-three/xr';

const ProfessionVRScene = () => {
  const enterVR = () => {
    if (navigator.xr) {
      navigator.xr.requestSession('immersive-vr').then((session) => {
        // Handle VR session initiation here
      });
    } else {
      alert('WebXR not supported');
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button onClick={enterVR}>Enter VR</button>
      <Canvas>
        <XR>
          <Sky />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          {/* Ground */}
          <Plane rotation={[-Math.PI / 2, 0, 0]} args={[100, 100]} receiveShadow>
            <meshStandardMaterial color="lightblue" />
          </Plane>

          {/* Placeholder for Profession Elements */}
          <Box position={[0, 1, 0]} args={[1, 1, 1]}>
            <meshStandardMaterial color="orange" />
          </Box>

          {/* Allow camera controls in Web mode */}
          <OrbitControls />
        </XR>
      </Canvas>
    </div>
  );
};

export default ProfessionVRScene;
