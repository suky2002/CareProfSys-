import "./css/Recommendation.module.css";
import React from "react";

const Recommendation = ({ recommendedJobs }) => {
  return (
    <div className="recommendation-container">
      <h2>Your Recommendations</h2>
      {Object.keys(recommendedJobs).length > 0 ? (
        <div className="recommendation-grid">
          {Object.keys(recommendedJobs).map((industry, index) => (
            <div key={index} className="recommendation-category">
              <h3>{industry}</h3>
              <div className="recommendation-jobs">
                {recommendedJobs[industry].map((job, idx) => (
                  <div key={idx} className="recommendation-card">
                    <h4>{job.title}</h4>
                    <p>Match Score: {(job.score * 100).toFixed(0)}%</p>
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
                      Explore in VR
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No available experience matches your selected skills.</p>
      )}
    </div>
  );
};

export default Recommendation;
