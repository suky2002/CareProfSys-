import React from "react";
import { useNavigate } from "react-router-dom";

const allBadges = [
    { label: "Beginner", image: "/Imagini/badge1.png" },
    { label: "Intermediate", image: "/Imagini/badge2.png" },
    { label: "Expert", image: "/Imagini/badge3.png" },
];

const defaultBadgesByLevel = {
    "Level 1": [allBadges[0]],
    "Level 2": [allBadges[1]],
    "Level 3": [allBadges[2]],
};

function getSavedBadgesByLevel() {
    try {
        const saved = localStorage.getItem("badgesByLevel");
        if (saved) return JSON.parse(saved);
        return defaultBadgesByLevel;
    } catch {
        return defaultBadgesByLevel;
    }
}

// Example mistakes for each level
const defaultMistakes = {
    "Level 1": [
        {
            question: "What is the main function of the audio mixer?",
            yourAnswer: "To play music",
            correctAnswer: "To combine and control audio signals",
            tip: "Review the main functions of the audio mixer in a broadcast studio.",
        },
    ],
};

function getSavedMistakes() {
    try {
        const saved = localStorage.getItem("mistakesByLevel");
        if (saved) return JSON.parse(saved);
        return defaultMistakes;
    } catch {
        return defaultMistakes;
    }
}

const levels = [
    {
        key: "Level 1",
        title: "Level 1: Studio",
        description: "Learn the basics of the broadcast studio and equipment.",
        color: "from-blue-700 to-blue-900",
        route: "/level1",
    },
    {
        key: "Level 2",
        title: "Level 2: Fix the Signal",
        description: "Troubleshoot and repair signal flow issues.",
        color: "from-green-700 to-green-900",
        route: "/fix-signal",
    },
    {
        key: "Level 3",
        title: "Level 3: Control Room",
        description: "Operate and monitor the live control room.",
        color: "from-purple-700 to-blue-900",
        route: "/control-room",
    },
];

const ReviewHub = () => {
    const navigate = useNavigate();
    const badgesByLevel = getSavedBadgesByLevel();
    const mistakesByLevel = getSavedMistakes();

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-950 via-purple-900 to-blue-900 flex items-center justify-center px-2 py-8 overflow-auto">
            <div className="w-full max-w-6xl flex flex-col items-center gap-10">
                <h2 className="text-4xl font-extrabold text-white text-center drop-shadow-lg tracking-wide mb-4">
                    🏆 Review & Progress Hub
                </h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                    {levels.map((level) => (
                        <div
                            key={level.key}
                            className={`rounded-2xl shadow-lg p-6 flex flex-col items-center bg-gradient-to-br ${level.color} border-2 border-white`}
                        >
                            <div className="text-xl font-bold text-white mb-2 text-center">
                                {level.title}
                            </div>
                            <div className="text-white text-center mb-4">
                                {level.description}
                            </div>
                            <div className="flex gap-2 mb-4">
                                {(badgesByLevel[level.key] || []).map((badge, idx) => (
                                    <img
                                        key={idx}
                                        src={badge.image}
                                        alt={badge.label}
                                        className="w-10 h-10 object-contain rounded-full border-2 border-yellow-300 bg-white"
                                    />
                                ))}
                            </div>
                            {mistakesByLevel[level.key] &&
                                mistakesByLevel[level.key].length > 0 && (
                                    <div className="w-full bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                                        <div className="text-yellow-200 font-bold mb-2 text-center">
                                            Your Mistakes & Tips
                                        </div>
                                        <ul className="space-y-2 text-sm">
                                            {mistakesByLevel[level.key].map((m, idx) => (
                                                <li key={idx} className="text-white">
                                                    <div>
                                                        <span className="font-semibold">Q:</span> {m.question}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-red-200">
                                                            Your answer:
                                                        </span>{" "}
                                                        {m.yourAnswer}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-green-200">
                                                            Correct answer:
                                                        </span>{" "}
                                                        {m.correctAnswer}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-blue-200">Tip:</span>{" "}
                                                        {m.tip}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            <button
                                onClick={() => navigate(level.route)}
                                className="bg-white bg-opacity-90 text-blue-900 font-bold py-2 px-6 rounded-lg hover:bg-blue-100 transition-all"
                            >
                                Go to {level.title}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-4 w-full justify-center mt-6">
                    <button
                        onClick={() => navigate("/job-portal")}
                        className="bg-purple-800 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-purple-900 transition-all"
                    >
                        Go to Job Portal
                    </button>
                    <button
                        onClick={() => navigate("/course-recommendations")}
                        className="bg-blue-800 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-blue-900 transition-all"
                    >
                        See Course Recommendations
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewHub;