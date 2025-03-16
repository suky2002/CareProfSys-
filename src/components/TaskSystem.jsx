// TaskSystem.jsx
import React, { useState, useEffect, useCallback } from 'react';

/**
 * Componenta TaskSystem afișează lista de taskuri și
 * oferă funcționalitatea de a marca un task ca fiind complet.
 *
 * Props:
 * - onAllTasksCompleted: funcție callback apelată când toate taskurile sunt complete.
 */
export function TaskSystem({ onAllTasksCompleted }) {
  // Starea inițială a taskurilor
  const [tasks, setTasks] = useState([
    { id: 1, description: "Explorează camera 1", completed: false },
    { id: 2, description: "Treci prin hol", completed: false },
    { id: 3, description: "Ajungi la camera 2", completed: false },
    { id: 4, description: "Schimbă intensitatea luminii", completed: false },
    // Poți adăuga și alte taskuri...
  ]);

  // Funcție pentru a marca un task ca completat
  const completeTask = useCallback((taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  }, []);

  // Efect pentru a verifica dacă toate taskurile sunt complete
  useEffect(() => {
    if (tasks.every(task => task.completed)) {
      if (typeof onAllTasksCompleted === 'function') {
        onAllTasksCompleted();
      }
    }
  }, [tasks, onAllTasksCompleted]);

  return (
    <div style={{
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'sans-serif'
    }}>
      <h3 style={{ marginBottom: '10px', fontSize: '16px', textAlign: 'center' }}>Task-uri</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map(task => (
          <li key={task.id} style={{
            marginBottom: '8px',
            color: task.completed ? 'green' : 'red',
            textDecoration: task.completed ? 'line-through' : 'none',
            fontSize: '14px'
          }}>
            {task.description}
          </li>
        ))}
      </ul>
      {/* Butoane pentru completare manuală (opțional) */}
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => completeTask(task.id)}
            style={{
              marginRight: '5px',
              padding: '5px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Complete Task {task.id}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook-ul useTaskSystem oferă acces la starea taskurilor și funcția completeTask,
 * pentru a fi folosit în orice componentă.
 */
export function useTaskSystem() {
  const [tasks, setTasks] = useState([
    { id: 1, description: "Explorează camera 1", completed: false },
    { id: 2, description: "Treci prin hol", completed: false },
    { id: 3, description: "Ajungi la camera 2", completed: false },
    { id: 4, description: "Schimbă intensitatea luminii", completed: false },
  ]);

  const completeTask = useCallback((taskId) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: true } : task
    ));
  }, []);

  return { tasks, completeTask };
}


