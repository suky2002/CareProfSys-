import React, { useEffect, useState } from "react";

import { fetchSkillsAndExperiences } from "../utils/skills";

function Recommendation({ selectedSkills }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchSkillsAndExperiences().then((data) => {
      const { experiencesMap } = data;

      // Găsește experiențele care au cele mai multe potriviri de skill-uri
      const matchedExperiences = Object.keys(experiencesMap).map((experience) => {
        const experienceSkills = experiencesMap[experience];
        const matchCount = selectedSkills.filter((skill) => experienceSkills.includes(skill)).length;
        return { experience, matchCount };
      });

      // Sortează experiențele în funcție de numărul de potriviri, descrescător
      matchedExperiences.sort((a, b) => b.matchCount - a.matchCount);

      // Ia primele două experiențe cu cele mai multe potriviri
      setRecommendations(matchedExperiences.slice(0, 2).map((match) => match.experience));
    });
  }, [selectedSkills]);

  return (
    <div>
      <h2>Recomandări VR</h2>
      {recommendations.length > 0 ? (
        recommendations.map((rec, index) => (
          <div key={index}>
            <h3>{rec}</h3>
            <p>Explorați această experiență VR pentru a dezvolta skill-urile selectate.</p>
          </div>
        ))
      ) : (
        <p>Nicio experiență disponibilă pentru skill-urile selectate.</p>
      )}
    </div>
  );
}

export default Recommendation;
