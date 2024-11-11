import React, { useState } from 'react';

import SkillForm from './components/SkillForm';

const predefinedJobs = [
  { title: 'Software Developer', skills: ['JavaScript', 'React', 'Problem Solving', 'Git'] },
  { title: 'Data Analyst', skills: ['SQL', 'Data Analysis', 'Python', 'Excel'] },
];

function App() {
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  const handleRecommendation = (selectedSkills) => {
    console.log("Skilluri selectate:", selectedSkills);

    const matchingJobs = predefinedJobs.filter(job => {
      const matchingSkills = job.skills.filter(skill => selectedSkills.includes(skill));
      console.log(`Verificare pentru ${job.title}:`, matchingSkills);
      return matchingSkills.length >= 3;
    });

    console.log("Meserii recomandate:", matchingJobs);
    setRecommendedJobs(matchingJobs);
  };

  return (
    <div>
      <h1>Recomandări VR</h1>
      <SkillForm onRecommend={handleRecommendation} />
      <h2>Recomandări VR</h2>
      {recommendedJobs.length > 0 ? (
        <ul>
          {recommendedJobs.map((job, index) => (
            <li key={index}>{job.title}</li>
          ))}
        </ul>
      ) : (
        <p>Nicio experiență disponibilă pentru skill-urile selectate.</p>
      )}
    </div>
  );
}

export default App;
