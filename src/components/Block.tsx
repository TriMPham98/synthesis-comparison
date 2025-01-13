import { useRef } from "react";
import { Mesh } from "three";
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

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hover ? 1.0 : 0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}
