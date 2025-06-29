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
          Welcome to the virtual electronics lab! Navigate the space using <strong>W</strong>, <strong>A</strong>, <strong>S</strong>, and <strong>D</strong> on your keyboard, or simply tap anywhere on your screen if you're on a mobile device.
        </p>
        <p>
          Interact with the environment by clicking or tapping on objects. You can freely explore the surroundings using a mouse, touch gestures, or your VR headset.
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
            As part of your engineering simulation, you’ll go through <strong>7 interactive steps</strong> that reflect a typical workflow in an electronics lab:
          </p>
          <ul>
            <li>1. Start by <strong>turning on the PC</strong>. Press the blue button to power up the system.</li>
            <li>2. Once the PC is running, <strong>open the IoT quiz</strong> and answer the questions to test your basic knowledge.</li>
            <li>3. Head over to the shelf and <strong>inspect the components</strong> available for this session.</li>
            <li>4. Move to the wall and <strong>verify the electric panel</strong> to ensure everything is safe and properly connected.</li>
            <li>5. Go to your designated desk and <strong>check the layout and setup of your workspace</strong>.</li>
            <li>6. Take a closer look at the <strong>Arduino board</strong> on your table and analyze how it's connected.</li>
            <li>7. Finally, <strong>check the printed documents</strong> on the desk to complete your assessment.</li>
          </ul>
          <p>
            Completing all steps will unlock extra features and allow you to freely explore the lab.
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
