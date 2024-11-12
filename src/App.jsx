import React, { useEffect, useState } from "react";
import SkillForm from "./components/SkillForm";
import { fetchSkills, fetchJobs } from "./utils/skills";

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
  
    // Transformăm toate skill-urile în litere mici și eliminăm spațiile pentru comparație
    const normalizedSelectedSkills = selectedSkills.map(skill => skill.toLowerCase().trim());
    console.log("Skill-uri selectate (normalizate):", normalizedSelectedSkills);
  
    const matchingJobs = jobs
      .map((job) => {
        const jobSkills = job.skills.map(skill => skill.toLowerCase().trim());
        const matchingSkills = jobSkills.filter((skill) => normalizedSelectedSkills.includes(skill));
        const score = matchingSkills.length / normalizedSelectedSkills.length;
        
        console.log(`Job: ${job.title}, Domeniu: ${job.industry}, Matching Skills:`, matchingSkills, `Score: ${score}`);
  
        return { ...job, score };
      })
      .filter((job) => job.score >= 0.4) // Setăm un prag de 40% pentru afișare
      .sort((a, b) => b.score - a.score);
  
    const groupedJobs = matchingJobs.reduce((acc, job) => {
      const industry = job.industry;
      if (industry === "Altele") return acc; // Omitem categoria "Altele"
      if (!acc[industry]) acc[industry] = [];
      acc[industry].push(job);
      return acc;
    }, {});
  
    console.log("Joburi recomandate grupate:", groupedJobs);
  
    setRecommendedJobs(groupedJobs);
  };
  
  
  

  return (
    <div>
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
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>Nicio experiență disponibilă pentru skill-urile selectate.</p>
      )}
    </div>
  );
};

export default App;
