import { Text, useCursor } from "@react-three/drei";
import { Block } from "./Block";
import { useComparisonStore } from "../store/comparisonStore";
import { Plane } from "@react-three/drei";
import { useState } from "react";
import { ThreeEvent } from "@react-three/fiber";

interface StackProps {
  side: "left" | "right";
  position: [number, number, number];
}

export function Stack({ side, position }: StackProps) {
  const count = useComparisonStore((state) => state[`${side}Stack`]);
  const mode = useComparisonStore((state) => state.mode);
  const setStack = useComparisonStore((state) => state.setStack);

  // Calculate the middle point for stacking
  const blockHeight = 0.6;
  const totalHeight = count * blockHeight;
  const startY = position[1] - totalHeight / 2;

  // Handle click on the stack
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && mode === "addRemove");

  const handleStackClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (mode === "addRemove") {
      const newCount = Math.min(10, count + 1);
      setStack(side, newCount);
    }
  };

  const blocks = Array.from({ length: count }, (_, i) => (
    <Block
      key={i}
      position={[position[0], startY + i * blockHeight, position[2]]}
      hover={mode === "addRemove"}
    />
  ));

  // Calculate text position above the stack
  const textPosition: [number, number, number] = [
    position[0],
    startY + totalHeight + 0.5,
    position[2],
  ];

  return (
    <group>
      {blocks}
      {/* Invisible clickable plane that extends above the stack */}
      {mode === "addRemove" && (
        <Plane
          args={[1, totalHeight + 0.6]} // Height covers stack + extra space
          position={[
            // Adjusted center position
            position[0],
            startY + (totalHeight - 0.6) / 2,
            position[2],
          ]}
          visible={false}
          onClick={handleStackClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        />
      )}
      <Text
        position={textPosition}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000">
        {count}
      </Text>
    </group>
  );
}
