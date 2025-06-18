import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import { fetchJobs, fetchSkills } from "./utils/skills";
import TestRobert1 from "./components/TestRobert1";
import CourseRecommendations from "./components/CourseRecommendations.jsx";
import RecommendationStyles from "./components/css/Recommendation.module.css";
import SkillForm from "./components/SkillForm";
import styles from "./components/css/App.module.css";
import LandingPage from "./components/LandingPage.jsx";

const App = () => {
  const [skills, setSkills] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchSkills()
      .then((data) => {
        console.log("Loaded Skills:", data);
        setSkills(data);
      })
      .catch((error) => console.error("Error loading skills:", error));

    fetchJobs()
      .then((data) => {
        console.log("Loaded Jobs from CSV:", data);
        setJobs(data);
      })
      .catch((error) => console.error("Error loading jobs:", error));
  }, []);

  const handleRecommendation = (selectedSkills, navigate) => {
    if (selectedSkills.length < 2 || selectedSkills.length > 10) {
      alert("Please select between 2 and 10 skills.");
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

        const route = "/robert";

        return { ...job, score, route };
      })
      .filter((job) => job.score >= 0.4)
      .sort((a, b) => b.score - a.score);

    const groupedJobs = matchingJobs.reduce((acc, job) => {
      const industry = job.industry;
      if (industry === "Others") return acc;
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
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/start"
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
          <Route path="/robert" element={<TestRobert1 />} />
        
          <Route
            path="/course-recommendations"
            element={
              <CourseRecommendations
                recommendedCourses={[
                  {
                    name: "Politehnica University of Bucharest",
                    description: "Specialization courses in IT and Engineering.",
                    link: "https://www.upb.ro/",
                  },
                  {
                    name: "Academy of Economic Studies Bucharest",
                    description: "Courses in economics and management.",
                    link: "https://www.ase.ro/",
                  },
                ]}
              />
            }
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
      <h1 className={styles["app-title"]}>Select between 2 and 10 skills</h1>
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
      <h1 className={RecommendationStyles["app-title"]}>Your Recommendations</h1>
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
                        Score: {(job.score * 100).toFixed(0)}%
                      </div>
                      <a href={job.route} className={RecommendationStyles["job-card-link"]}>
                        Explore in VR
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
        <p>No experiences available for the selected skills.</p>
      )}
    </div>
  );
};

export default App;