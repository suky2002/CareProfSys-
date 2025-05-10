import { useState } from "react";
import { fixSignalTasks } from "../data/fixSignalTasks";
import InstructionOverlayFix from "../components/InstructionOverlayFix";

export default function FixSignal() {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);
    const [finished, setFinished] = useState(false);

    const task = fixSignalTasks[currentTaskIndex];

    function handleOptionClick(option) {
        setSelectedOption(option.label);
        if (option.isCorrect) {
            setScore((s) => s + 1);
        }
        setTimeout(() => {
            const next = currentTaskIndex + 1;
            if (next < fixSignalTasks.length) {
                setCurrentTaskIndex(next);
                setSelectedOption(null);
            } else {
                setFinished(true);
            }
        }, 1000);
    }

    if (showInstructions) {
        return <InstructionOverlayFix onFinish={() => setShowInstructions(false)} />;
    }

    if (finished) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
                <p className="text-xl mb-6">Your Score: {score} / {fixSignalTasks.length}</p>
                <button
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded"
                    onClick={() => {
                        setCurrentTaskIndex(0);
                        setScore(0);
                        setSelectedOption(null);
                        setFinished(false);
                        setShowInstructions(true);
                    }}
                >
                    Retry Level
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mb-6 text-center max-w-xl">
                {task.problem}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {task.options.map((option, index) => {
                    const isSelected = selectedOption === option.label;
                    const isCorrect = option.isCorrect;
                    let bgColor = "bg-gray-800";
                    if (selectedOption) {
                        bgColor = isCorrect
                            ? "bg-green-600"
                            : isSelected
                                ? "bg-red-600"
                                : "bg-gray-700";
                    }

                    return (
                        <button
                            key={`${index}-${option.label}`}
                            className={`rounded-lg overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105 ${bgColor}`}
                            onClick={() => handleOptionClick(option)}
                            disabled={!!selectedOption}
                        >
                            <img src={option.image} alt={option.label} className="w-full h-40 object-cover" />
                            <div className="p-2 text-center font-medium">{option.label}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}