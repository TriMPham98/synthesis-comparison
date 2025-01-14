import { useRef } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { useFrame } from "@react-three/fiber";

interface BlockProps {
  position: [number, number, number];
  color?: string;
  hover?: boolean;
}

export function Block({
  position,
  color = "#46a2da",
  hover = false,
}: BlockProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;

      // Pulse opacity for all blocks when in hover mode
      if (hover && materialRef.current) {
        materialRef.current.opacity =
          0.625 + Math.sin(state.clock.elapsedTime * 2) * 0.125; // Oscillate between 0.5 and 0.75
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={hover ? 1.0 : 0.5}
        metalness={0.8}
        roughness={0.2}
        transparent={true} // Always enable transparency
        opacity={hover ? 0.75 : 1} // Initial opacity
      />
    </mesh>
  );
}
