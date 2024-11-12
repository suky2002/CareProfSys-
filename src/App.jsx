import React, { useEffect, useState } from "react";

import SkillForm from "./components/SkillForm";
import { fetchSkills } from "./utils/skills";

const App = () => {
  const [skills, setSkills] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  // Meserii prestabilite cu skilluri asociate
  const predefinedJobs = [
    {
      title: "Software Developer",
      skills: ["Problem Solving", "Java", "SQL", "Data Analysis", "Communication"],
    },
    {
      title: "Data Analyst",
      
      skills: ["Data Analysis", "SQL", "Communication", "Forecasting Demand", "Financial Reporting"],
    },
  ];

  useEffect(() => {
    fetchSkills().then((data) => setSkills(data));
  }, []);

  const handleRecommendation = (selectedSkills) => {
    const matchingJobs = predefinedJobs
      .map(job => {
        const matchingSkills = job.skills.filter(skill => selectedSkills.includes(skill));
        const score = matchingSkills.length / selectedSkills.length;
        return { ...job, score };
      })
      .filter(job => job.score >= 0.6) // Recomandă joburile cu scor peste 60%
      .sort((a, b) => b.score - a.score);

    setRecommendedJobs(matchingJobs);
  };

  return (
    <div>
      <h1>Selectează până la 5 skill-uri</h1>
      <SkillForm skills={skills} onRecommend={handleRecommendation} />
      <h2>Recomandări VR</h2>
      {recommendedJobs.length > 0 ? (
        <ul>
          {recommendedJobs.map((job, index) => (
            <li key={index}>
              {job.title} - Scor: {(job.score * 100).toFixed(0)}%
            </li>
          ))}
        </ul>
      ) : (
        <p>Nicio experiență disponibilă pentru skill-urile selectate.</p>
      )}
    </div>
  );
};

export default App;
