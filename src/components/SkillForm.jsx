import React, { useEffect, useState } from 'react';

import { fetchSkills } from '../utils/skills';

export default function SkillForm({ onRecommend }) {
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const maxSkills = 5;

  useEffect(() => {
    async function getSkills() {
      const skillsList = await fetchSkills();
      setSkills(skillsList);
    }
    getSkills();
  }, []);

  const handleSkillChange = (event) => {
    const skill = event.target.value;
    const isChecked = event.target.checked;

    if (isChecked) {
      if (selectedSkills.length < maxSkills) {
        setSelectedSkills([...selectedSkills, skill]);
      } else {
        alert(`Puteți selecta maximum ${maxSkills} skilluri.`);
        event.target.checked = false;
      }
    } else {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    }
  };

  const handleRecommendClick = () => {
    onRecommend(selectedSkills);
  };

  return (
    <div>
      <h2>Selectează până la {maxSkills} skill-uri</h2>
      <div>
        {skills.map((skill) => (
          <div key={skill}>
            <label>
              <input
                type="checkbox"
                value={skill}
                onChange={handleSkillChange}
                disabled={!selectedSkills.includes(skill) && selectedSkills.length >= maxSkills}
              />
              {skill}
            </label>
          </div>
        ))}
      </div>
      <button onClick={handleRecommendClick}>Recomandă Experiențe VR</button>
    </div>
  );
}
