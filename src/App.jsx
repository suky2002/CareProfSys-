import React, { useState } from 'react';

import SkillForm from './components/SkillForm';

function App() {
  const [recommendations, setRecommendations] = useState([]);

  const handleRecommend = (skills) => {
    // Funcția de recomandare a experiențelor în VR
    console.log('Skills selectate:', skills);
    setRecommendations(skills); // Aici adaugi logica de recomandare
  };

  return (
    <div>
      <SkillForm onRecommend={handleRecommend} />
      <h2>Recomandări VR</h2>
      <ul>
        {recommendations.length > 0
          ? recommendations.map((exp, index) => <li key={index}>{exp}</li>)
          : <p>Nicio experiență disponibilă pentru skill-urile selectate.</p>
        }
      </ul>
    </div>
  );
}

export default App;
