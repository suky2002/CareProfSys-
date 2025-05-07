import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VolumeSlider from './VolumeSlider';
import "./css/StartScreen.css";


function ShootingStar() {
  const ref = useRef();
  const [x, setX] = useState(5);
  const [y, setY] = useState(5);
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    if (ref.current) {
      const speed = 0.04;
      ref.current.position.x -= speed;
      ref.current.position.y -= speed;
      setOpacity((prev) => Math.max(0, prev - 0.01));
      if (ref.current.position.x < -5) {
        ref.current.position.set(5, 3, -1);
        setOpacity(1);
      }
    }
  });

  return (
    <mesh ref={ref} position={[x, y, 0]}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color="white" transparent opacity={opacity} />
    </mesh>
  );
}

export default function StartScreen({ volume, setVolume }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <Canvas className="!fixed inset-0" camera={{ position: [0, 0, 5] }}>
        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={3} />
        <ShootingStar />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>

      <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-[10%]">
        <motion.img
          src="/Imagini/logo.png"
          alt="CareProfSys++ Logo"
          className="w-80 h-auto mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        />

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold text-white text-center"
        >
          Welcome to CareProfSys++
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7 }}
          className="mt-4 text-lg md:text-xl max-w-xl text-white text-center px-4"
        >
          Career Profiler for Media & Broadcasting Engineering, where your vocation becomes exploration.
        </motion.p>

        <motion.button
          onClick={() => navigate('/create-avatar')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="mt-8 px-6 py-3 bg-white text-black font-semibold rounded-2xl shadow-lg hover:bg-gray-200"
        >
          ENTER THE WORLD
        </motion.button>

        <div className="absolute bottom-6 w-full flex justify-center">
          <VolumeSlider volume={volume} setVolume={setVolume} />
        </div>
      </div>
    </div>
  );
}