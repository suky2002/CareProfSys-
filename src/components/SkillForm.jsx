import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { fetchSkills } from '../utils/skills';

export default function SkillForm({ onRecommend }) {
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const minSkills = 2;
  const maxSkills = 10;

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
      alert(`Puteți selecta maximum ${maxSkills} skill-uri.`);
    }
  };

  const handleRecommendClick = () => {
    if (selectedSkills.length < minSkills) {
      alert(`Te rugăm să selectezi cel puțin ${minSkills} skill-uri.`);
    } else {
      onRecommend(selectedSkills);
    }
  };

  return (
    <div>
      <h2>Selectează între {minSkills} și {maxSkills} skill-uri</h2>
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
