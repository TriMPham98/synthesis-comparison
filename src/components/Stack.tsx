import { Text, useCursor } from "@react-three/drei";
import { Block } from "./Block";
import { useComparisonStore } from "../store/comparisonStore";
import { Plane } from "@react-three/drei";
import { useState, useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";

interface StackProps {
  side: "left" | "right";
  position: [number, number, number];
}

export function Stack({ side, position }: StackProps) {
  const count = useComparisonStore((state) => state[`${side}Stack`]);
  const mode = useComparisonStore((state) => state.mode);
  const setStack = useComparisonStore((state) => state.setStack);

  const [hovered, setHovered] = useState(false);
  const dragRef = useRef({
    isDragging: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    hasRemoved: false,
  });

  useCursor(hovered && mode === "addRemove");

  const blockHeight = 0.6;
  const totalHeight = count * blockHeight;
  const startY = position[1] - totalHeight / 2;
  const DRAG_THRESHOLD = 0.01; // Reduced threshold for lateral drags

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (mode === "addRemove") {
      e.stopPropagation();
      dragRef.current = {
        isDragging: true,
        startPosition: { x: e.point.x, y: e.point.y },
        currentPosition: { x: e.point.x, y: e.point.y },
        hasRemoved: false,
      };
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (
      mode === "addRemove" &&
      dragRef.current.isDragging &&
      !dragRef.current.hasRemoved
    ) {
      dragRef.current.currentPosition = { x: e.point.x, y: e.point.y };

      const deltaY = Math.abs(dragRef.current.startPosition.y - e.point.y);
      const deltaX = Math.abs(dragRef.current.startPosition.x - e.point.x);

      // Lateral drag (horizontal) detection to trigger removal
      if (
        deltaX > DRAG_THRESHOLD && // More sensitive to horizontal drag (lower threshold)
        deltaY < DRAG_THRESHOLD && // Ensure minimal vertical movement to trigger removal
        count > 0
      ) {
        setStack(side, count - 1);
        dragRef.current.hasRemoved = true;
      }
    }
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
    dragRef.current.hasRemoved = false;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (mode === "addRemove" && !dragRef.current.isDragging) {
      setStack(side, Math.min(10, count + 1));
    }
  };

  const textPosition: [number, number, number] = [
    position[0],
    startY + totalHeight + 0.5,
    position[2],
  ];

  const blocks = Array.from({ length: count }, (_, i) => {
    const isTopOrBottom = i === 0 || i === count - 1;
    const isTop = i === count - 1;
    return (
      <Block
        key={i}
        position={[position[0], startY + i * blockHeight, position[2]]}
        hover={mode === "addRemove"}
        isTopOrBottom={isTopOrBottom}
        isTop={isTop}
      />
    );
  });

  return (
    <group>
      {blocks}
      {mode === "addRemove" && (
        <Plane
          args={[1, Math.max(totalHeight + 0.5, blockHeight)]}
          position={[
            position[0],
            startY + (totalHeight - 0.5) / 2,
            position[2],
          ]}
          visible={false}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
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
