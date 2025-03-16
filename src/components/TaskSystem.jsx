import React, { useState, useEffect, useCallback } from 'react';

/**
 * Componenta TaskSystem afișează lista de taskuri și oferă
 * posibilitatea de a marca un task ca finalizat.
 * Poți integra această componentă direct în orice mediu.
 *
 * Props:
 * - onAllTasksCompleted: (opțional) funcție apelată când toate taskurile sunt complete.
 */
export function TaskSystem({ onAllTasksCompleted }) {
  // Inițializarea taskurilor
  const [tasks, setTasks] = useState([
    { id: 1, description: "Explorează camera 1", completed: false },
    { id: 2, description: "Treci prin hol", completed: false },
    { id: 3, description: "Ajungi la camera 2", completed: false },
    { id: 4, description: "Schimbă intensitatea luminii", completed: false },
    // Poți adăuga și alte taskuri după necesitate
  ]);

  // Funcția pentru a marca un task ca finalizat
  const completeTask = useCallback((taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  }, []);

  // Efect care verifică dacă toate taskurile sunt complete
  useEffect(() => {
    if (tasks.every(task => task.completed)) {
      if (typeof onAllTasksCompleted === 'function') {
        onAllTasksCompleted();
      }
    }
  }, [tasks, onAllTasksCompleted]);

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'sans-serif',
      zIndex: 1000
    }}>
      <h3 style={{ marginBottom: '10px', fontSize: '16px', textAlign: 'center' }}>
        Task-uri
      </h3>
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
      {/* Butoane pentru a completa manual taskurile (doar pentru testare/demo) */}
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
 * Hook-ul useTaskSystem oferă acces la starea taskurilor și la funcția completeTask.
 * Poți folosi acest hook în orice componentă pentru a marca taskurile ca finalizate.
 */
export function useTaskSystem() {
  const [tasks, setTasks] = useState([
    { id: 1, description: "Explorează camera 1", completed: false },
    { id: 2, description: "Treci prin hol", completed: false },
    { id: 3, description: "Ajungi la camera 2", completed: false },
    { id: 4, description: "Schimbă intensitatea luminii", completed: false },
    // Adaugă taskuri suplimentare după cum dorești
  ]);

  const completeTask = useCallback((taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  }, []);

  return { tasks, completeTask };
}


