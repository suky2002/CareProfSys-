import React from 'react';

function Recommendation({ selectedSkills }) {
  // Logica de recomandare bazată pe skill-uri
  const experiences = {
    'Junior Engineer': ['Lumea Începătorului', 'Experiența Basic Engineering'],
    'Senior Engineer': ['Advanced Design Lab', 'Simularea Proiectelor Complexe']
  };

  const recommended = selectedSkills.includes('Advanced Skills')
    ? experiences['Senior Engineer']
    : experiences['Junior Engineer'];

  return (
    <div>
      <h2>Experiențele VR recomandate</h2>
      <ul>
        {recommended.map((exp) => (
          <li key={exp}>{exp}</li>
        ))}
      </ul>
    </div>
  );
}

export default Recommendation;
