import { Html } from "@react-three/drei";

export default function Hotspot({ position, label, onClick }) {
  return (
    <Html position={position} center>
      <button
        onClick={onClick}
        className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-md hover:bg-blue-700"
      >
        {label}
      </button>
    </Html>
  );
}
