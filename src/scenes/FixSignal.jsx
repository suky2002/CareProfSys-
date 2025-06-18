import { useState } from "react";
import { fixSignalTasks } from "../data/fixSignalTasks";
import InstructionOverlayFix from "../components/InstructionOverlayFix";
import ProblemOverlayFix from "../components/ProblemOverlayFix";
import { useNavigate } from "react-router-dom";

function getBadge(score, total) {
    if (score === total) {
        return { label: "Expert", image: "/Imagini/badge3.png" };
    } else if (score >= Math.ceil(total * 0.7)) {
        return { label: "Intermediate", image: "/Imagini/badge2.png" };
    } else if (score >= 1) {
        return { label: "Beginner", image: "/Imagini/badge1.png" };
    } else {
        return null;
    }
}

export default function FixSignal() {
    const [currentTask, setCurrentTask] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showInstruction, setShowInstruction] = useState(true);
    const [showProblem, setShowProblem] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();

    const task = fixSignalTasks[currentTask];

    const playSound = (filename) => {
        const audio = new Audio(`/audio/${filename}`);
        audio.play();
    };

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
                setShowProblem(false);
                setShowResults(true);
            }
        }, 1500);
    };

    // Reset pentru retry
    const handleRetry = () => {
        setCurrentTask(0);
        setScore(0);
        setAnswers([]);
        setShowInstruction(true);
        setShowResults(false);
        setSelected(null);
    };

    // Mergi la Level 1
    const handleBackToLevel1 = () => {
        navigate("/level1");
    };

    // Mergi la Level 3
    const handleToLevel3 = () => {
        navigate("/control-room");
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center px-4 py-8">
            {showInstruction && (
                <InstructionOverlayFix onFinish={() => setShowInstruction(false)} />
            )}

            {!showInstruction && showProblem && (
                <ProblemOverlayFix
                    problem={task.prompt}
                    onFinish={() => setShowProblem(false)}
                />
            )}

            {!showInstruction && !showProblem && !showResults && currentTask < fixSignalTasks.length && (
                <div className="max-w-5xl w-full">
                    {/* Progress bar */}
                    <div className="w-full max-w-xl mx-auto bg-gray-200 rounded-full h-4 mb-8 overflow-hidden">
                        <div
                            className="bg-blue-600 h-4 transition-all duration-300"
                            style={{ width: `${((currentTask + 1) / fixSignalTasks.length) * 100}%` }}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {task.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelect(option)}
                                disabled={!!selected}
                                className={`rounded-lg overflow-hidden border-2 transition-all duration-500 transform ${selected
                                    ? option.isCorrect
                                        ? "border-green-500 scale-105"
                                        : option === selected
                                            ? "border-red-500 scale-105"
                                            : "border-gray-700 opacity-50"
                                    : "hover:border-blue-500 hover:scale-105"
                                    }`}
                            >
                                <img
                                    src={option.image}
                                    alt={option.label}
                                    className="w-full h-40 object-cover"
                                />
                                <p className="text-center py-2 font-semibold">{option.label}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                            onClick={handleToLevel3}
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
                                onClick={handleRetry}
                                className="mt-4 px-6 py-2 bg-purple-600 rounded hover:bg-purple-700 transition text-white"
                            >
                                Retry Level 2
                            </button>
                            <button
                                onClick={handleBackToLevel1}
                                className="mt-4 ml-4 px-6 py-2 bg-gray-600 rounded hover:bg-gray-700 transition text-white"
                            >
                                Back to Level 1
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}