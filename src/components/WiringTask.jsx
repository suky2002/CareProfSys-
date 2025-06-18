import { useEffect, useRef, useState } from 'react';

const allCables = [
    { id: 'red', img: '/assets/images/red.png' },
    { id: 'green', img: '/assets/images/green.png' },
    { id: 'yellow', img: '/assets/images/yellow.png' },
];

const targets = [
    { id: 'red', img: '/assets/images/rca-red.png' },
    { id: 'yellow', img: '/assets/images/rca-yellow.png' },
    { id: 'green', img: '/assets/images/rca-green.png' },
];

const WiringTask = ({ onTaskFinished }) => {
    const [connected, setConnected] = useState({});
    const [dragged, setDragged] = useState(null);
    const [cables] = useState(() => [...allCables].sort(() => Math.random() - 0.5));
    const [flashOverlay, setFlashOverlay] = useState(true);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showIntro, setShowIntro] = useState(true);
    const [incorrect, setIncorrect] = useState(false);
    const [showOutro, setShowOutro] = useState(false);
    const [showExtendPopup, setShowExtendPopup] = useState(false);
    const alarmRef = useRef(null);

    useEffect(() => {
        alarmRef.current = new Audio('/assets/sounds/emergency-alarm-with-reverb-29431.mp3');
        alarmRef.current.loop = true;

        const wasCompleted = localStorage.getItem('task_done');
        if (wasCompleted) {
            setShowIntro(false);
            setShowOutro(true);
        }

        const flashTimeout = setTimeout(() => setFlashOverlay(false), 3000);

        return () => {
            clearTimeout(flashTimeout);
            alarmRef.current?.pause();
            alarmRef.current = null;
        };
    }, []);

    useEffect(() => {
        let interval;
        if (!showIntro && timeLeft > 0 && Object.keys(connected).length < 3) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        }

        if (Object.keys(connected).length === 3) {
            localStorage.setItem('task_done', 'true');
            alarmRef.current?.pause();
            setTimeout(() => setShowOutro(true), 1000);
        }

        if (timeLeft === 0 && Object.keys(connected).length < 3) {
            setShowExtendPopup(true);
        }

        return () => clearInterval(interval);
    }, [showIntro, connected, timeLeft]);

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (dragged === targetId) {
            const successSound = new Audio('/assets/sounds/success.mp3');
            successSound.play();
            setConnected((prev) => ({ ...prev, [targetId]: dragged }));
        } else {
            setIncorrect(true);
            setTimeout(() => setIncorrect(false), 500);
        }
        setDragged(null);
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-black to-gray-900 text-white overflow-hidden font-sans">
            {flashOverlay && <div className="absolute inset-0 bg-red-700 bg-opacity-80 animate-pulse z-40"></div>}

            {showIntro && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
                    <div className="bg-white text-black p-8 rounded-2xl shadow-2xl text-center max-w-xl border-4 border-red-700">
                        <h2 className="text-2xl font-extrabold mb-4">EMERGENCY SYSTEM FAILURE</h2>
                        <p className="mb-6 text-base leading-relaxed">
                            A buffer delay of <strong>30 seconds</strong> has been triggered due to signal disruption.
                            Engineers must reconnect cables correctly within this time or the broadcast will fail.
                        </p>
                        <button
                            onClick={() => {
                                setShowIntro(false);
                                alarmRef.current?.play();
                            }}
                            className="bg-red-700 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-red-800 transition-all"
                        >
                            START TASK
                        </button>
                    </div>
                </div>
            )}

            {!showIntro && (
                <div className={`absolute top-6 right-6 font-digital text-4xl px-6 py-2 tracking-widest rounded-md z-40 shadow-lg ${timeLeft <= 10 ? 'animate-pulse text-red-500 bg-red-100' : 'text-green-300 bg-gray-800'
                    }`}>
                    {String(timeLeft).padStart(2, '0')}
                </div>
            )}

            <div className={`flex flex-col items-center justify-center min-h-screen pt-24 relative z-10 transition-all duration-500 ease-in-out ${incorrect ? 'bg-red-900 bg-opacity-10' : ''
                }`}>
                <div className="flex space-x-32 items-start">
                    <div className="flex flex-col justify-between h-[500px]">
                        {cables.map((c) => {
                            const isUsed = Object.values(connected).includes(c.id);
                            if (isUsed) return null;
                            return (
                                <img
                                    key={c.id}
                                    src={c.img}
                                    alt={c.id}
                                    draggable
                                    onDragStart={() => setDragged(c.id)}
                                    className={`w-36 h-auto cursor-move hover:scale-105 transform transition-transform duration-300 ${c.id === 'red' ? 'animate-pulse' : ''}`}
                                />
                            );
                        })}
                    </div>

                    <div className="flex flex-col justify-between h-[500px]">
                        {targets.map((t) => (
                            <div key={t.id} className="relative">
                                <img src={t.img} alt={t.id} className="w-40 h-auto drop-shadow-xl" />
                                <DropZone
                                    id={t.id}
                                    dragged={dragged}
                                    onDrop={handleDrop}
                                    isFilled={connected[t.id]}
                                    cableImg={allCables.find((c) => c.id === connected[t.id])?.img}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {showOutro && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black bg-opacity-80">
                        <div className="bg-white text-black p-8 rounded-2xl shadow-2xl text-center max-w-xl border-4 border-green-600">
                            <h2 className="text-2xl font-extrabold mb-4">TRANSMISSION RESTORED</h2>
                            <p className="mb-6 text-base leading-relaxed">
                                All cables were correctly reconnected. The live signal has been restored. Great job!
                            </p>
                            <button
                                onClick={() => {
                                    alarmRef.current?.pause();
                                    onTaskFinished?.();
                                    window.location.reload(); // ← refresh automat când revii din task
                                }}
                                className="bg-green-600 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-all"
                            >
                                BACK TO CONTROL ROOM
                            </button>

                        </div>
                    </div>
                )}

                {showExtendPopup && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
                        <div className="bg-white text-black p-6 rounded-2xl shadow-2xl text-center max-w-md border-4 border-red-500">
                            <h2 className="text-xl font-bold mb-4">Signal Failure Detected</h2>
                            <p className="mb-6 text-base">Request an additional 30 seconds?</p>
                            <button
                                className="bg-red-600 text-white text-md font-bold px-6 py-2 rounded hover:bg-red-700 transition-all"
                                onClick={() => {
                                    setTimeLeft(30);
                                    setShowExtendPopup(false);
                                }}
                            >
                                ADD 30 SECONDS
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DropZone = ({ id, dragged, onDrop, isFilled, cableImg }) => (
    <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onDrop(e, id)}
        className={`w-10 h-10 rounded-full border-4 transition-all duration-300 ease-in-out shadow-inner shadow-black ${dragged === id && !isFilled ? 'border-green-400 bg-green-900' : 'border-white'
            } ${isFilled ? 'bg-green-600' : 'bg-transparent'} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
    >
        {isFilled && cableImg && (
            <img src={cableImg} alt={id} className="absolute w-28 h-auto top-[-50%] left-[120%]" />
        )}
    </div>
);

export default WiringTask;