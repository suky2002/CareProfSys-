import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchJobs, fetchSkills } from "./utils/skills"; // Asigură-te că aceste funcții sunt corect implementate
import "./components/css/App.css"; // Asigură-te că fișierul CSS există
import EnvironmentThreeScene from "./components/EnvironmentThreeScene";
import EnvironmentTwoScene from "./components/EnvironmentTwoScene";
import ProfessionVRScene from "./components/ProfessionVRScene";
import SkillForm from "./components/SkillForm";

const App = () => {
  const [skills, setSkills] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Fetch skills and jobs on component mount
  useEffect(() => {
    fetchSkills()
      .then((data) => {
        console.log("Skill-uri încărcate:", data);
        setSkills(data);
      })
      .catch((error) => console.error("Eroare la încărcarea skill-urilor:", error));

    fetchJobs()
      .then((data) => {
        console.log("Joburi încărcate din CSV:", data);
        setJobs(data);
      })
      .catch((error) => console.error("Eroare la încărcarea joburilor:", error));
  }, []);

  const handleRecommendation = (selectedSkills) => {
    if (selectedSkills.length < 2 || selectedSkills.length > 10) {
      alert("Te rugăm să selectezi între 2 și 10 skill-uri.");
      return;
    }

    const normalizedSelectedSkills = selectedSkills.map((skill) =>
      skill.toLowerCase().trim()
    );
    const matchingJobs = jobs
      .map((job) => {
        const jobSkills = job.skills.map((skill) =>
          skill.toLowerCase().trim()
        );
        const matchingSkills = jobSkills.filter((skill) =>
          normalizedSelectedSkills.includes(skill)
        );
        const score = matchingSkills.length / normalizedSelectedSkills.length;
        return { ...job, score };
      })
      .filter((job) => job.score >= 0.4)
      .sort((a, b) => b.score - a.score);

    const groupedJobs = matchingJobs.reduce((acc, job) => {
      const industry = job.industry;
      if (industry === "Altele") return acc;
      if (!acc[industry]) acc[industry] = [];
      acc[industry].push(job);
      return acc;
    }, {});

    setRecommendedJobs(groupedJobs);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h1 className="app-title">Selectează între 2 și 10 skill-uri</h1>
                <SkillForm
                  skills={skills}
                  onRecommend={handleRecommendation}
                />
                <h2 className="app-subtitle">Recomandări VR</h2>
                {Object.keys(recommendedJobs).length > 0 ? (
                  <div className="recommendations-container">
                    {Object.keys(recommendedJobs).map((industry, index) => (
                      <div key={index}>
                        <h3>{industry}</h3>
                        <div className="jobs-grid">
                          {recommendedJobs[industry].map((job, idx) => (
                            <div key={idx} className="job-card">
                              <div className="job-card-title">{job.title}</div>
                              <div className="job-card-score">
                                Scor: {(job.score * 100).toFixed(0)}%
                              </div>
                              <a href="/environment-two" className="job-card-link">
                                Explorează în VR
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Nicio experiență disponibilă pentru skill-urile selectate.</p>
                )}
              </div>
            }
          />
          <Route path="/vr" element={<ProfessionVRScene />} />
          <Route path="/environment-two" element={<EnvironmentTwoScene />} />
          <Route path="/env3" element={<EnvironmentThreeScene />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
