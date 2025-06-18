import { useState, useEffect, useRef } from "react";
import { fixSignalTasks } from "../data/fixSignalTasks";
import { useNavigate } from "react-router-dom";
import ProblemOverlayFix from "../components/ProblemOverlayFix"; // asigură-te că ai importul

export default function Level2() {
  const [currentTask, setCurrentTask] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // timer pentru skip
  const [canSkip, setCanSkip] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayTime, setOverlayTime] = useState(30);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const overlayInterval = useRef(null);
  const navigate = useNavigate();

  const task = fixSignalTasks[currentTask];

  useEffect(() => {
    if (showOverlay && overlayTime > 0) {
      overlayInterval.current = setInterval(() => setOverlayTime((t) => t - 1), 1000);
      return () => clearInterval(overlayInterval.current);
    }
    if (overlayTime === 0) setShowOverlay(false);
  }, [showOverlay, overlayTime]);

  useEffect(() => {
    if (!showExplanation && !finished && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timeLeft === 0) setCanSkip(true);
  }, [showExplanation, finished, timeLeft]);

  function handleOption(option) {
    setSelected(option);
    setShowExplanation(true);
  }

  function handleNext() {
    setSelected(null);
    setShowExplanation(false);
    setTimeLeft(10);
    setCanSkip(false);
    if (selected && selected.isCorrect) setScore((s) => s + 1);
    if (currentTask + 1 < fixSignalTasks.length) {
      setCurrentTask((t) => t + 1);
    } else {
      setFinished(true);
    }
  }

  function handleSkip() {
    setShowExplanation(true);
  }

  const handleSelect = (option) => {
    setSelected(option);
    setAnswers(prev => [
      ...prev,
      {
        selected: option,
        correct: task.options.find(o => o.isCorrect),
        prompt: task.prompt
      }
    ]);
    if (option.isCorrect) {
      setScore((prev) => prev + 1);
      playSound("correct.mpeg");
    } else {
      playSound("wrong.mpeg");
    }

    setTimeout(() => {
      setSelected(null);
      if (currentTask + 1 < fixSignalTasks.length) {
        setCurrentTask((prev) => prev + 1);
        setShowProblem(true);
      } else {
        playSound("success.mpeg");
        setShowResults(true); // <-- ADĂUGĂ ASTA
      }
    }, 1500);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      {showOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="bg-white text-black p-8 rounded-2xl shadow-2xl text-center max-w-xl border-4 border-blue-700">
            <h2 className="text-2xl font-extrabold mb-4">BROADCAST EMERGENCY</h2>
            <p className="mb-6 text-base leading-relaxed">
              A critical broadcast issue has occurred!<br />
              You have <b>{overlayTime} seconds</b> to read the instructions and prepare.<br />
              When the timer ends, troubleshooting tasks will begin.
            </p>
            <div className="text-4xl font-mono text-blue-700 mb-4">{overlayTime}</div>
            <button
              onClick={() => setShowOverlay(false)}
              className="bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-blue-800 transition-all"
            >
              START NOW
            </button>
          </div>
        </div>
      )}
      {!finished ? (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full flex flex-col items-center relative">
          {/* Timer centrat sus */}
          {!showExplanation && (
            <div className={`absolute top-[-48px] left-1/2 transform -translate-x-1/2 font-digital text-4xl px-6 py-2 tracking-widest rounded-md z-40 shadow-lg
              ${timeLeft <= 3 ? "animate-pulse text-red-500 bg-red-100" : "text-green-700 bg-gray-100"}`}>
              {String(timeLeft).padStart(2, "0")}
            </div>
          )}

          <p className="text-lg font-semibold mb-4">{task.prompt}</p>
          <div className="grid grid-cols-2 gap-6 mb-4">
            {task.options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOption(option)}
                disabled={showExplanation}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all
                  ${showExplanation
                    ? option.isCorrect
                      ? "border-green-600 bg-green-100"
                      : option === selected
                        ? "border-red-600 bg-red-100"
                        : "border-gray-200 bg-gray-50"
                    : "border-blue-400 bg-blue-50 hover:bg-blue-100"}
                `}
              >
                <img src={option.image} alt={option.label} className="w-24 h-24 object-contain mb-2" />
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          {showExplanation && (
            <div className="w-full text-center mt-4">
              <p className={`mb-2 ${selected && selected.isCorrect ? "text-green-700" : "text-red-700"}`}>
                {selected && selected.isCorrect ? "Correct!" : "Incorrect or Skipped!"}
              </p>
              <p className="text-gray-700 mb-2">{task.explanation}</p>
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
              >
                {currentTask + 1 === fixSignalTasks.length ? "Finish" : "Next Task"}
              </button>
            </div>
          )}
          {/* Skip button */}
          {!showExplanation && canSkip && (
            <button
              onClick={handleSkip}
              className="mt-4 bg-yellow-500 text-white px-6 py-2 rounded shadow hover:bg-yellow-600"
            >
              Skip Task
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4">Level Complete!</h3>
          <p className="mb-2">Your score: <b>{score} / {fixSignalTasks.length}</b></p>
          {score >= 3 ? (
            <button
              onClick={() => navigate("/control-room")}
              className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 mt-4"
            >
              Proceed to Level 3: Control Room
            </button>
          ) : (
            <p className="text-red-600 mt-4">
              You need at least 3 correct answers to proceed to Level 3 (Control Room). Please review the explanations and try again!
            </p>
          )}
          {/* Results section */}
          {showResults && (
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-green-400">Results</h2>
              <p className="text-lg">
                You completed the Fix the Signal challenge with a score of{" "}
                <span className="font-bold">{score}</span> / {fixSignalTasks.length}
              </p>
              {/* Badge */}
              {getBadge(score, fixSignalTasks.length) && (
                <div className="flex flex-col items-center mb-4">
                  <img
                    src={getBadge(score, fixSignalTasks.length).image}
                    alt={getBadge(score, fixSignalTasks.length).label}
                    style={{ width: 120, height: 120 }}
                  />
                  <span className="mt-2 text-lg font-semibold">
                    {getBadge(score, fixSignalTasks.length).label} Badge
                  </span>
                </div>
              )}
              {/* Lista de răspunsuri */}
              <div className="text-left mt-6 space-y-4">
                {answers.map((ans, idx) => (
                  <div key={idx} className="p-4 rounded bg-gray-800 mb-2">
                    <div className="font-bold mb-1">{ans.prompt}</div>
                    <div>
                      <span className="font-semibold">Your answer:</span>{" "}
                      <span className={ans.selected.isCorrect ? "text-green-400" : "text-red-400"}>
                        {ans.selected.label}
                      </span>
                    </div>
                    {!ans.selected.isCorrect && (
                      <div>
                        <span className="font-semibold">Correct answer:</span>{" "}
                        <span className="text-green-400">{ans.correct.label}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Redirect logic */}
              {score >= Math.ceil(fixSignalTasks.length * 0.7) ? (
                <button
                  onClick={() => {/* navighează la level 3 */ }}
                  className="mt-6 px-6 py-2 bg-green-600 rounded hover:bg-green-700 transition text-white"
                >
                  Proceed to Level 3: Control Room
                </button>
              ) : (
                <div>
                  <p className="text-red-400 mt-4">
                    You need at least {Math.ceil(fixSignalTasks.length * 0.7)} correct answers to proceed to Level 3.<br />
                    Please review and try again!
                  </p>
                  <button
                    onClick={() => {
                      setCurrentTask(0);
                      setScore(0);
                      setAnswers([]);
                      setShowInstruction(true);
                      setShowResults(false);
                    }}
                    className="mt-4 px-6 py-2 bg-purple-600 rounded hover:bg-purple-700 transition text-white"
                  >
                    Retry Level 2
                  </button>
                  <button
                    onClick={() => {/* navighează la level 1 */ }}
                    className="mt-4 ml-4 px-6 py-2 bg-gray-600 rounded hover:bg-gray-700 transition text-white"
                  >
                    Back to Level 1
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
