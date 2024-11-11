import React, { useState } from 'react';

import Recommendation from './Recommendation';
import SkillForm from './SkillForm';

function App() {
  const [selectedSkills, setSelectedSkills] = useState(null);

  const handleRecommend = (skills) => {
    setSelectedSkills(skills);
  };

  return (
    <div>
      {!selectedSkills ? (
        <SkillForm onRecommend={handleRecommend} />
      ) : (
        <Recommendation selectedSkills={selectedSkills} />
      )}
    </div>
  );
}

export default App;
