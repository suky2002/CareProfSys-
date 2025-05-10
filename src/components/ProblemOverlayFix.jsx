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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Current Problem</h2>
            <p className="text-lg md:text-xl max-w-2xl leading-relaxed">{problem}</p>
            <p className="mt-6 text-sm opacity-70 font-mono">
                Auto starting in {timeLeft}s... or tap anywhere to begin.
            </p>
        </div>
    );
}