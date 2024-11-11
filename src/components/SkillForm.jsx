import React, { useEffect, useState } from 'react';

import { fetchSkills } from './skills';

function SkillForm({ onRecommend }) {
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    fetchSkills((data) => setSkills(data));
  }, []);

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else if (selectedSkills.length < 5) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = () => {
    onRecommend(selectedSkills);
  };

  return (
    <div>
      <h2>Selectează până la 5 skill-uri</h2>
      <div>
        {skills.map((skill) => (
          <button
            key={skill.name}
            onClick={() => toggleSkill(skill.name)}
            style={{
              background: selectedSkills.includes(skill.name) ? 'lightgreen' : 'white',
            }}
          >
            {skill.name}
          </button>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={selectedSkills.length === 0}>
        Recomandă Experiențe VR
      </button>
    </div>
  );
}

export default SkillForm;
