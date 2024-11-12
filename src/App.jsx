import React, { useEffect, useState } from "react";

import SkillForm from './components/SkillForm';
import { fetchSkillsAndJobs } from './utils/skills'; // Asigură-te că ai importat corect funcția

const App = () => {
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  
  useEffect(() => {
    // Încarcă skillurile și joburile din CSV la montarea componentei
    fetchSkillsAndJobs().then(({ skills, jobs }) => {
      setSkills(skills);
      setJobs(jobs);
    });
  }, []);

  const handleRecommendation = (selectedSkills) => {
    console.log("Joburi încărcate: ", jobs);
    console.log("Skilluri selectate: ", selectedSkills);

    if (!jobs || jobs.length === 0) {
      console.error("Nu s-au găsit joburi pentru recomandare.");
      setRecommendedJobs([]);
      return;
    }

    const cleanedSelectedSkills = selectedSkills.map(skill => skill.replace(/['"]/g, "").trim());
    console.log("Skilluri curățate: ", cleanedSelectedSkills);

    const matchingJobs = jobs
      .map(job => {
        if (!job.requiredSkills) {
          console.error(`Job-ul ${job.title} nu are skilluri definite.`);
          return null;
        }

        // Calculăm scorul pe baza numărului de skilluri comune
        const matchingSkills = job.requiredSkills.filter(skill => cleanedSelectedSkills.includes(skill));
        const score = matchingSkills.length;
        return { ...job, score };
      })
      .filter(job => job && job.score >= 3) // Eliminăm job-urile fără skilluri și cele cu scor mic
      .sort((a, b) => b.score - a.score); // Sortăm joburile în funcție de scor

    console.log("Joburi recomandate: ", matchingJobs);

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
