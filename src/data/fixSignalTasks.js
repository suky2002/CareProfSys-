export const fixSignalTasks = [
  {
    id: 1,
    prompt: "The presenter's microphone is silent during a live interview. What do you check first?",
    options: [
      { label: "Microphone battery", image: "/Imagini/battery.png", isCorrect: true },
      { label: "Studio clock", image: "/Imagini/clock.png", isCorrect: false },
      { label: "Camera focus", image: "/Imagini/camera.png", isCorrect: false },
      { label: "Studio lights", image: "/assets/images/broadcast-lights.jpg", isCorrect: false }
    ],
    explanation: "A dead battery is a common cause for wireless microphones not working."
  },
  {
    id: 2,
    prompt: "The video feed from Camera 2 is flickering on the control monitor. What is the most likely cause?",
    options: [
      { label: "Loose SDI cable", image: "/Imagini/sdi.png", isCorrect: true },
      { label: "Microphone muted", image: "/Imagini/micmute.png", isCorrect: false },
      { label: "Studio door open", image: "/Imagini/studioopne.png", isCorrect: false },
      { label: "Presenter's earpiece", image: "/Imagini/presenterspeaker.png", isCorrect: false }
    ],
    explanation: "A loose or faulty SDI cable often causes video flicker or signal loss."
  },
  {
    id: 3,
    prompt: "There is a loud feedback noise in the studio speakers. What should you do?",
    options: [
      { label: "Move microphones away from speakers", image: "/Imagini/move.png", isCorrect: true },
      { label: "Turn off studio lights", image: "/Imagini/off.png", isCorrect: false },
      { label: "Adjust camera iris", image: "/Imagini/camera-iris.png", isCorrect: false },
      { label: "Check teleprompter", image: "/Imagini/teleprompter.png", isCorrect: false }
    ],
    explanation: "Feedback is usually caused by microphones picking up sound from nearby speakers."
  },
  {
    id: 4,
    prompt: "The on-air light does not turn on when broadcasting starts. What do you check?",
    options: [
      { label: "Control room relay", image: "/Imagini/relay.png", isCorrect: true },
      { label: "Camera tripod", image: "/Imagini/tripod.png", isCorrect: false },
      { label: "Presenter's script", image: "/Imagini/script.png", isCorrect: false },
      { label: "Studio clock", image: "/Imagini/clock.png", isCorrect: false }
    ],
    explanation: "The relay in the control room triggers the on-air light. If faulty, the light won't turn on."
  },
  {
    id: 5,
    prompt: "The live stream audio is delayed compared to the video. What is a likely cause?",
    options: [
      { label: "Audio processing latency", image: "/Imagini/latency.png", isCorrect: true },
      { label: "Camera lens dirty", image: "/Imagini/lens.png", isCorrect: false },
      { label: "Studio door open", image: "/Imagini/studioopne.png", isCorrect: false },
      { label: "Presenter's earpiece", image: "/Imagini/presenterspeaker.png", isCorrect: false }
    ],
    explanation: "Audio processing or encoding can introduce latency, causing sync issues."
  }
];