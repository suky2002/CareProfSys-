import { useEffect, useState } from "react";

export default function InstructionOverlayFix({ onFinish }) {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (timeLeft === 0) {
            onFinish();
            return;
        }
        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, onFinish]);

    return (
        <div
            onClick={onFinish}
            className="fixed inset-0 z-50 bg-black bg-opacity-80 text-white flex flex-col transition-opacity duration-500 cursor-pointer"
        >
            {/* Timer sus, centrat */}
            <div className="w-full flex justify-center pt-10">
                <div className={`font-digital text-5xl px-8 py-4 tracking-widest rounded-md shadow-lg
                    ${timeLeft <= 5 ? "animate-pulse text-red-500 bg-red-100" : "text-green-300 bg-gray-800"}
                `}>
                    {String(timeLeft).padStart(2, "0")}
                </div>
            </div>
            {/* Restul conținutului centrat pe verticală și orizontală */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 w-full max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Level 2 – Fix the Signal
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mb-6">
                    There’s a technical issue in the studio! Your mission is to identify the right equipment to solve each problem.
                    Use your knowledge as a broadcast engineer to make the correct choices.
                </p>
                <ul className="text-left text-sm md:text-base mb-8 max-w-xl list-disc list-inside leading-relaxed mx-auto">
                    <li>Look at the situation presented.</li>
                    <li>Choose the correct tool or device from the images.</li>
                    <li>Time is limited, think fast!</li>
                    <li>You will get a final score at the end.</li>
                </ul>
                <p className="mb-4 font-mono text-xl mt-8">
                    <span className="text-sm opacity-70">(Click anywhere to skip)</span>
                </p>
            </div>
        </div>
    );
}