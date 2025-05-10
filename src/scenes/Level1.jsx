import InfoPopup from "../components/InfoPopup";
import InstructionOverlay from "../components/InstructionOverlay";
import MarzipanoViewer from "../components/MarzipanoViewer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Level1() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const hotspots = [
    {
      yaw: 0,
      pitch: 0,
      type: "info",
      label: "Broadcast Studio Camera",
      description:
        "This is a professional studio camera used to record or broadcast live shows. It delivers high-quality video and allows operators to zoom, focus, and adjust colors.\n\nBroadcast engineer tasks:\n• Set up and align the camera.\n• Connect the camera via SDI or fiber cables.\n• Calibrate image (color, exposure).\n• Monitor signal quality.\n• Troubleshoot to avoid disruptions.\n• Coordinate with the control room.\n\nLegend:\nSDI: Serial Digital Interface (cable for uncompressed video)\nFiber: Optical cables for stable high-speed transfer.",
      model: "/assets/models/camera.obj",
      position: [50, 3, -5], // Camera position
      scale: [0.8, 0.8, 0.8] // Camera scale
    },
    {
      yaw: 0.5,
      pitch: 0.1,
      type: "info",
      label: "Studio Spotlight",
      description: `
      This spotlight is used in TV studios to light up presenters, guests, or key areas of the set. It produces strong, focused light and is mounted on an adjustable stand so it can be aimed precisely where needed.

      Broadcast engineer tasks:
      • Position and secure the spotlight on set.
      • Adjust brightness and angle based on the scene.
      • Connect it safely to the studio’s power system.
      • Ensure even lighting without shadows or glare.
      • Replace bulbs and check for overheating if needed.

      Spotlights help create a professional look and make sure everyone on screen is clearly visible.
    `,
      model: "/assets/models/standerlight.glb",
      position: [5, -1, 2], // Spotlight position
      scale: [1, 1, 1] // Spotlight scale
    }, 
     {
    yaw: 0.2,
    pitch:-0.8,
    type: "info",
    label: "Floodlight / Spotlight",
    description: `
    This spotlight is used in TV studios to light up specific areas of the set. It's often mounted on the ceiling and can be positioned precisely to illuminate presenters, guests, or key parts of the studio.

    Broadcast engineer tasks:
    • Position the spotlight to focus on key areas of the set.
    • Adjust brightness and angle based on the scene.
    • Ensure it’s safely connected to the studio's power system.
    • Monitor for overheating and replace bulbs when needed.

    Legend:
    • Floodlight: Provides wide, even lighting across a large area.
    • Spotlight: Focused light used to highlight specific areas or objects.
    `,
    model: "/assets/models/light.glb" // Adjust path to the appropriate model if available
  }, 
  {
    yaw: 2.6,
    pitch: 0,
    type: "info",
    label: "Studio Monitor Speaker",
    description: `
    This is a high-performance studio monitor speaker, designed for accurate audio reproduction. It is commonly used in broadcast and recording studios to ensure that sound is heard with clarity and precision. These speakers are typically used for mixing, mastering, and sound checks to monitor the audio quality during production.

    Broadcast engineer tasks:
    • Position the speakers for optimal sound distribution.
    • Adjust the volume and EQ settings to suit the studio environment.
    • Ensure the speakers are correctly connected to the sound system.
    • Monitor audio output for clarity and balance during live broadcasts or recordings.

    Studio monitors like this are essential for ensuring sound fidelity and preventing issues during live broadcasts.
    `,
    model: "/assets/models/Speaker.glb" // Adjust path to the appropriate model if available
  }, 
  {
    yaw: 3.1,
    pitch: 0.3,
    type: "info",
    label: "Broadcast Studio Monitors",
    description: `
    These are professional video monitors used in television studios or broadcasting environments. They allow technicians and crew to monitor the live feed, ensuring that the broadcast signal is transmitted clearly and accurately. The monitors are usually connected to video sources, such as cameras or video recorders, and display the output of the production.

    Broadcast engineer tasks:
    • Set up and connect the monitors to video sources.
    • Calibrate the monitor settings (brightness, contrast, color balance).
    • Monitor the video feed to ensure it meets broadcast standards.
    • Troubleshoot any visual or signal issues during the broadcast.
    • Adjust the feed and settings in real-time as required.

    Broadcast monitors are essential in any live broadcast or recording studio, as they ensure the video output is correct and clear for viewers at home.
    `,
    model: "/assets/models/Floor Monitor.glb" // Adjust path to the appropriate model if available
  },
  {
    yaw: -2.1,
    pitch: 0.1,
    type: "info",
    label: "Camera Crane (Jib)",
    description: `
    This piece of equipment allows for smooth, high-angle camera shots that can move vertically or horizontally, often used for sweeping views or dramatic transitions during live broadcasts, TV shows, or film productions. The camera is mounted at the end of the arm, and it can be controlled from the base, allowing the operator to capture wide or overhead shots.

    Broadcast engineer tasks:
    • Set up and balance the camera on the crane.
    • Operate the crane to capture dynamic shots.
    • Ensure the camera is properly calibrated (focus, zoom, exposure).
    • Monitor the camera feed for quality and adjust as needed.
    • Ensure that the crane is moved smoothly without sudden jerks, which could cause shaky footage.

    Camera cranes are essential in production studios to capture shots that would be difficult or impossible with fixed-position cameras.    `,
    model: "/assets/models/light.glb" // Adjust path to the appropriate model if available
  }, 
  {
    yaw: -1.0,
    pitch: -0.22,
    type: "info",
    label: "Green Screen",
    description: `
    This is a green screen, used in television and film production for chroma keying. The green background is replaced with digital imagery or video in post-production, creating the illusion of different environments or settings.

    Broadcast engineer tasks:
    • Set up and align the green screen in the studio.
    • Ensure even lighting to avoid shadows.
    • Monitor the quality of the keying during live production.
    • Coordinate with the control room for seamless integration of virtual backgrounds.

    Green screens are commonly used for weather reports, movies, or news broadcasts.
  `,
    model: "/assets/models/greenscreen.obj"
  }
  ];

  return (
  <div className="w-full h-screen relative">
    <MarzipanoViewer
      image="/tv_studio_16k.jpg"
      hotspots={hotspots}
      onHotspotClick={(hotspot) => {
        if (hotspot.type === "info") setShowPopup(hotspot);
        if (hotspot.type === "navigation") navigate(hotspot.targetScene);
      }}
    />
    <InfoPopup show={!!showPopup} onClose={() => setShowPopup(null)} hotspot={showPopup} />
    {showInstructions && <InstructionOverlay onClose={() => setShowInstructions(false)} />}
    <button
      onClick={() => navigate("/quiz")}
      className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow"
    >
      Are you ready? Start Quiz
    </button>
  </div>
);
}
