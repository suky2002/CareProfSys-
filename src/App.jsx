import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import StartScreen from "./components/StartScreen";
import CreateAvatar from "./components/CreateAvatar";
import JobPortal from "./components/JobIntroPortalContent";
import EnvironmentThreeScene from "./components/EnvironmentThreeScene";
import CourseRecommendations from "./components/CourseRecommendations";
import JobIntroPortalContent from "./components/JobIntroPortalContent";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/create-avatar" element={<CreateAvatar />} />
        <Route path="/job-portal" element={<JobIntroPortalContent />} />
        <Route path="/env3" element={<EnvironmentThreeScene />} />
        <Route path="/course-recommendations" element={<CourseRecommendations recommendedCourses={[
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
        ]} />} />
      </Routes>
    </Router>
  );
};

export default App;