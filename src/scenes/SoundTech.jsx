import InfoPopup from "../components/InfoPopup";
import InstructionOverlay from "../components/InstructionOverlay";
import MarzipanoViewer from "../components/MarzipanoViewer"; // Assuming this handles Marzipano logic
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SoundTech() {
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(null);
    const [showInstructions, setShowInstructions] = useState(true);

    // Determine if mobile for image path (consider a more robust solution for production)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const imagePath = isMobile
        ? "http://192.168.1.147:5173/Main_Control_Room_pano.jpg" // Local IP for mobile dev
        : "/Main_Control_Room_pano.jpg"; // Relative path for web/desktop

    // Hotspot data with revised descriptions for a sound tech engineer
    const hotspots = [
        {
            yaw: 0,
            pitch: 0,
            type: "info",
            label: "Audio Mixer Console",
            description:
                "This is a professional audio mixer console, the central hub for managing all audio inputs in a broadcast or recording studio. It allows the sound engineer to blend, balance, and process various audio sources like microphones, music, and sound effects.\n\n**Sound Engineer Tasks:**\n• Adjust individual fader levels for each audio source.\n• Apply equalization (EQ) and compression to optimize sound.\n• Route audio signals to different outputs (e.g., broadcast, monitors).\n• Manage effects, such as reverb or delay.\n• Monitor audio levels to prevent clipping and ensure clear sound.\n\nThis console is crucial for creating a balanced and high-quality audio mix for the audience.",
            model: "/assets/models/mixer.glb", // Placeholder: Replace with your actual mixer model
            position: [50, 3, -5], // Adjust position relative to your pano scene
            scale: [0.8, 0.8, 0.8]  // Adjust scale as needed
        },
        {
            yaw: 0.5,
            pitch: 0.1,
            type: "info",
            label: "Studio Monitor Speakers (Near-field)",
            description: `
These are near-field studio monitor speakers, essential for sound engineers to hear a clear and accurate representation of the audio mix. Placed close to the engineer, they provide an uncolored sound, allowing for precise adjustments during production.

**Sound Engineer Tasks:**
• Calibrate speaker levels for an accurate monitoring environment.
• Listen critically for audio imperfections like hums, buzzes, or distortion.
• Adjust the mix based on the precise feedback from these monitors.
• Ensure consistent audio quality across all broadcast segments.

These monitors are the engineer's most reliable reference for what the audience will hear.
`,
            model: "/assets/models/speaker_monitor.glb", // Placeholder: Replace with your actual speaker model
            position: [5, -1, 2], // Adjust position
            scale: [1, 1, 1]     // Adjust scale
        },
        {
            yaw: 0.2,
            pitch: -0.8,
            type: "info",
            label: "Headphones (Studio Reference)",
            description: `
These are studio reference headphones, used by sound engineers for detailed audio monitoring. They offer isolation from external noise and provide a critical perspective on the audio mix, allowing for fine-tuning that might be missed on speakers.

**Sound Engineer Tasks:**
• Check for subtle audio nuances, clicks, or pops.
• Monitor individual tracks or specific audio feeds.
• Use for precise cueing and timing during live broadcasts.
• Ensure accurate stereo imaging and soundstage.

Headphones are indispensable for precise audio work, especially in a busy control room environment.
`,
            model: "/assets/models/headphones.glb" // Placeholder: Replace with your actual headphone model
        },
        {
            yaw: 2.6,
            pitch: 0,
            type: "info",
            label: "Audio Patch Bay",
            description: `
This is an audio patch bay, a crucial component in a control room for routing audio signals. It allows the sound engineer to quickly and flexibly connect various audio devices like microphones, processors, and recorders without re-cabling.

**Sound Engineer Tasks:**
• Configure signal flow for different recording or broadcast setups.
• Troubleshoot audio signal paths by re-patching connections.
• Integrate new equipment into the existing audio infrastructure.
• Ensure clean and secure connections to prevent signal loss.

The patch bay provides immense flexibility and efficiency in managing complex audio workflows.
`,
            model: "/assets/models/patch_bay.glb" // Placeholder: Replace with your actual patch bay model
        },
        {
            yaw: 3.1,
            pitch: 0.3,
            type: "info",
            label: "Rack-Mounted Audio Processors",
            description: `
These rack-mounted units house various audio processors like compressors, equalizers, and effects units. Sound engineers use these to enhance, shape, and control the dynamics and tone of audio signals before they go to air or are recorded.

**Sound Engineer Tasks:**
• Select and configure specific processors for different audio sources.
• Adjust settings (e.g., compression ratio, EQ frequencies) to achieve desired sound.
• Monitor signal levels entering and leaving the processors.
• Bypass or remove processors as needed for A/B comparison.

These tools are vital for achieving a polished and professional sound.
`,
            model: "/assets/models/rack_processors.glb" // Placeholder: Replace with your actual rack model
        },
        {
            yaw: -2.1,
            pitch: 0.1,
            type: "info",
            label: "Intercom System",
            description: `
This is an intercom system, essential for communication within the broadcast team. It allows the sound engineer to communicate with the director, camera operators, talent, and other crew members, ensuring synchronized production.

**Sound Engineer Tasks:**
• Maintain clear communication channels with all personnel.
• Relay cues and technical instructions.
• Listen for feedback and respond to requests from the team.
• Ensure microphones and headsets are functioning correctly.

Effective communication via the intercom is critical for a smooth and error-free broadcast.
`,
            model: "/assets/models/intercom.glb" // Placeholder: Replace with your actual intercom model
        },
        {
            yaw: -1.0,
            pitch: -0.22,
            type: "info",
            label: "Acoustic Treatment Panels",
            description: `
These are acoustic treatment panels, strategically placed to control sound reflections and improve the room's acoustics. In a control room, they help create a neutral listening environment, crucial for accurate audio mixing and monitoring.

**Sound Engineer Tasks:**
• Understand how room acoustics impact audio perception.
• Ensure panels are intact and functioning correctly.
• Identify potential acoustic issues (e.g., flutter echoes, standing waves).
• Optimize the listening environment for critical audio decisions.

Good acoustic treatment is fundamental for a sound engineer to produce high-quality audio.
`,
            model: "/assets/models/acoustic_panels.glb" // Placeholder: Replace with your actual acoustic panel model
        }
    ];

    return (
        <div className="w-full h-screen relative">
            {/* The MarzipanoViewer should occupy the full available space */}
            <MarzipanoViewer
                image={imagePath}
                hotspots={hotspots}
                onHotspotClick={(hotspot) => {
                    if (hotspot.type === "info") setShowPopup(hotspot);
                    if (hotspot.type === "navigation") navigate(hotspot.targetScene);
                }}
            />
            {/* Popups and overlays remain on top */}
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