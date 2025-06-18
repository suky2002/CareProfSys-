import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';

function JobIntroPortalContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const matchScore = location.state?.matchScore ?? null;
  const isMatch = matchScore !== null && matchScore >= 60;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 -translate-y-[10%] px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-extrabold mb-8 text-center tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
        >
          Welcome to the Career Portal
        </motion.h1>

        {matchScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-2xl font-medium text-white mb-2">
              Matching Score: <span className="text-yellow-400 font-bold">{matchScore}%</span>
            </p>
            <p className={`text-xl ${isMatch ? 'text-green-400' : 'text-orange-400'}`}>
              {isMatch
                ? "Great match! You're ready to dive into this role."
                : "This role might be challenging, but you're welcome to explore it."}
            </p>
          </motion.div>
        )}

        {matchScore === null && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl md:text-2xl mb-12 text-center text-white opacity-90 max-w-3xl leading-relaxed"
          >
            One of the roles is open for exploration today. Step through the portal to begin.
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-7xl px-4"
        >
          <div
            className={`relative p-10 rounded-3xl transition-all duration-300 text-center border min-h-[320px] flex flex-col justify-between transform hover:scale-105 bg-gradient-to-br from-indigo-600/80 to-purple-700/80 shadow-2xl hover:shadow-purple-900/50 border-purple-500 cursor-pointer backdrop-blur-sm`}
            onClick={() => navigate('/level1')}
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Broadcasting Engineer</h2>
            <p className="text-white text-opacity-90 text-lg">
              {isMatch ? "Start your immersive challenge" : "Explore this experience and learn more"}
            </p>
          </div>

          <div
            className="relative p-10 rounded-3xl transition-all duration-300 text-center border min-h-[320px] flex flex-col justify-between transform hover:scale-105 bg-gradient-to-br from-indigo-600/80 to-purple-700/80 shadow-2xl hover:shadow-purple-900/50 border-purple-500 cursor-pointer backdrop-blur-sm"
            onClick={() => navigate('/sound-tech')}
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Sound Technician</h2>
            <p className="text-white text-opacity-90 text-lg">
              Explore the new studio and take on the Sound Technician role!
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-10 rounded-3xl shadow-inner opacity-40 cursor-not-allowed text-center border border-gray-700 min-h-[320px] flex flex-col justify-between">
            <h2 className="text-4xl font-bold mb-4 text-white">Media AI Strategist</h2>
            <p className="text-lg text-white/60">Coming soon</p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300"
        >
          More professions will be unlocked as the platform evolves
        </motion.p>
      </div>
    </div>
  );
}

export default JobIntroPortalContent;