

import "./css/Recommendation.module.css"; // Fișier CSS pentru stiluri

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

