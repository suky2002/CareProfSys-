import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import StartScreen from "./components/StartScreen";
import CreateAvatar from "./components/CreateAvatar";
import JobPortal from "./components/JobPortal";
import EnvironmentThreeScene from "./components/EnvironmentThreeScene";
import CourseRecommendations from "./components/CourseRecommendations";
import SoundManager from "./components/SoundManager";
import Level1 from "./scenes/Level1";
import QuizLevel from "./scenes/QuizLevel";
import QuizResults from "./components/QuizResults";
import { Result } from "postcss";
import ResultsScreen from "./components/ResultsScreen";
import FixSignal from "./scenes/FixSignal";

const soundPages = ["/", "/create-avatar", "/job-portal"];

const AppContent = () => {
  const location = useLocation();
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem("volume");
    return stored ? parseFloat(stored) : 0.5;
  });

  useEffect(() => {
    localStorage.setItem("volume", volume);
  }, [volume]);

  const shouldPlaySound = soundPages.includes(location.pathname);

  return (
    <>
      {shouldPlaySound && <SoundManager volume={volume} />}
      <Routes>
        <Route path="/" element={<StartScreen volume={volume} setVolume={setVolume} />} />
        <Route path="/create-avatar" element={<CreateAvatar volume={volume} setVolume={setVolume} />} />
        <Route path="/job-portal" element={<JobPortal volume={volume} setVolume={setVolume} />} />
        <Route path="/level1" element={<Level1 />} />
        <Route path="/quiz" element={<QuizLevel />} />
        <Route path="/quiz-results" element={<QuizResults />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/level2" element={<FixSignal />} />
        {/* <Route path="/env3" element={<EnvironmentThreeScene />} /> */}
        <Route
          path="/course-recommendations"
          element={
            <CourseRecommendations
              recommendedCourses={[
                {
                  name: "Politehnica University of Bucharest",
                  description: "Specialization courses in IT and Engineering.",
                  link: "https://www.upb.ro/",
                },
                {
                  name: "Academy of Economic Studies Bucharest",
                  description: "Courses in economics and management.",
                  link: "https://www.ase.ro/",
                },
              ]}
            />
          }
        />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;