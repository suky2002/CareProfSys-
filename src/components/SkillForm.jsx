import { Button, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { fetchSkillsAndJobs } from '../utils/skills.jsx';

export default function SkillForm({ onRecommend }) {
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const maxSkills = 5;

  useEffect(() => {
    async function getSkillsAndJobs() {
      const { skills, jobs } = await fetchSkillsAndJobs();
      setSkills(skills);
      setJobs(jobs);
    }
    getSkillsAndJobs();
  }, []);

  const handleSkillChange = (event) => {
    const value = event.target.value;
    setSelectedSkills(typeof value === 'string' ? value.split(',') : value);
  };

  const handleRecommendClick = () => {
    onRecommend(selectedSkills, jobs);
  };

  return (
    <div>
      <h2>Selectează până la {maxSkills} skill-uri</h2>
      <FormControl fullWidth>
        <InputLabel id="multiple-checkbox-label">Selectează un skill</InputLabel>
        <Select
          labelId="multiple-checkbox-label"
          multiple
          value={selectedSkills}
          onChange={handleSkillChange}
          renderValue={(selected) => selected.join(', ')}
        >
          {skills.map((skill) => (
            <MenuItem key={skill} value={skill}>
              <Checkbox checked={selectedSkills.indexOf(skill) > -1} />
              <ListItemText primary={skill} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleRecommendClick}>
        Recomandă Experiențe VR
      </Button>
    </div>
  );
}
