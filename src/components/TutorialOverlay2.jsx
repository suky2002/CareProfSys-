// src/components/TutorialOverlay2.jsx

import React, { useState } from "react";
import "./css/TutorialOverlay.css";

const TutorialOverlay2 = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to the Electronics Lab!",
      content: (
        <>
          <p>
            You have entered a simulated electronics laboratory. Use the{" "}
            <strong>W</strong>, <strong>A</strong>, <strong>S</strong>, and{" "}
            <strong>D</strong> keys to move around. Click on objects to interact.
          </p>
          <p>
            Point‐and‐click anywhere on the floor to have your character walk there.
            Press <strong>M</strong> at any time to switch to free‐camera mode,
            then rotate/zoom with the mouse.
          </p>
        </>
      ),
      image: (
        <img
          src="https://png.pngtree.com/png-vector/20230414/ourmid/pngtree-keyboard-keys-vector-png-image_6705739.png"
          alt="WASD keys"
          className="tutorial-keys-image"
        />
      ),
    },
    {
      title: "Your Tasks",
      content: (
        <>
          <p>
            There are <strong>7 tasks</strong> you need to complete to learn how
            an electronics engineer works:
          </p>
          <ul>
            <li>1. Press the LCD screen (Task 1)</li>
            <li>2. Turn on the computer (blue button) (Task 2)</li>
            <li>3. Examine the Arduino board (Task 3)</li>
            <li>4. Interact with the light sensor (LSR) (Task 4)</li>
            <li>5. Measure voltage at the multimeter area (Task 5)</li>
            <li>6. Answer the Arduino quiz question (Task 6)</li>
            <li>7. Press the buzzer (Task 7)</li>
          </ul>
          <p>
            Completing all tasks will unlock extra features and let you freely
            explore the lab.
          </p>
        </>
      ),
    },
    {
      title: "Rewards & Progress",
      content: (
        <>
          <p>By completing tasks, you will:</p>
          <ul>
            <li>Unlock the circuit diagram overlay</li>
            <li>Receive a congratulatory message when all tasks are done</li>
            <li>Gain full free‐camera control without restrictions</li>
          </ul>
          <p>Can you finish them all? Good luck!</p>
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

      {slides[currentSlide].image && (
        <div>{slides[currentSlide].image}</div>
      )}

      <button className="tutorial-button" onClick={nextSlide}>
        {currentSlide < slides.length - 1 ? "Next" : "Start Exploring"}
      </button>
    </div>
  );
};

export default TutorialOverlay2;
