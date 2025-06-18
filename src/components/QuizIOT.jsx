import React, { useState } from 'react';

const IOT_QUESTIONS = [
  {
    id: 1,
    question: "1. Which messaging protocol is most commonly used by constrained IoT devices?",
    options: ["HTTP", "COAP", "MQTT", "FTP"],
    correctIndex: 2, // MQTT
  },
  {
    id: 2,
    question: "2. In an IoT context, what does 'edge computing' refer to?",
    options: [
      "Processing data on the cloud",
      "Storing data in a central database",
      "Processing data close to where it is generated",
      "Using a high-latency network connection"
    ],
    correctIndex: 2,
  },

];

export default function QuizIOT({ onClose, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);

  const currentQ = IOT_QUESTIONS[currentIdx];

  const handleAnswer = (chosenIdx) => {
    if (chosenIdx === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }

    if (currentIdx + 1 < IOT_QUESTIONS.length) {
      setCurrentIdx((i) => i + 1);
    } else {
      // Quiz finished
      onComplete(score + (chosenIdx === currentQ.correctIndex ? 1 : 0));
    }
  };

  if (currentIdx >= IOT_QUESTIONS.length) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          zIndex: 2000,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            background: '#222',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            width: '80%',
            maxWidth: '500px',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>IoT Quiz Complete</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
            Your score: {score} / {IOT_QUESTIONS.length}
          </p>
          <button
            onClick={() => onClose()}
            style={{
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '2rem',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>IoT Quiz</h2>
        <div>
          🏆 Score: {score} / {IOT_QUESTIONS.length}
          ❓ Question: {currentIdx + 1} / {IOT_QUESTIONS.length}
        </div>
      </div>

      <div
        style={{
          background: '#222',
          padding: '2rem',
          borderRadius: '8px',
          width: '80%',
          maxWidth: '600px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ marginBottom: '1.5rem' }}>{currentQ.question}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: '#444',
                color: '#fff',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onClose(score)}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'red',
          border: 'none',
          padding: '0.5rem 1rem',
          color: '#fff',
          fontSize: '1rem',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        X Închide
      </button>
    </div>
  );
}
