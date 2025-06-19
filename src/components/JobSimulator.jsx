import React, { useState, useEffect } from 'react';

function JobSimulator({ onClose, onComplete }) {

  const taskTemplates = [
    {
      id: 'pcb',
      label: 'Name two common PCB design rules',
      type: 'pcb',
      keywords: ['trace', 'copper', 'etch', 'clearance', 'mask', 'silkscreen']
    },
    {
      id: 'pcb2',
      label: 'What is a via used for in a PCB?',
      type: 'pcb',
      keywords: ['via', 'layer', 'connect', 'hole', 'trace']
    },
    {
      id: 'pcb3',
      label: 'Name one reason why PCB traces shouldn’t be too thin',
      type: 'pcb',
      keywords: ['current', 'resistance', 'heat', 'burn']
    },
    {
      id: 'code',
      label: 'Write a valid C++ function signature for calculating factorial',
      type: 'code',
      keywords: ['int', 'factorial', '()']
    },
    {
      id: 'code2',
      label: 'Write a C++ loop that calculates the factorial of a number using a for loop',
      type: 'code',
      keywords: ['for', 'factorial', 'int']
    },
    {
      id: 'code3',
      label: 'What is the purpose of #include <iostream> in C++?',
      type: 'code',
      keywords: ['input', 'output', 'cin', 'cout']
    },
    {
      id: 'model',
      label: 'In Blender, describe how to subdivide a mesh',
      type: 'model',
      keywords: ['subdivide', 'edit mode', 'apply', 'mesh', 'modifier']
    },
    {
      id: 'model2',
      label: 'How do you move an object in Blender using the keyboard?',
      type: 'model',
      keywords: ['g', 'move', 'grab', 'axis', 'shift']
    },
    {
      id: 'model3',
      label: 'What does the "Tab" key do in Blender?',
      type: 'model',
      keywords: ['edit mode', 'toggle', 'object mode']
    }
  ];

  const [slots, setSlots] = useState(shuffle(taskTemplates));
  const [activeIdx, setActiveIdx] = useState(0);

  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(score);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const nextTask = () => {
    setAnswer('');
    const nextIdx = (activeIdx + 1) % slots.length;
    setActiveIdx(nextIdx);
  };

  const handleSubmit = () => {
    const current = slots[activeIdx];
    let ok = false;

    if (current.type === 'pcb') {
      let count = 0;
      current.keywords.forEach((kw) => {
        if (answer.toLowerCase().includes(kw)) {
          count += 1;
        }
      });
      ok = count >= 2;
    }

    if (current.type === 'code') {
      ok = current.keywords.every((kw) => answer.includes(kw));
    }

    if (current.type === 'model') {
      let count = 0;
      current.keywords.forEach((kw) => {
        if (answer.toLowerCase().includes(kw)) {
          count += 1;
        }
      });
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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default JobSimulator;
