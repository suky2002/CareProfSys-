import { useState } from "react";

export default function Level2() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const questions = [
    { question: "What is this studio equipment used for?", options: ["Light", "Speaker", "Camera"], answer: "Light" },
    { question: "Which equipment captures sound?", options: ["Light", "Microphone", "Monitor"], answer: "Microphone" }
  ];

  function handleAnswer(option) {
    if (option === questions[currentQuestion].answer) setScore(score + 1);
    if (currentQuestion + 1 < questions.length) setCurrentQuestion(currentQuestion + 1);
    else alert(`Quiz complete! Your score: ${score + (option === questions[currentQuestion].answer ? 1 : 0)} / ${questions.length}`);
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Interactive Quiz</h2>
      <p className="mb-6">{questions[currentQuestion].question}</p>
      <div className="space-x-4">
        {questions[currentQuestion].options.map(option => (
          <button key={option} onClick={() => handleAnswer(option)} className="bg-blue-500 text-white px-4 py-2 rounded">
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
