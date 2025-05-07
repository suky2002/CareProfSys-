import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useSound from 'use-sound'
import './css/StartScreen.css'

export default function StartScreen() {
  const [started, setStarted] = useState(false)
  // Get initial sound state from localStorage or default to true
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled')
    return saved ? JSON.parse(saved) : true
  })
  
  const [play, { stop }] = useSound('/audio/intro.mpeg', {
    volume: 0.5,
    loop: true,
    interrupt: true,
  })

  // Save sound preference when it changes
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled))
    if (soundEnabled) {
      play()
    } else {
      stop()
    }
    return () => stop()
  }, [soundEnabled, play, stop])

  if (started) return null

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <Canvas className="!fixed inset-0" camera={{ position: [0, 0, 5] }}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
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
          onClick={() => {
            stop()
            setStarted(true)
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="mt-8 px-6 py-3 bg-white text-black font-semibold rounded-2xl shadow-lg hover:bg-gray-200"
        >
          ENTER THE WORLD
        </motion.button>

        <motion.span
          onClick={() => {
            if (soundEnabled) {
              stop()
            } else {
              play()
            }
            setSoundEnabled(!soundEnabled)
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="absolute bottom-8 text-white cursor-pointer hover:opacity-100 transition-opacity"
        >
          {soundEnabled ? 'Mute Music' : 'Play Music'}
        </motion.span>
      </div>
    </div>
  )
}