// import React, { useEffect, useState } from "react";

// import { fetchSkillsAndExperiences } from "../utils/skills.jsx";

// function Recommendation({ selectedSkills }) {
//   const [recommendations, setRecommendations] = useState([]);

//   useEffect(() => {
//     fetchSkillsAndExperiences().then((data) => {
//       const { experiencesMap } = data;

//       // Găsește experiențele care au cele mai multe potriviri de skill-uri
//       const matchedExperiences = Object.keys(experiencesMap).map((experience) => {
//         const experienceSkills = experiencesMap[experience];
//         const matchCount = selectedSkills.filter((skill) => experienceSkills.includes(skill)).length;
//         return { experience, matchCount };
//       });

//       // Sortează experiențele în funcție de numărul de potriviri, descrescător
//       matchedExperiences.sort((a, b) => b.matchCount - a.matchCount);

//       // Ia primele două experiențe cu cele mai multe potriviri
//       setRecommendations(matchedExperiences.slice(0, 2).map((match) => match.experience));
//     });
//   }, [selectedSkills]);

import "./css/Recommendation.css"; // Fișier CSS pentru stiluri

//   return (
//     <div>
//       <h2>Recomandări VR</h2>
//       {recommendations.length > 0 ? (
//         recommendations.map((rec, index) => (
//           <div key={index}>
//             <h3>{rec}</h3>
//             <p>Explorați această experiență VR pentru a dezvolta skill-urile selectate.</p>
//           </div>
//         ))
//       ) : (
//         <p>Nicio experiență disponibilă pentru skill-urile selectate.</p>
//       )}
//     </div>
//   );
// }
import React from "react";

const Recommendation = ({ recommendedJobs }) => {
  return (
    <div className="recommendation-container">
      <h2>Recomandările Tale</h2>
      {Object.keys(recommendedJobs).length > 0 ? (
        <div className="recommendation-grid">
          {Object.keys(recommendedJobs).map((industry, index) => (
            <div key={index} className="recommendation-category">
              <h3>{industry}</h3>
              <div className="recommendation-jobs">
                {recommendedJobs[industry].map((job, idx) => (
                  <div key={idx} className="recommendation-card">
                    <h4>{job.title}</h4>
                    <p>Scor: {(job.score * 100).toFixed(0)}%</p>
                    <a
                      href={
                        job.type === "vr"
                          ? "/vr"
                          : job.type === "environment-two"
                          ? "/environment-two"
                          : "#"
                      }
                      className="recommendation-link"
                    >
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
  );
};

export default Recommendation;

