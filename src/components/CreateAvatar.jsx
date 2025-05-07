import React, { useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { motion } from "framer-motion";

const HumanHeadset = () => {
  const materials = useLoader(MTLLoader, "/models/humanheadset/humanheadset.mtl");
  const obj = useLoader(OBJLoader, "/models/humanheadset/humanheadset.obj", (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });
  return <primitive object={obj} scale={1.5} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]} />;
};

const RotatingAvatar = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} className="w-full h-full">
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <spotLight position={[0, 5, 0]} intensity={0.5} />
      <OrbitControls 
        enableZoom={false} 
        autoRotate 
        autoRotateSpeed={2}
        enablePan={false}
      />
      <Suspense fallback={null}>
        <HumanHeadset />
      </Suspense>
    </Canvas>
  );
};

const CreateAvatar = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleUpload = async () => {
    if (!name || !age) {
      setMsg("Please fill in all fields");
      return;
    }

    if (!file) {
      setMsg("Please select a .docx CV");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("cv", file);
    formData.append("name", name);
    formData.append("age", age);

    try {
      const response = await fetch("http://localhost:3001/trigger", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to upload");
      }

      navigate("/job-portal", { state: { matchScore: 87 } });
    } catch (error) {
      console.error(error);
      setMsg("❌ " + (error.message || "Upload failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
      
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full max-h-screen">
            <RotatingAvatar />
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
            >
              Create Your Career Profile
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center text-gray-400 mb-8"
            >
              Add your basic info and upload your CV to personalize your experience
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Your Name"
                className="px-4 py-3 text-lg w-full rounded-xl bg-gray-800/50 text-white placeholder-gray-400 backdrop-blur-sm border border-gray-700 focus:border-purple-500 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="number"
                placeholder="Your Age"
                className="px-4 py-3 text-lg w-full rounded-xl bg-gray-800/50 text-white placeholder-gray-400 backdrop-blur-sm border border-gray-700 focus:border-purple-500 focus:outline-none"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="16"
                max="100"
              />

              <label className="w-full flex flex-col items-center p-8 bg-gray-800/50 text-white rounded-xl backdrop-blur-sm border border-dashed border-gray-600 cursor-pointer hover:bg-gray-700/50 transition-all duration-300">
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-2">📄</span>
                  <span className="text-base">Upload your .docx CV</span>
                  <span className="text-sm text-gray-400 mt-2">
                    {file ? file.name : "No file selected"}
                  </span>
                </div>
                <input
                  type="file"
                  accept=".docx"
                  className="hidden"
                  onChange={(e) => e.target.files.length && setFile(e.target.files[0])}
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 w-full py-3 text-lg rounded-xl text-white font-semibold disabled:opacity-50 transition-all duration-300"
              >
                {loading ? "Processing..." : "Submit"}
              </button>

              {msg && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-yellow-400 text-center mt-2"
                >
                  {msg}
                </motion.p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAvatar;