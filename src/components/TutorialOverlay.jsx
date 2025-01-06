import "./css/TutorialOverlay.css"; // Creăm un fișier CSS pentru stiluri

import React, { useState } from "react";

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
          <img
            src="https://png.pngtree.com/png-vector/20230414/ourmid/pngtree-keyboard-keys-vector-png-image_6705739.png" // Înlocuiește cu calea corectă către imaginea ta
            alt="WASD keys"
            className="tutorial-keys-image"
          />
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

  return (
    <div className="tutorial-overlay">
      <h1>{slides[currentSlide].title}</h1>
      <div>{slides[currentSlide].content}</div>
      <button className="tutorial-button" onClick={nextSlide}>
        {currentSlide < slides.length - 1 ? "Next" : "Start Exploring"}
      </button>
    </div>
  );
};

export default TutorialOverlay;
