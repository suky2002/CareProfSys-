import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { fetchSkillsAndJobs } from '../utils/skills.jsx';

export default function SkillForm({ onRecommend }) {
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
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

    // Verifică dacă nu s-au selectat mai mult de 5 skilluri
    if (value.length <= maxSkills) {
      setSelectedSkills(value);
      setErrorMessage(''); // Resetează mesajul de eroare
    } else {
      setErrorMessage(`Puteți selecta maximum ${maxSkills} skilluri.`);
      setOpenDialog(true); // Deschide dialogul de eroare
    }
  };

  const handleRecommendClick = () => {
    if (selectedSkills.length === 0) {
      setErrorMessage('Trebuie să selectați cel puțin un skill.');
      setOpenDialog(true); // Deschide dialogul de eroare
      return;
    }
    onRecommend(selectedSkills, jobs);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Închide dialogul de eroare
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
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 224,
                width: 250, // Lățimea selectorului
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

      <Button variant="contained" color="primary" onClick={handleRecommendClick}>
        Recomandă Experiențe VR
      </Button>

      {/* Popup pentru eroare */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Eroare</DialogTitle>
        <DialogContent>
          <p>{errorMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Închide
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
