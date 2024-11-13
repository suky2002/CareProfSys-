import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import React, { useEffect, useState } from "react";

import ProfessionVRScene from './components/ProfessionVRScene.jsx'; // Import the VR Scene
import SkillForm from './components/SkillForm.jsx';
import { fetchSkillsAndJobs } from './utils/skills'; // Ensure correct import

const App = () => {
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  useEffect(() => {
    // Load skills and jobs from CSV when the component mounts
    fetchSkillsAndJobs().then(({ skills, jobs }) => {
      setSkills(skills);
      setJobs(jobs);
    });
  }, []);

  const handleRecommendation = (selectedSkills) => {
    console.log("Loaded jobs: ", jobs);
    console.log("Selected skills: ", selectedSkills);

    if (!jobs || jobs.length === 0) {
      console.error("No jobs found for recommendation.");
      setRecommendedJobs([]);
      return;
    }

    const cleanedSelectedSkills = selectedSkills.map(skill => skill.replace(/['"]/g, "").trim());
    console.log("Cleaned skills: ", cleanedSelectedSkills);

    const matchingJobs = jobs
      .map(job => {
        if (!job.requiredSkills) {
          console.error(`Job ${job.title} does not have defined skills.`);
          return null;
        }

        // Calculate score based on the number of matching skills
        const matchingSkills = job.requiredSkills.filter(skill => cleanedSelectedSkills.includes(skill));
        const score = matchingSkills.length;
        return { ...job, score };
      })
      .filter(job => job && job.score >= 3) // Filter out jobs with low scores or undefined skills
      .sort((a, b) => b.score - a.score); // Sort jobs by score

    console.log("Recommended jobs: ", matchingJobs);

    setRecommendedJobs(matchingJobs);
  };

  return (
    <Router>
      <nav>
        <Link to="/">Skill Selector</Link> | <Link to="/vr">VR Experience</Link>
      </nav>

      <Routes>
        {/* Skill Selector and Recommendations Route */}
        <Route path="/" element={
          <div>
            <h1>Selectează până la 5 skill-uri</h1>
            <SkillForm skills={skills} onRecommend={handleRecommendation} />
            
            <h2>Recomandări VR</h2>
            {recommendedJobs.length > 0 ? (
              <ul>
                {recommendedJobs.map((job, index) => (
                  <li key={index}>
                    {job.title} - Scor: {job.score}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nicio experiență disponibilă pentru skill-urile selectate.</p>
            )}
          </div>
        } />

        {/* VR Experience Route */}
        <Route path="/vr" element={<ProfessionVRScene />} />
      </Routes>
    </Router>
  );
};

export default App;
