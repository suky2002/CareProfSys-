import { useState } from "react";
import { fixSignalTasks } from "../data/fixSignalTasks";
import InstructionOverlayFix from "../components/InstructionOverlayFix";
import ProblemOverlayFix from "../components/ProblemOverlayFix";

export default function FixSignal() {
    const [currentTask, setCurrentTask] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showInstruction, setShowInstruction] = useState(true);
    const [showProblem, setShowProblem] = useState(false);
    const [score, setScore] = useState(0);

    const task = fixSignalTasks[currentTask];

    const playSound = (filename) => {
        const audio = new Audio(`/audio/${filename}`);
        audio.play();
    };

    const handleSelect = (option) => {
        setSelected(option);
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
            }
        }, 1500);
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center px-4 py-8">
            {showInstruction && (
                <InstructionOverlayFix onFinish={() => setShowInstruction(false)} />
            )}

            {!showInstruction && showProblem && (
                <ProblemOverlayFix
                    problem={task.problem}
                    onFinish={() => setShowProblem(false)}
                />
            )}

            {!showInstruction && !showProblem && currentTask < fixSignalTasks.length && (
                <div className="max-w-5xl w-full">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Task {currentTask + 1} of {fixSignalTasks.length}
                    </h2>
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

            {!showInstruction && !showProblem && currentTask === fixSignalTasks.length && (
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-green-400">🎉 Great job!</h2>
                    <p className="text-lg">
                        You completed the Fix the Signal challenge with a score of{" "}
                        <span className="font-bold">{score}</span> / {fixSignalTasks.length}
                    </p>
                    <button
                        onClick={() => {
                            setCurrentTask(0);
                            setScore(0);
                            setShowInstruction(true);
                        }}
                        className="mt-4 px-6 py-2 bg-purple-600 rounded hover:bg-purple-700 transition"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}