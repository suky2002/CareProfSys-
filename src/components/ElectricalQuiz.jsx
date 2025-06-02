// src/components/ElectricalQuiz.jsx

import React, { useState, useEffect } from 'react';

const ELECTRICAL_QUESTIONS = [
  {
    id: 1,
    question: "Ce unitate de măsură are intensitatea curentului electric?",
    options: ["Amperi (A)", "Volți (V)", "Wați (W)", "Ohmi (Ω)"],
    correctOption: 0,
  },
  {
    id: 2,
    question: "Cum se numește legea care leagă tensiunea U, curentul I și rezistența R?",
    options: ["Legea lui Ohm", "Legea lui Kirchhoff", "Legea lui Joule", "Legea lui Faraday"],
    correctOption: 0,
  },
  {
    id: 3,
    question: "Care este simbolul standard pentru rezistență în circuitele electrice?",
    options: ["R", "I", "U", "C"],
    correctOption: 0,
  },
  {
    id: 4,
    question: "Ce se întâmplă cu curentul electric într-un conductor când rezistența crește, la aceeași tensiune?",
    options: ["Curentul scade", "Curentul crește", "Curentul rămâne constant", "Curentul dispare complet"],
    correctOption: 0,
  },
  {
    id: 5,
    question: "Cum definiți puterea electrică într-un circuit (P)?",
    options: ["P = U · I", "P = I / U", "P = U + I", "P = U^2 / R"],
    correctOption: 0,
  },
  // … poți adăuga alte întrebări
];

function ElectricalQuiz({ onClose, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(60);     // 60s pentru întreaga sesiune
  const [score, setScore] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Timer global
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(score);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Când termină întrebările
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

  // Dacă s-a terminat timpul sau nu mai sunt întrebări, nu afișăm nimic
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
        <h2 style={{ margin: 0 }}>Quiz Electric</h2>
        <div>
          ⏱️ Timp rămas: {timeLeft}s  🏆 Scor: {score} / {ELECTRICAL_QUESTIONS.length}
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
        X Închide
      </button>
    </div>
  );
}

// **Exportul default este obligatoriu!**
export default ElectricalQuiz;
