import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Canvas } from "@react-three/fiber";
import ModelViewer from "./ModelViewer";
import { OrbitControls } from "@react-three/drei";

export default function InfoPopup({ show, onClose, hotspot }) {
  const [modelPath, setModelPath] = useState(null);

  useEffect(() => {
    if (show && hotspot?.model) {
      setModelPath(hotspot.model);
    }
  }, [show, hotspot]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 z-50 flex flex-col md:flex-row w-[900px] max-w-[95vw]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* LEFT: 3D Model */}
          <div className="w-full md:w-1/2 h-[350px] md:h-auto bg-gray-100 flex items-center justify-center">
            <Canvas camera={{ position: [0, 0, 2] }}>
              <ambientLight />
              <directionalLight position={[1, 1, 1]} />
              {modelPath && <ModelViewer modelPath={modelPath} />}
              <OrbitControls enableZoom />
            </Canvas>
          </div>

          {/* RIGHT: Info */}
          <div className="w-full md:w-1/2 p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{hotspot?.label}</h2>
                <button onClick={onClose} className="text-red-600 text-2xl">✕</button>
              </div>
              <p className="mt-2 text-gray-600 whitespace-pre-line">{hotspot?.description}</p>
            </div>
            <p className="mt-6 text-xs text-gray-500 text-center">
              Rotate model with mouse, touch or controller
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
