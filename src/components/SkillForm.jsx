import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
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
    const selected = event.target.value;
    if (selected.length <= maxSkills) {
      setSelectedSkills(selected);
    } else {
      alert(`Puteți selecta maximum ${maxSkills} skilluri.`);
    }
  };

  const handleRecommendClick = () => {
    onRecommend(selectedSkills);
  };

  return (
    <div>
      <h2>Selectează până la {maxSkills} skill-uri</h2>
      <FormControl fullWidth style={{ width: '400px' }}>
        <InputLabel id="multiple-checkbox-label">Selectează un skill</InputLabel>
        <Select
          labelId="multiple-checkbox-label"
          multiple
          value={selectedSkills}
          onChange={handleSkillChange}
          renderValue={(selected) => selected.join(', ')}
          style={{ width: '100%' }}
        >
          {skills.map((skill) => (
            <MenuItem key={skill} value={skill}>
              <Checkbox checked={selectedSkills.indexOf(skill) > -1} />
              <ListItemText primary={skill} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <button onClick={handleRecommendClick}>Recomandă Experiențe VR</button>
    </div>
  );
}
