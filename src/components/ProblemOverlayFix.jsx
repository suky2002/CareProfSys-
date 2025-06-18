import { useEffect, useState } from "react";

export default function ProblemOverlayFix({ problem, onFinish }) {
    const [timeLeft, setTimeLeft] = useState(5);

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
            className="fixed inset-0 z-50 bg-black bg-opacity-85 text-white flex flex-col items-center justify-center text-center px-6 transition-opacity duration-500"
        >
            <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 font-digital text-5xl px-8 py-4 tracking-widest rounded-md shadow-lg
                ${timeLeft <= 2 ? "animate-pulse text-red-500 bg-red-100" : "text-green-300 bg-gray-800"}
            `}>
                {String(timeLeft).padStart(2, "0")}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-24">
                {problem}
            </h2>
            <p className="mt-6 text-sm opacity-70 font-mono">
                Auto starting in {timeLeft}s... or tap anywhere to begin.
            </p>
        </div>
    );
}
