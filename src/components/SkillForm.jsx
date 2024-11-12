import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { fetchSkills } from '../utils/skills.jsx';

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
    const value = event.target.value;
    if (value.length <= maxSkills) {
      setSelectedSkills(value);
    }
  };

  const handleRecommendClick = () => {
    onRecommend(selectedSkills);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h2>Selectează până la {maxSkills} skill-uri</h2>
      <FormControl fullWidth variant="outlined" style={{ marginBottom: '20px' }}>
        <InputLabel id="multiple-checkbox-label">Selectează un skill</InputLabel>
        <Select
          labelId="multiple-checkbox-label"
          multiple
          value={selectedSkills}
          onChange={handleSkillChange}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 48 * 4.5 + 8,
                width: 250,
              },
            },
          }}
        >
          {skills.map((skill) => (
            <MenuItem key={skill} value={skill}>
              <Checkbox checked={selectedSkills.indexOf(skill) > -1} />
              <ListItemText primary={skill} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <button onClick={handleRecommendClick} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        Recomandă Experiențe VR
      </button>
    </div>
  );
}
