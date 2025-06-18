import { useState } from "react";

const videos = [
    { id: 1, src: "/assets/sounds/cam1.mp4", isCorrupted: false, label: "Channel 1", description: "Entertainment program" },
    { id: 2, src: "/assets/sounds/cam2.mp4", isCorrupted: false, label: "Channel 2", description: "Documentary airing" },
    { id: 3, src: "/assets/sounds/error.mp4", isCorrupted: true, label: "Channel 3", description: "" },
    { id: 4, src: "/assets/sounds/cam4.mp4", isCorrupted: false, label: "Channel 4", description: "Marvel series in progress" },
];

const programs = [
    { id: "breaking", label: "Breaking news", img: "/assets/images/breaking.jpg" },
    { id: "marvel", label: "Marvel movie", img: "/assets/images/marvel.jpg" },
    { id: "doc", label: "Documentary", img: "/assets/images/doc.jpg" },
    { id: "netflix", label: "Netflix style", img: "/assets/images/netflix.jpg" },
    { id: "public", label: "Public viewing", img: "/assets/images/public.jpg" },
    { id: "follow", label: "Follow this", img: "/assets/images/follow.jpg" },
];

const correctProgramId = "breaking"; // only one correct program for the corrupted channel

export default function SurveillanceTask({ onClose }) {
    const [draggedProgram, setDraggedProgram] = useState(null);
    const [overlayedScreen, setOverlayedScreen] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    const handleDrop = (screenId) => {
        if (!overlayedScreen) {
            setOverlayedScreen({ screenId, program: draggedProgram });
            setDraggedProgram(null);
        }
    };

    const handleSubmit = () => {
        if (!overlayedScreen) return;
        const corruptedChannelId = videos.find((v) => v.isCorrupted)?.id;
        const correct =
            overlayedScreen.screenId === corruptedChannelId &&
            overlayedScreen.program.id === correctProgramId;
        if (correct) {
            setIsCorrect(true);
            setSubmitted(true);
        } else {
            setIsCorrect(false);
            setSubmitted(false);
            setOverlayedScreen(null);
        }
    };

    const handleBack = () => {
        onClose();
    };

    if (showIntro) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-90 text-white flex flex-col items-center justify-center p-4 z-50">
                <div className="max-w-2xl text-center">
                    <h2 className="text-xl font-bold mb-4">Emergency broadcast replacement</h2>
                    <p className="text-sm mb-4">
                        One of the channels has lost its signal. Identify the affected channel and drag the correct replacement program into it. Hint: You must broadcast "Breaking news" to restore it. If you're wrong, try again.
                    </p>
                    <button
                        onClick={() => setShowIntro(false)}
                        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Start task
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-between p-4 z-50 overflow-y-auto">
            <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-2">Emergency broadcast replacement</h2>
                <p className="text-sm text-gray-300 mb-4">
                    One of the channels has lost its signal. Drag and drop the correct program into the affected channel to resume broadcasting.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {videos.map((v) => (
                    <div key={v.id} className="relative border border-gray-600 w-[380px] h-[214px]">
                        <video
                            src={v.src}
                            autoPlay
                            muted
                            loop
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                            {v.label}
                        </div>
                        {!v.isCorrupted && (
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                                {v.description}
                            </div>
                        )}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(v.id)}
                            className="absolute inset-0"
                        >
                            {overlayedScreen?.screenId === v.id && (
                                <img
                                    src={overlayedScreen.program.img}
                                    alt={overlayedScreen.program.label}
                                    className="absolute inset-0 w-full h-full object-contain bg-black bg-opacity-70 p-6"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex space-x-4 mt-4 overflow-x-auto border-t border-gray-600 pt-4">
                {programs.map((p) => (
                    <div className="text-center" key={p.id}>
                        <img
                            src={p.img}
                            alt={p.label}
                            draggable={!overlayedScreen && !submitted}
                            onDragStart={() => setDraggedProgram(p)}
                            className={`w-28 h-20 border-2 ${draggedProgram?.id === p.id ? "border-green-400" : "border-white"
                                } cursor-move hover:scale-105 transition-transform mb-1`}
                        />
                        <div className="text-xs text-white">{p.label}</div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center">
                <button
                    onClick={handleSubmit}
                    disabled={!overlayedScreen}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-30"
                >
                    Submit program
                </button>
                {submitted && isCorrect && (
                    <div className="mt-4">
                        <div className="text-green-400 font-bold">Transmission restored successfully</div>
                        <button
                            onClick={handleBack}
                            className="mt-2 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                        >
                            Back to control room
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}