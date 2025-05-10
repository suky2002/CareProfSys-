import { useEffect } from "react";

export default function InstructionOverlay({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col justify-center items-center text-white px-8 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Broadcasting Engineer – Onboarding
      </h1>
      <p className="text-lg md:text-xl max-w-2xl mb-6">
        Welcome to your immersive challenge! You will explore a real TV studio
        and interact with the equipment used by broadcasting engineers.
        Learn about each device and prepare to take the technical knowledge test before the next challenge.
      </p>
      <ul className="text-left text-sm md:text-base mb-8 max-w-xl list-disc list-inside leading-relaxed">
        <li><strong>Click</strong> on the info icons to explore each device.</li>
        <li><strong>Interact</strong> with 3D models or live embeds inside the popups.</li>
        <li>Each device includes <strong>real engineer tasks</strong> for context.</li>
    
      </ul>
      <button
        onClick={onClose}
        className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded shadow-lg transition duration-300"
      >
        ENTER THE STUDIO
      </button>
    </div>
  );
}
