import { BackSide, TextureLoader } from "three";

import { useLoader } from "@react-three/fiber";

export default function PanoramaSphere({ texture }) {
  const map = useLoader(TextureLoader, texture);

  return (
    <mesh scale={[-500, 500, 500]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial map={map} side={BackSide} />
    </mesh>
  );
}
