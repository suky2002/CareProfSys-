import Papa from 'papaparse';

// Funcție pentru clasificarea manuală a industriei pe baza titlului jobului
function classifyIndustry(jobTitle, originalIndustry) {
  const title = jobTitle.toLowerCase();

  if (title.includes("engineer") || title.includes("developer") || title.includes("analyst")) {
    return "Information Technology";
  } else if (title.includes("pharmacy") || title.includes("nurse") || title.includes("health")) {
    return "Healthcare";
  } else if (title.includes("manager") || title.includes("director") || title.includes("executive")) {
    return "Management";
  } else if (title.includes("technician") || title.includes("machinery") || title.includes("electrician")) {
    return "Technical Services";
  } else if (title.includes("sales") || title.includes("marketing") || title.includes("advertising")) {
    return "Sales and Marketing";
  } else if (title.includes("accountant") || title.includes("financial") || title.includes("auditor")) {
    return "Financial and Professional";
  } else if (title.includes("teacher") || title.includes("education") || title.includes("instructor")) {
    return "Education";
  } else if (title.includes("construction") || title.includes("architect")) {
    return "Construction";
  } else if (title.includes("designer") || title.includes("artist") || title.includes("animator")) {
    return "Creative Arts";
  } else if (title.includes("mechanic") || title.includes("machinist")) {
    return "Advanced Manufacturing";
  } else if (title.includes("biologist") || title.includes("chemist") || title.includes("scientist")) {
    return "Bioscience";
  } else if (title.includes("logistics") || title.includes("transportation") || title.includes("supply chain")) {
    return "Transportation and Logistics";
  } else if (title.includes("energy") || title.includes("environmental")) {
    return "Energy";
  } else if (title.includes("hospitality") || title.includes("hotel") || title.includes("food service")) {
    return "Hospitality";
  }

  // Folosește industria originală dacă niciuna dintre regulile de mai sus nu se aplică
  return originalIndustry || "Altele";
}

export async function fetchSkills() {
  const response = await fetch('/Career_Path_Jobs_With_Skills_and_MatchScores.csv');
  if (!response.ok) {
    console.error("Nu am putut accesa fișierul CSV", response.status);
    return [];
  }
  
  const text = await response.text();
  const parsedData = Papa.parse(text, { header: true, skipEmptyLines: true });

  const skills = new Set();
  parsedData.data.forEach((row) => {
    if (row.Skills) {
      const skillList = row.Skills.split(',')
        .map(skill => skill.replace(/['"\[\]]/g, '').trim());
      skillList.forEach(skill => skills.add(skill));
    }
  });

  console.log("Skill-uri unice extrase:", Array.from(skills));
  return Array.from(skills);
}

export async function fetchJobs() {
  const response = await fetch('/Career_Path_Jobs_With_Skills_and_MatchScores.csv');
  if (!response.ok) {
    console.error("Nu am putut accesa fișierul CSV", response.status);
    return [];
  }
  
  const text = await response.text();
  const parsedData = Papa.parse(text, { header: true, skipEmptyLines: true });

  const jobs = parsedData.data.map((row) => {
    const title = row.JobTitle;
    const originalIndustry = row.IndustryCluster;
    const industry = classifyIndustry(title, originalIndustry);

    return {
      title: title,
      skills: row.Skills ? row.Skills.split(',').map(skill => skill.replace(/['"\[\]]/g, '').trim()) : [],
      matchScore: row.MatchScore,
      industry: industry, // Folosim industria reclasificată
    };
  });

  console.log("Joburi procesate din CSV:", jobs);
  return jobs;
}
