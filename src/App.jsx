import React, { useEffect, useState } from "react";

import SkillForm from "./components/SkillForm";
import { fetchSkills } from "./utils/skills.jsx";

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
    // Încarcă skillurile din CSV la montarea componentului
    fetchSkills().then((data) => setSkills(data));
  }, []);

  const handleRecommendation = (selectedSkills) => {
    // Curățare pentru a elimina caracterele suplimentare
    const cleanedSelectedSkills = selectedSkills.map(skill => skill.replace(/['"]/g, "").trim());

    const matchingJobs = predefinedJobs
      .map(job => {
        // Calculăm scorul pe baza numărului de skilluri comune
        const matchingSkills = job.skills.filter(skill => cleanedSelectedSkills.includes(skill));
        const score = matchingSkills.length;
        
        return { ...job, score };
      })
      // Filtrăm meseriile care au cel puțin 3 skilluri potrivite
      .filter(job => job.score >= 3)
      // Sortăm descrescător după scor
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
              {job.title} - Scor: {job.score}
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
