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

  // Calculate vertical position based on right stack position and height
  const blockHeight = 0.6;
  const totalRightHeight = rightStack * blockHeight;
  const rightStackBase = rightPos[1] - totalRightHeight / 2; // Base position of right stack
  const verticalCenter = rightStackBase + totalRightHeight / 2; // Center of right stack

  // Calculate centered position between stacks
  const position: [number, number, number] = [
    (leftPos[0] + rightPos[0]) / 2, // Center horizontally
    verticalCenter - 0.3, // Center vertically relative to right stack's actual position
    0,
  ];

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
