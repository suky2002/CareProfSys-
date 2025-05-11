import React, { useState, useEffect } from 'react';

function JobSimulator({ onClose, onComplete }) {
  // Lista de task-uri
  const taskTemplates = [
    { id: 'pcb', label: 'Conectează pistele PCB', type: 'pcb' },
    { id: 'code', label: 'Completează funcția C++', type: 'code' },
    { id: 'model', label: 'Editează modelul 3D', type: 'model' },
  ];

  // Stări
  const [slots, setSlots] = useState(shuffle(taskTemplates));
  const [activeIdx, setActiveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30s pentru toată sesiunea
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState('');

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(score);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Alege următorul task
  const nextTask = () => {
    setAnswer('');
    const nextIdx = (activeIdx + 1) % slots.length;
    setActiveIdx(nextIdx);
  };

  // Validare răspuns
  const handleSubmit = () => {
    const current = slots[activeIdx];
    let ok = false;
    if (current.type === 'pcb') {
      // simulăm validarea: răspunsul trebuie să conțină 'trace'
      ok = answer.toLowerCase().includes('trace');
    }
    if (current.type === 'code') {
      ok = answer.includes('return') && answer.includes(';');
    }
    if (current.type === 'model') {
      ok = answer.includes('.blend') || answer.includes('vertex');
    }
    if (ok) {
      setScore(score + 1);
    }
    nextTask();
  };

  const current = slots[activeIdx];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      color: '#fff', zIndex: 2000,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h2>Job Simulator</h2>
      <div>⏱️ Timp rămas: {timeLeft}s  🏆 Scor: {score}</div>
      <div style={{ margin: '2em', textAlign: 'center' }}>
        <h3>{current.label}</h3>
        {current.type === 'pcb' && (
          <p>Introdu cuvântul-cheie „trace” pentru a conecta pista.</p>
        )}
        {current.type === 'code' && (
          <p>Scrie un return și terminatorul de expresie („;”).</p>
        )}
        {current.type === 'model' && (
          <p>Menţionează „.blend” sau „vertex”.</p>
        )}
        <textarea
          rows={4} cols={40}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Scrie răspunsul aici..."
          style={{ marginTop: '1em', padding: '0.5em' }}
        />
        <br />
        <button onClick={handleSubmit}
          style={{
            marginTop: '1em',
            padding: '0.5em 1em',
            fontSize: '1em'
          }}>
          Trimite
        </button>
      </div>
      <button onClick={() => onClose(score)} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'red', border: 'none',
        padding: '0.5em 1em', color: '#fff'
      }}>X Închide</button>
    </div>
  );
}

// Helper: amestecă array‐ul
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default JobSimulator;
