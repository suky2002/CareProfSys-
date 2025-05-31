// src/components/TaskList.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./css/TaskList.module.css";

export default function TaskList({ tasks }) {
  const navigate = useNavigate();
  const allDone = tasks.every((t) => t.completed);
  const [isOpen, setIsOpen] = useState(false);

  // Detectează dacă ecranul este <= 768px pentru a aplica modul "fullscreen" pe mobil
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      className={`
        ${styles.taskContainer} 
        ${isOpen ? styles.open : ""} 
        ${isMobile && isOpen ? styles.mobileFullscreen : ""}
      `}
    >
      {/* Header-ul dropdown-ului */}
      <div className={styles.taskHeader} onClick={() => setIsOpen((p) => !p)}>
        <span className={styles.taskTitle}>Task-uri</span>
        <span className={styles.taskIcon}>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </div>

      {/* Conținutul dropdown-ului (afișat doar când isOpen == true) */}
      {isOpen && (
        <div className={styles.taskListContent}>
          <ul className={styles.taskUl}>
            {tasks.map((t) => (
              <li
                key={t.id}
                className={`${styles.taskLi} ${t.completed ? styles.completed : ""}`}
              >
                {t.description}
              </li>
            ))}
          </ul>
          <button
            className={`${styles.taskButton} ${!allDone ? styles.disabled : ""}`}
            onClick={() => navigate("/course-recommendations")}
            disabled={!allDone}
          >
            {allDone ? "Continuă la recomandări" : "Finalizați task-urile"}
          </button>
        </div>
      )}
    </div>
  );
}
