import Papa from 'papaparse';

export async function fetchSkills() {
  const response = await fetch('/Career_Path_Jobs_With_Skills_and_MatchScores.csv');
  
  if (!response.ok) {
    console.error("Nu am putut accesa fișierul CSV", response.status);
    return [];
  }
  
  const text = await response.text();
  const parsedData = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  const skills = new Set();

  // Iterăm prin fiecare rând și curățăm valorile din coloana "Skills"
  parsedData.data.forEach((row) => {
    if (row.Skills) {
      const skillList = row.Skills.split(',')
        .map(skill => skill.replace(/['"\[\]]/g, '').trim()); // Eliminăm caracterele necorespunzătoare și spațiile
      skillList.forEach(skill => skills.add(skill));
    }
  });

  return Array.from(skills); // Returnăm skill-urile unice
}
