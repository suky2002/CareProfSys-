import { useEffect, useState } from "react";
import InfoPopup from "../components/InfoPopup";
import MarzipanoViewer from "../components/MarzipanoViewer";
import SurveillanceTask from "../components/SurveillanceTask";
import WiringTask from "../components/WiringTask";
import { useNavigate } from "react-router-dom";

// --- Overlays & Results Components ---

function ControlRoomStartOverlay({ onStart }) {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center text-center px-8">
            <div className="bg-white text-black p-8 rounded-2xl shadow-2xl max-w-xl border-4 border-blue-700">
                <h2 className="text-3xl font-extrabold mb-4">Welcome to Level 3: Control Room</h2>
                <p className="mb-6 text-base leading-relaxed">
                    This is the heart of the broadcast operation.<br />
                    Here you will monitor, troubleshoot, and control the live show.<br />
                    Complete all tasks to prove your skills!
                </p>
                <button
                    onClick={onStart}
                    className="bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-blue-800 transition-all"
                >
                    Start Level 3
                </button>
            </div>
        </div>
    );
}

function ControlRoomResults({ badges, results, onGoToHub, onAutoRecommend }) {
    const [secondsLeft, setSecondsLeft] = useState(20);

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);
        const timer = setTimeout(() => {
            onAutoRecommend();
        }, 20000);
        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [onAutoRecommend]);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center text-center px-8">
            <div className="bg-white text-black p-8 rounded-2xl shadow-2xl max-w-2xl border-4 border-green-700">
                <h2 className="text-3xl font-extrabold mb-4">Control Room Results</h2>
                <div className="flex flex-wrap justify-center gap-6 mb-6">
                    {badges.map((badge, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <img src={badge.image} alt={badge.label} className="w-24 h-24" />
                            <span className="mt-2 font-semibold">{badge.label} Badge</span>
                        </div>
                    ))}
                </div>
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">Task Review</h3>
                    <ul className="text-left space-y-2">
                        {results.map((res, idx) => (
                            <li key={idx} className="p-3 rounded bg-gray-100 mb-2">
                                <div className="font-bold">{res.task}</div>
                                <div>
                                    <span className="font-semibold">Your answer:</span>{" "}
                                    <span className={res.correct ? "text-green-600" : "text-red-600"}>
                                        {res.answer}
                                    </span>
                                </div>
                                {!res.correct && (
                                    <div>
                                        <span className="font-semibold">Correct answer:</span>{" "}
                                        <span className="text-green-600">{res.correctAnswer}</span>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <button
                    onClick={onGoToHub}
                    className="bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-blue-800 transition-all"
                >
                    Back to Review
                </button>
                <p className="mt-4 text-sm text-gray-500">
                    (Redirecting to course recommendations in <span className="font-bold">{secondsLeft}</span>s...)
                </p>
            </div>
        </div>
    );
}

function ReviewHub({ onGoToLevel1, onGoToLevel2, onGoToLevel3 }) {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center text-center px-8">
            <div className="bg-white text-black p-8 rounded-2xl shadow-2xl max-w-xl border-4 border-purple-700">
                <h2 className="text-3xl font-extrabold mb-4">Review & Navigation</h2>
                <p className="mb-6 text-base">Choose any stage to revisit or practice again:</p>
                <div className="flex flex-col gap-4">
                    <button onClick={onGoToLevel1} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold">Level 1: Studio</button>
                    <button onClick={onGoToLevel2} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold">Level 2: Fix the Signal</button>
                    <button onClick={onGoToLevel3} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-bold">Level 3: Control Room</button>
                </div>
            </div>
        </div>
    );
}

function RecomandariCursuri({ badges }) {
    let recomandari = [];
    if (badges.some(b => b.label === "Expert")) {
        recomandari = [
            "Advanced Broadcast Engineering",
            "Live Event Signal Flow Masterclass"
        ];
    } else if (badges.some(b => b.label === "Intermediate")) {
        recomandari = [
            "Intermediate Audio/Video Troubleshooting",
            "Broadcast Control Room Essentials"
        ];
    } else {
        recomandari = [
            "Broadcast Basics",
            "Introduction to Studio Equipment"
        ];
    }
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center text-center px-8">
            <div className="bg-white text-black p-8 rounded-2xl shadow-2xl max-w-xl border-4 border-yellow-700">
                <h2 className="text-3xl font-extrabold mb-4">Recommended Courses</h2>
                <ul className="mb-6 text-lg font-semibold space-y-2">
                    {recomandari.map((rec, idx) => (
                        <li key={idx} className="text-blue-700">{rec}</li>
                    ))}
                </ul>
                <p className="text-gray-700">You can always return to any level from the Review page!</p>
            </div>
        </div>
    );
}

// --- Main Scene ---

export default function ControlRoomScene() {
    const navigate = useNavigate();
    const [stage, setStage] = useState("start"); // start, main, results, hub, recommend
    const [showPopup, setShowPopup] = useState(null);
    const [showWiringTask, setShowWiringTask] = useState(false);
    const [taskDone, setTaskDone] = useState(false);
    const [showSurveillanceTask, setShowSurveillanceTask] = useState(false);

    // Pentru rezultate
    const [badges, setBadges] = useState([]);
    const [results, setResults] = useState([]);

    // Simulare taskuri și rezultate (înlocuiește cu logica reală după caz)
    const handleAllTasksDone = () => {
        setBadges([
            { label: "Expert", image: "/Imagini/badge3.png" }
        ]);
        setResults([
            { task: "Wiring Task", answer: "Correct", correct: true, correctAnswer: "Correct" },
            { task: "Surveillance Task", answer: "Wrong", correct: false, correctAnswer: "Correct" }
        ]);
        setStage("results");
    };

    useEffect(() => {
        const wasCompleted = localStorage.getItem("task_done");
        setTaskDone(!!wasCompleted);

        if (!wasCompleted) {
            const timer = setTimeout(() => {
                setShowWiringTask(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    // --- Stage logic ---

    if (stage === "start") {
        return <ControlRoomStartOverlay onStart={() => setStage("main")} />;
    }

    if (stage === "results") {
        return (
            <ControlRoomResults
                badges={badges}
                results={results}
                onGoToHub={() => setStage("hub")}
                onAutoRecommend={() => navigate("/course-recommendations")}
            />
        );
    }

    if (stage === "hub") {
        return (
            <ReviewHub
                onGoToLevel1={() => navigate("/level1")}
                onGoToLevel2={() => navigate("/fix-signal")}
                onGoToLevel3={() => setStage("main")}
            />
        );
    }

    if (stage === "recommend") {
        return <RecomandariCursuri badges={badges} />;
    }

    // --- Main Control Room Scene ---
    return (
        <div className="w-full h-screen relative">
            {showWiringTask ? (
                <WiringTask onTaskFinished={() => {
                    setShowWiringTask(false);
                    setShowSurveillanceTask(true);
                }} />
            ) : showSurveillanceTask ? (
                <SurveillanceTask onClose={() => {
                    setShowSurveillanceTask(false);
                    handleAllTasksDone(); // Simulează finalizarea taskurilor
                }} />
            ) : (
                <>
                    <MarzipanoViewer
                        image="/Imagini/8457178419_0d665f1afc_6k.jpg"
                        hotspots={[
                            {
                                yaw: 1.5,
                                pitch: 0,
                                type: "navigation",
                                label: "Back to Studio",
                                targetScene: "/"
                            },
                            {
                                yaw: 0,
                                pitch: 0,
                                type: "info",
                                label: "Control Room",
                                description: `This is a broadcast control room. Here operators manage live feeds, audio mixing, camera switching, graphics overlays and broadcast signals.

Broadcast engineer tasks:
• Monitor incoming video/audio signals.
• Control camera switching and program output.
• Adjust audio levels for different sources.
• Trigger video graphics or overlays.
• Maintain signal quality and troubleshoot issues in real-time.`
                            },
                            ...(taskDone
                                ? [
                                    {
                                        yaw: -0.6,
                                        pitch: 0.1,
                                        type: "surveillance",
                                        label: "Surveillance System",
                                    },
                                ]
                                : []),
                        ]}
                        onHotspotClick={(hotspot) => {
                            if (hotspot.type === "info") setShowPopup(hotspot);
                            if (hotspot.type === "navigation") navigate(hotspot.targetScene);
                            if (hotspot.type === "surveillance") setShowSurveillanceTask(true);
                        }}
                    />
                    <InfoPopup show={!!showPopup} onClose={() => setShowPopup(null)} hotspot={showPopup} />
                </>
            )}

            {taskDone && (
                <button
                    onClick={() => {
                        localStorage.removeItem("task_done");
                        window.location.reload();
                    }}
                    className="absolute bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded"
                >
                    RESET TASK
                </button>
            )}
        </div>
    );
}