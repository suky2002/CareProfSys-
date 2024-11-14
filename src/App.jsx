import React, { useEffect, useState } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { fetchJobs, fetchSkills } from "./utils/skills";

import EnvironmentTwoScene from './components/EnvironmentTwoScene'; // New environment
import ProfessionVRScene from "./components/ProfessionVRScene";
import SkillForm from "./components/SkillForm";

const App = () => {
  const [skills, setSkills] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchSkills().then((data) => {
      console.log("Skill-uri încărcate:", data);
      setSkills(data);
    });
    fetchJobs().then((data) => {
      console.log("Joburi încărcate din CSV:", data);
      setJobs(data);
    });
  }, []);

  const handleRecommendation = (selectedSkills) => {
    if (selectedSkills.length < 2 || selectedSkills.length > 10) {
      alert("Te rugăm să selectezi între 2 și 10 skill-uri.");
      return;
    }

    const normalizedSelectedSkills = selectedSkills.map(skill => skill.toLowerCase().trim());
    const matchingJobs = jobs
      .map((job) => {
        const jobSkills = job.skills.map(skill => skill.toLowerCase().trim());
        const matchingSkills = jobSkills.filter((skill) => normalizedSelectedSkills.includes(skill));
        const score = matchingSkills.length / normalizedSelectedSkills.length;
        return { ...job, score };
      })
      .filter((job) => job.score >= 0.4)
      .sort((a, b) => b.score - a.score);

    const groupedJobs = matchingJobs.reduce((acc, job) => {
      const industry = job.industry;
      if (industry === "Altele") return acc;
      if (!acc[industry]) acc[industry] = [];
      acc[industry].push(job);
      return acc;
    }, {});

    setRecommendedJobs(groupedJobs);
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1>Selectează între 2 și 10 skill-uri</h1>
                <SkillForm skills={skills} onRecommend={handleRecommendation} />
                <h2>Recomandări VR</h2>
                {Object.keys(recommendedJobs).length > 0 ? (
                  Object.keys(recommendedJobs).map((industry, index) => (
                    <div key={index}>
                      <h3>{industry}</h3>
                      <ul>
                        {recommendedJobs[industry].map((job, idx) => (
                          <li key={idx}>
                            {job.title} - Scor: {(job.score * 100).toFixed(0)}%
                            <Link to="/vr" style={{ marginLeft: "10px" }}>Explorează în VR</Link>
                            <Link to="/">Profession VR Scene</Link>
                            <Link to="/environment-two">Environment Two</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>Nicio experiență disponibilă pentru skill-urile selectate.</p>
                )}
              </>
            }
          />
          <Route path="/vr" element={<ProfessionVRScene />}/>
          <Route path="/environment-two" element={<EnvironmentTwoScene />} /> {/* New Route */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
