import Papa from 'papaparse';
export async function fetchSkills() {
  const response = await fetch('/Career_Path_Jobs_With_Skills_and_MatchScores.csv');
  
  if (!response.ok) {
    console.error("Nu am putut accesa fișierul CSV", response.status);
    return [];
  }
  
  const text = await response.text();
  const data = Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true, // Ignoră liniile goale
    complete: (result) => {
      console.log("Skill-uri extrase:", result.data);
    },
    error: (error) => {
      console.log("Eroare la încărcarea CSV-ului:", error);
    }
  });
  console.log("Date CSV:", data); // Vezi ce date sunt parcurse
  
  const skills = new Set();
  data.data.forEach((row) => {
    if (row.Skill) {
      skills.add(row.Skill);
    }
  });
  
  console.log("Skill-uri extrase:", Array.from(skills)); // Verifică skillurile extrase
  return Array.from(skills);
}
