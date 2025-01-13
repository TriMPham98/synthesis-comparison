import { Text } from "@react-three/drei";
import { Block } from "./Block";
import { useComparisonStore } from "../store/comparisonStore";

interface StackProps {
  side: "left" | "right";
  position: [number, number, number];
}

export function Stack({ side, position }: StackProps) {
  const count = useComparisonStore((state) => state[`${side}Stack`]);
  const mode = useComparisonStore((state) => state.mode);

  const blocks = Array.from({ length: count }, (_, i) => (
    <Block
      key={i}
      position={[position[0], position[1] + i * 0.6, position[2]]}
      hover={mode === "addRemove"}
    />
  ));

  // Calculate text position above the stack
  const textPosition: [number, number, number] = [
    position[0],
    position[1] + count * 0.6 + 0.5, // Position above the highest block
    position[2],
  ];

  return (
    <group>
      {blocks}
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
