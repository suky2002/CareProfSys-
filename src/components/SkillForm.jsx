// SkillForm.jsx
import React, { useEffect, useState } from 'react';

import { fetchSkills } from '../utils/skills'; // Asigură-te că ai actualizat calea

function SkillForm({ onRecommend }) {
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    // Fetch skills and set them in state
    fetchSkills().then((skillList) => {
      setSkills(skillList);
    });
  }, []);

  const handleSkillChange = (event) => {
    const value = event.target.value;
    setSelectedSkills((prev) => {
      if (prev.includes(value)) {
        return prev.filter((skill) => skill !== value);
      } else if (prev.length < 5) {
        return [...prev, value];
      }
      return prev;
    });
  };

  const handleRecommendation = () => {
    onRecommend(selectedSkills);
  };

  return (
    <div>
      <h2>Selectează până la 5 skill-uri</h2>
      <select onChange={handleSkillChange} value="">
        <option value="" disabled>Selectează un skill</option>
        {skills.map((skill, index) => (
          <option key={index} value={skill}>
            {skill}
          </option>
        ))}
      </select>
      <button onClick={handleRecommendation}>Recomandă Experiențe VR</button>
    </div>
  );
}

export default SkillForm;
