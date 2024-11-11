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
    complete: (result) => {
      console.log("Date CSV:", result); // Vezi ce date sunt parcurse
    },
    error: (error) => {
      console.log("Eroare la încărcarea CSV-ului:", error);
    }
  });

  const skills = new Set();

  // Iterează prin fiecare rând și adaugă valorile din coloana "Skills" în set
  parsedData.data.forEach((row) => {
    if (row.Skills) { // Verifică dacă există o coloană "Skills"
      const skillList = row.Skills.split(',').map(skill => skill.trim()); // Împarte skillurile și elimină spațiile
      skillList.forEach(skill => skills.add(skill));
    }
  });

  console.log("Skill-uri extrase:", Array.from(skills)); // Verifică skillurile extrase
  return Array.from(skills);
}
