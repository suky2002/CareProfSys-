import React, { useState } from 'react';

const TutorialOverlay = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to the Broadcasting Studio!",
      content: (
        <>
          <p>You are in a professional broadcasting engineering studio simulator.</p>
          <p>
            Use the <strong>W</strong>, <strong>A</strong>, <strong>S</strong>, and <strong>D</strong> keys to move
            around. Use the mouse to interact with objects by clicking on them.
          </p>
        </>
      ),
    },
    {
      title: "Your Mission",
      content: (
        <>
          <p>
            There are <strong>5 tasks</strong> you need to complete to understand the work of an engineer in a
            broadcasting studio. Each task simulates real-world challenges.
          </p>
          <p>
            Completing tasks will unlock new features and advance the studio simulation. Keep an eye out for
            instructions and hints as you explore.
          </p>
        </>
      ),
    },
    {
      title: "Gamification System",
      content: (
        <>
          <p>
            Completing tasks will grant you rewards such as:
            <ul>
              <li>Unlocking new equipment.</li>
              <li>Increasing studio performance metrics.</li>
              <li>Receiving badges and achievements.</li>
            </ul>
          </p>
          <p>Can you complete all tasks and optimize the studio setup?</p>
        </>
      ),
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: `rgba(0, 0, 0, ${0.8 - currentSlide * 0.2})`, // Decreasing opacity
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const buttonStyles = {
    marginTop: '20px',
    padding: '10px 20px',
    background: '#FFAA00',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  };

  return (
    <div style={overlayStyles}>
      <h1>{slides[currentSlide].title}</h1>
      <div>{slides[currentSlide].content}</div>
      <button style={buttonStyles} onClick={nextSlide}>
        {currentSlide < slides.length - 1 ? "Next" : "Start Exploring"}
      </button>
    </div>
  );
};

export default TutorialOverlay;
