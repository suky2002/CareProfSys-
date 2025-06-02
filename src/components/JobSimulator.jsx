import React, { useState, useEffect } from 'react';

function JobSimulator({ onClose, onComplete }) {
  // List of more challenging tasks (in English)
  const taskTemplates = [
    {
      id: 'pcb',
      label: 'Name two common PCB design rules',
      type: 'pcb',
      // We will check for at least two of the following keywords:
      keywords: ['trace', 'copper', 'etch', 'clearance', 'mask', 'silkscreen']
    },
    {
      id: 'code',
      label: 'Write a valid C++ function signature for calculating factorial',
      type: 'code',
      // We'll simply check that the answer contains "int" and "factorial" and parentheses "()"
      keywords: ['int', 'factorial', '()']
    },
    {
      id: 'model',
      label: 'In Blender, describe how to subdivide a mesh',
      type: 'model',
      // We'll check for at least two of the following keywords:
      keywords: ['subdivide', 'edit mode', 'apply', 'mesh', 'modifier']
    },
  ];

  // Shuffle tasks at the start
  const [slots, setSlots] = useState(shuffle(taskTemplates));
  const [activeIdx, setActiveIdx] = useState(0);

  // Timer set to 60 seconds
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState('');

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0) {
      // Time is up → report final score
      onComplete(score);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Move to the next task
  const nextTask = () => {
    setAnswer('');
    const nextIdx = (activeIdx + 1) % slots.length;
    setActiveIdx(nextIdx);
  };

  // Validate the current answer
  const handleSubmit = () => {
    const current = slots[activeIdx];
    let ok = false;

    if (current.type === 'pcb') {
      // Count how many distinct keywords appear in the answer
      let count = 0;
      current.keywords.forEach((kw) => {
        if (answer.toLowerCase().includes(kw)) {
          count += 1;
        }
      });
      // Require at least 2 distinct keywords
      ok = count >= 2;
    }

    if (current.type === 'code') {
      // Check that it at least contains the keywords specified
      ok = current.keywords.every((kw) => answer.includes(kw));
    }

    if (current.type === 'model') {
      // Count how many distinct keywords appear
      let count = 0;
      current.keywords.forEach((kw) => {
        if (answer.toLowerCase().includes(kw)) {
          count += 1;
        }
      });
      // Require at least 2 distinct keywords
      ok = count >= 2;
    }

    if (ok) {
      setScore((prev) => prev + 1);
    }
    nextTask();
  };

  const current = slots[activeIdx];

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
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <h2>Job Simulator</h2>
      <div style={{ marginBottom: '1rem' }}>
        ⏱️ Time Left: {timeLeft}s  🏆 Score: {score}
      </div>

      <div style={{ width: '60%', textAlign: 'center', marginBottom: '2rem' }}>
        <h3>{current.label}</h3>

        {current.type === 'pcb' && (
          <p>
            Provide at least two common PCB design rules (for example: trace width, clearance, etc.).
            <br />
            <em>(Hint: mention words like “trace”, “copper”, “etch”, “clearance”, “mask”, “silkscreen”)</em>
          </p>
        )}
        {current.type === 'code' && (
          <p>
            Write a valid C++ function signature for calculating factorial.
            <br />
            <em>(It must include “int”, “factorial”, and parentheses “()” in your answer.)</em>
          </p>
        )}
        {current.type === 'model' && (
          <p>
            In Blender, explain how to subdivide a mesh.
            <br />
            <em>(Include at least two of: “subdivide”, “edit mode”, “apply”, “mesh”, “modifier”)</em>
          </p>
        )}

        <textarea
          rows={5}
          cols={50}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          style={{
            marginTop: '1em',
            padding: '0.5em',
            fontSize: '1rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <br />
        <button
          onClick={handleSubmit}
          style={{
            marginTop: '1em',
            padding: '0.75em 1.5em',
            fontSize: '1rem',
            cursor: 'pointer',
            background: '#4caf50',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
          }}
        >
          Submit
        </button>
      </div>

      <button
        onClick={() => onClose(score)}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: '#e74c3c',
          border: 'none',
          padding: '0.5em 1em',
          color: '#fff',
          fontSize: '1rem',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        X Close
      </button>
    </div>
  );
}

// Helper: shuffle array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default JobSimulator;
