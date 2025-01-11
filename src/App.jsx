import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import { fetchJobs, fetchSkills } from "./utils/skills";

import CourseRecommendations from "./components/CourseRecommendations";
import EnvironmentThreeScene from "./components/EnvironmentThreeScene";
import EnvironmentTwoScene from "./components/EnvironmentTwoScene";
import ProfessionVRScene from "./components/ProfessionVRScene";
import RecommendationStyles from "./components/css/Recommendation.module.css";
import SkillForm from "./components/SkillForm";
import styles from "./components/css/App.module.css";

const App = () => {
  const [skills, setSkills] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);

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

  const handleRecommendation = (selectedSkills, navigate) => {
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

        let route = "/environment-two";
        if (job.industry === "Information Technology") route = "/environment-two";
        if (job.industry === "Educație") route = "/env3";

        return { ...job, score, route };
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
    navigate("/recommendations");
  };

  return (
    <Router>
      <div className={styles["app-container"]}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                skills={skills}
                onRecommend={(selectedSkills, navigate) =>
                  handleRecommendation(selectedSkills, navigate)
                }
              />
            }
          />
          <Route
            path="/recommendations"
            element={<Recommendations recommendedJobs={recommendedJobs} />}
          />
          <Route path="/vr" element={<ProfessionVRScene />} />
          <Route path="/environment-two" element={<EnvironmentTwoScene />} />
          <Route path="/env3" element={<EnvironmentThreeScene />} />
        
        
          <Route
          path="/course-recommendations"
          element={
            <CourseRecommendations
              recommendedCourses={[
                {
                  name: "Universitatea Politehnica București",
                  description: "Cursuri de specializare în IT și Inginerie.",
                  link: "https://www.upb.ro/",
                },
                {
                  name: "Academia de Studii Economice București",
                  description: "Cursuri în domeniul economiei și managementului.",
                  link: "https://www.ase.ro/",
                },
              ]}
            />}
          />
        </Routes>
      </div>
    </Router>
  );
};

const HomePage = ({ skills, onRecommend }) => {
  const navigate = useNavigate();
  return (
    <div className={styles["home-container"]}>
      <h1 className={styles["app-title"]}>Selectează între 2 și 10 skill-uri</h1>
      <div className={styles["skill-form-container"]}>
        <SkillForm
          skills={skills}
          onRecommend={(selectedSkills) => onRecommend(selectedSkills, navigate)}
        />
      </div>
    </div>
  );
};

const Recommendations = ({ recommendedJobs }) => {
  const [expandedIndustries, setExpandedIndustries] = useState({});

  const toggleExpand = (industry) => {
    setExpandedIndustries((prev) => ({
      ...prev,
      [industry]: !prev[industry],
    }));
  };

  return (
    <div className={RecommendationStyles["recommendations-page"]}>
      <h1 className={RecommendationStyles["app-title"]}>Recomandările Tale</h1>
      {Object.keys(recommendedJobs).length > 0 ? (
        <div className={RecommendationStyles["recommendations-container"]}>
          {Object.keys(recommendedJobs).map((industry, index) => {
            const isExpanded = expandedIndustries[industry];
            const jobsToShow = isExpanded
              ? recommendedJobs[industry]
              : recommendedJobs[industry].slice(0, 2);

            return (
              <div key={index} className={RecommendationStyles["industry-section"]}>
                <h3 className={RecommendationStyles["industry-title"]}>{industry}</h3>
                <div className={RecommendationStyles["jobs-grid"]}>
                  {jobsToShow.map((job, idx) => (
                    <div key={idx} className={RecommendationStyles["job-card"]}>
                      <div className={RecommendationStyles["job-card-title"]}>{job.title}</div>
                      <div className={RecommendationStyles["job-card-score"]}>
                        Scor: {(job.score * 100).toFixed(0)}%
                      </div>
                      <a href={job.route} className={RecommendationStyles["job-card-link"]}>
                        Explorează în VR
                      </a>
                    </div>
                  ))}
                </div>
                {recommendedJobs[industry].length > 4 && (
                  <button
                    className={RecommendationStyles["view-more-button"]}
                    onClick={() => toggleExpand(industry)}
                  >
                    {isExpanded ? "View Less" : "View More"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>Nicio experiență disponibilă pentru skill-urile selectate.</p>
      )}
    </div>
  );
};


export default App;
