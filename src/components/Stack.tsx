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
  const DRAG_THRESHOLD = 0.1; // Reduced threshold

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (mode === "addRemove") {
      console.log("Pointer down:", {
        point: e.point,
        mode,
        count,
      });

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
    if (mode === "addRemove" && dragRef.current.isDragging) {
      dragRef.current.currentPosition = { x: e.point.x, y: e.point.y };

      const deltaY = Math.abs(dragRef.current.startPosition.y - e.point.y);

      console.log("Pointer move:", {
        deltaY,
        threshold: DRAG_THRESHOLD,
        isDragging: dragRef.current.isDragging,
        hasRemoved: dragRef.current.hasRemoved,
        startY: dragRef.current.startPosition.y,
        currentY: e.point.y,
      });

      if (deltaY > DRAG_THRESHOLD && !dragRef.current.hasRemoved) {
        console.log("Attempting to remove block");
        setStack(side, Math.max(0, count - 1));
        dragRef.current.hasRemoved = true;
      }
    }
  };

  const handlePointerUp = () => {
    console.log("Pointer up:", dragRef.current);
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

  const blocks = Array.from({ length: count }, (_, i) => (
    <Block
      key={i}
      position={[position[0], startY + i * blockHeight, position[2]]}
      hover={mode === "addRemove"}
    />
  ));

  return (
    <group>
      {blocks}
      {mode === "addRemove" && (
        <Plane
          args={[1, Math.max(totalHeight + 0.6, blockHeight)]}
          position={[
            position[0],
            startY + (totalHeight - 0.6) / 2,
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
