import React, { useState, useEffect } from 'react';

const ELECTRICAL_QUESTIONS = [
  {
    id: 1,
    question: "What is the unit of electric current?",
    options: ["Amperes (A)", "Volts (V)", "Watts (W)", "Ohms (Ω)"],
    correctOption: 0,
  },
  {
    id: 2,
    question: "What is the name of the law that relates voltage (U), current (I), and resistance (R)?",
    options: ["Ohm's Law", "Kirchhoff's Law", "Joule's Law", "Faraday's Law"],
    correctOption: 0,
  },
  {
    id: 3,
    question: "What is the standard symbol for resistance in electric circuits?",
    options: ["R", "I", "U", "C"],
    correctOption: 0,
  },
  {
    id: 4,
    question: "What happens to the electric current in a conductor when resistance increases, assuming constant voltage?",
    options: ["Current decreases", "Current increases", "Current remains constant", "Current disappears completely"],
    correctOption: 0,
  },
  {
    id: 5,
    question: "How is electric power (P) defined in a circuit?",
    options: ["P = U · I", "P = I / U", "P = U + I", "P = U^2 / R"],
    correctOption: 0,
  },
];

function ElectricalQuiz({ onClose, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(score);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (currentIdx >= ELECTRICAL_QUESTIONS.length) {
      onComplete(score);
    }
  }, [currentIdx]);

  const currentQuestion = ELECTRICAL_QUESTIONS[currentIdx];

  const handleAnswer = (chosenIdx) => {
    if (!currentQuestion) return;
    if (chosenIdx === currentQuestion.correctOption) {
      setScore((s) => s + 1);
    }
    setCurrentIdx((i) => i + 1);
  };

  if (timeLeft <= 0 || currentIdx >= ELECTRICAL_QUESTIONS.length) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.85)',
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
        <h2 style={{ margin: 0 }}>Electrical Quiz</h2>
        <div>
          ⏱️ Time Left: {timeLeft}s  🏆 Score: {score} / {ELECTRICAL_QUESTIONS.length}
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
        <h3 style={{ marginBottom: '1rem' }}>
          {currentIdx + 1}. {currentQuestion.question}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {currentQuestion.options.map((opt, idx) => (
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
          padding: '0.5em 1em',
          color: '#fff',
          fontSize: '1rem',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ✖ Close
      </button>
    </div>
  );
}

export default ElectricalQuiz;
