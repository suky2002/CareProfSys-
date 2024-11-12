import Papa from 'papaparse';

export async function fetchSkillsAndJobs() {
  const response = await fetch('/Career_Path_Jobs_With_Skills_and_MatchScores.csv');

  if (!response.ok) {
    console.error("Nu am putut accesa fișierul CSV", response.status);
    return { skills: [], jobs: [] };
  }

  const text = await response.text();
  const parsedData = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      console.log("Date CSV:", result); // Vezi ce date sunt parcurse
    },
    error: (error) => {
      console.log("Eroare la încărcarea CSV-ului:", error);
    }
  });

  const skillsSet = new Set();
  const jobs = [];

  // Iterează prin fiecare rând și adaugă valorile din coloana "Skills" în set
  parsedData.data.forEach((row) => {
    if (row.Skills) { // Verifică dacă există o coloană "Skills"
      const skillList = row.Skills.split(',').map(skill => skill.trim().replace(/['"\[\]]/g, '')); // Împarte skillurile și elimină spațiile și caracterele speciale
      skillList.forEach(skill => skillsSet.add(skill));
    }

    // Adaugă joburile pentru recomandare
    if (row.JobTitle && row.Skills) {
      jobs.push({
        title: row.JobTitle,
        requiredSkills: row.Skills.split(',').map(skill => skill.trim().replace(/['"\[\]]/g, '')),
      });
    }
  });

  const skills = Array.from(skillsSet); // Convertește Set-ul în Array
  console.log("Skill-uri extrase:", skills); // Verifică skillurile extrase
  console.log("Joburi extrase:", jobs); // Verifică joburile extrase
  return { skills, jobs };
}
