import { useRef } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import { useComparisonStore } from "../store/comparisonStore";

interface BlockProps {
  position: [number, number, number];
  color?: string;
  hover?: boolean;
  isTopOrBottom?: boolean;
}

export function Block({
  position,
  color = "#46a2da",
  hover = false,
  isTopOrBottom = false,
}: BlockProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const mode = useComparisonStore((state) => state.mode);

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;

      const shouldPulse = hover || (mode === "drawCompare" && isTopOrBottom);
      if (shouldPulse) {
        materialRef.current.opacity =
          0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.25;
      } else {
        materialRef.current.opacity = 1;
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
        emissiveIntensity={
          hover || (mode === "drawCompare" && isTopOrBottom) ? 1.0 : 0.5
        }
        metalness={0.8}
        roughness={0.2}
        transparent={true}
        opacity={0.75}
      />
    </mesh>
  );
}
