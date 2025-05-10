import { useLocation, useNavigate } from "react-router-dom";

import { useEffect } from "react";

export default function QuizResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, total } = location.state || { score: 0, total: 0 };

  const percent = Math.round((score / total) * 100);

  const badge =
    percent === 100
      ? "Master Engineer"
      : percent >= 80
        ? "Studio Pro"
        : percent >= 50
          ? "Rookie Tech"
          : "Beginner";

  const feedback =
    percent === 100
      ? "Outstanding! You've mastered all the studio equipment."
      : percent >= 80
        ? "Great job! You're ready to step into a real studio."
        : percent >= 50
          ? "Nice effort! You’re on your way—review a few more tools."
          : "Keep exploring. Try the level again to boost your knowledge.";

  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location.state, navigate]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-gray-900 p-10 rounded-xl shadow-2xl max-w-xl w-full border border-purple-700">
        <h1 className="text-4xl font-bold mb-4">Quiz Results</h1>
        <p className="text-xl mb-6">
          You scored <span className="text-green-400 font-semibold">{score}</span> out of{" "}
          <span className="font-semibold">{total}</span> ({percent}%)
        </p>

        <div className="mb-6">
          <p className="text-2xl font-bold text-purple-400 mb-1">{badge}</p>
          <p className="text-sm text-gray-300">{feedback}</p>
        </div>

        <button
          onClick={() => navigate("/level1")}
          className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
        >
          Back to Studio
        </button>
      </div>
    </div>
  );
}
