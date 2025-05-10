export const fixSignalTasks = [
    {
        id: 1,
        prompt: "The audio is distorted during the live show. What do you check first?",
        options: [
            { label: "Mixer", image: "/assets/fixsignal/audiomixer.png", isCorrect: true },
            { label: "Camera", image: "/assets/fixsignal/camera.png", isCorrect: false },
            { label: "SDI Cable", image: "/assets/fixsignal/cable.png", isCorrect: false },
            { label: "Control Panel", image: "/assets/fixsignal/techroom.png", isCorrect: false }
        ],
        explanation: "The audio mixer manages all audio signals. Distortion usually originates here."
    },
];