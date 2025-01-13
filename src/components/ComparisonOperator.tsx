import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";
import { useComparisonStore } from "../store/comparisonStore";

interface ComparisonOperatorProps {
  leftPos: [number, number, number];
  rightPos: [number, number, number];
}

export function ComparisonOperator({
  leftPos,
  rightPos,
}: ComparisonOperatorProps) {
  const groupRef = useRef<Group>(null);
  const leftStack = useComparisonStore((state) => state.leftStack);
  const rightStack = useComparisonStore((state) => state.rightStack);

  // Calculate the comparison operator
  const getOperator = () => {
    if (leftStack < rightStack) return "<";
    if (leftStack > rightStack) return ">";
    return "=";
  };

  // Calculate position between stacks
  const position: [number, number, number] = [
    (leftPos[0] + rightPos[0]) / 2,
    (Math.max(leftStack, rightStack) * 0.6) / 2,
    0,
  ];

  useFrame((state) => {
    if (groupRef.current) {
      // Add subtle floating animation
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
      // Add subtle rotation
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Text
        fontSize={1}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000">
        {getOperator()}
      </Text>
    </group>
  );
}
