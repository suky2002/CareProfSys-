import { useEffect, useState } from "react";

import InfoPopup from "../components/InfoPopup";
import InstructionOverlay from "../components/InstructionOverlay";
import MarzipanoViewer from "../components/MarzipanoViewer";
import SurveillanceTask from "../components/SurveillanceTask";
import WiringTask from "../components/WiringTask";
import { useNavigate } from "react-router-dom";

export default function ControlRoomScene() {
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(null);
    const [showInstructions, setShowInstructions] = useState(true);
    const [showWiringTask, setShowWiringTask] = useState(false);
    const [taskDone, setTaskDone] = useState(false);
    const [showSurveillanceTask, setShowSurveillanceTask] = useState(false);

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

    const hotspots = [
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
    ];

    return (
        <div className= "w-full h-screen relative" >
        {
            showWiringTask?(
        <WiringTask onTaskFinished = {() => setShowWiringTask(false)
} />
      ) : (
    <>
    <MarzipanoViewer
            image= "/assets/images/8457178419_0d665f1afc_6k.jpg"
hotspots = { hotspots }
onHotspotClick = {(hotspot) => {
    if (hotspot.type === "info") setShowPopup(hotspot);
    if (hotspot.type === "navigation") navigate(hotspot.targetScene);
    if (hotspot.type === "surveillance") setShowSurveillanceTask(true);
}}
          />
    < InfoPopup show = {!!showPopup} onClose = {() => setShowPopup(null)} hotspot = { showPopup } />
        { showInstructions && <InstructionOverlay onClose={ () => setShowInstructions(false) } />}
</>
      )}

{
    showSurveillanceTask && (
        <SurveillanceTask onClose={ () => setShowSurveillanceTask(false) } />
      )
}

{
    taskDone && (
        <button
          onClick={
        () => {
            localStorage.removeItem("task_done");
            window.location.reload();
        }
    }
    className = "absolute bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded"
        >
        RESET TASK
            </button>
      )
}
</div>
  );
}