import { Line, Plane } from "@react-three/drei";
import { useComparisonStore } from "../store/comparisonStore";
import { useState } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";

interface ComparisonLinesProps {
  leftPos: [number, number, number];
  rightPos: [number, number, number];
}

export function ComparisonLines({ leftPos, rightPos }: ComparisonLinesProps) {
  const { mode, showAutoLines, studentLines, toggleStudentLine } =
    useComparisonStore();
  const leftStack = useComparisonStore((state) => state.leftStack);
  const rightStack = useComparisonStore((state) => state.rightStack);

  const [drawingLine, setDrawingLine] = useState<{
    start: THREE.Vector3;
    position: "top" | "bottom";
  } | null>(null);
  const [hovered, setHovered] = useState(false);

  useCursor(hovered && mode === "drawCompare");

  const getLinePoints = (isTop: boolean) => {
    const leftHeight = leftStack * 0.6;
    const rightHeight = rightStack * 0.6;

    // Calculate base positions (bottom of stacks)
    const leftBaseY = leftPos[1] - leftHeight / 2;
    const rightBaseY = rightPos[1] - rightHeight / 2;

    // Adjust x positions to align closer to block edges (blocks are 1 unit wide)
    const leftX = leftPos[0] + 0.45; // Move to inner edge of left block
    const rightX = rightPos[0] - 0.45; // Move to inner edge of right block

    const BLOCK_HEIGHT = 0.5;

    if (isTop) {
      // For top line, align with center of top blocks
      const leftTopBlockY = leftBaseY + leftHeight - 1.25 * BLOCK_HEIGHT;
      const rightTopBlockY = rightBaseY + rightHeight - 1.25 * BLOCK_HEIGHT;
      return [
        [leftX, leftTopBlockY, leftPos[2]] as const,
        [rightX, rightTopBlockY, rightPos[2]] as const,
      ] as const;
    } else {
      // For bottom line, align with center of bottom blocks
      const leftBottomBlockY = leftBaseY; // Move up by quarter block
      const rightBottomBlockY = rightBaseY;
      return [
        [leftX, leftBottomBlockY, leftPos[2]] as const,
        [rightX, rightBottomBlockY, rightPos[2]] as const,
      ] as const;
    }
  };

  const isNearStackPoint = (
    point: THREE.Vector3,
    side: "left" | "right"
  ): "top" | "bottom" | null => {
    const stackPos = side === "left" ? leftPos : rightPos;
    const stackHeight = side === "left" ? leftStack : rightStack;
    const BLOCK_HEIGHT = 0.5;

    // Calculate base position (bottom of stack)
    const baseY = stackPos[1] - (stackHeight * 0.6) / 2;

    // Calculate center points of top and bottom blocks
    const topY = baseY + stackHeight * 0.6 - BLOCK_HEIGHT; // Center of top block
    const bottomY = baseY + BLOCK_HEIGHT / 2; // Center of bottom block

    // Check if point is near the x-coordinate of the stack
    const xDistance = Math.abs(point.x - stackPos[0]);
    if (xDistance > 0.5) return null;

    const distanceThreshold = 0.3;

    if (Math.abs(point.y - topY) < distanceThreshold) return "top";
    if (Math.abs(point.y - bottomY) < distanceThreshold) return "bottom";
    return null;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (mode !== "drawCompare") {
      console.log("Click ignored - not in compare mode");
      return;
    }

    const point = e.point.clone();
    console.log("Click detected at:", point);

    if (!drawingLine) {
      // Starting a new line
      const position = isNearStackPoint(point, "left");
      console.log("Checking left stack point:", position);

      if (position && !studentLines[position]) {
        console.log("Starting line at position:", position);
        setDrawingLine({ start: point, position });
      } else {
        console.log("Invalid start position:", {
          position,
          existingLine: position ? studentLines[position] : null,
        });
      }
    } else {
      // Completing a line
      const endPosition = isNearStackPoint(point, "right");
      console.log("Checking end position:", endPosition);

      if (endPosition === drawingLine.position) {
        console.log("Completing line at position:", endPosition);
        toggleStudentLine(drawingLine.position);
      } else {
        console.log("Invalid end position:", {
          expected: drawingLine.position,
          got: endPosition,
        });
      }
      setDrawingLine(null);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (mode === "drawCompare") {
      const point = e.point.clone();
      const isNearLeft = isNearStackPoint(point, "left");
      const isNearRight = isNearStackPoint(point, "right");
      const wasHovered = hovered;
      const newHovered = !!isNearLeft || !!isNearRight;

      if (wasHovered !== newHovered) {
        console.log("Hover state changed:", {
          nearLeft: isNearLeft,
          nearRight: isNearRight,
          hovered: newHovered,
        });
      }

      setHovered(newHovered);
    }
  };

  return (
    <group>
      <Plane
        args={[20, 20]}
        position={[0, 0, -0.1]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        visible={false}>
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      {showAutoLines && (
        <>
          <Line
            points={getLinePoints(true)}
            color="#00ffff"
            lineWidth={2}
            dashed={false}
            transparent
            opacity={0.6}
            toneMapped={false}
          />
          <Line
            points={getLinePoints(false)}
            color="#00ffff"
            lineWidth={2}
            dashed={false}
            transparent
            opacity={0.6}
            toneMapped={false}
          />
        </>
      )}
      {studentLines.top && (
        <Line
          points={getLinePoints(true)}
          color="#ff00ff"
          lineWidth={3}
          dashed={false}
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      )}
      {studentLines.bottom && (
        <Line
          points={getLinePoints(false)}
          color="#ff00ff"
          lineWidth={3}
          dashed={false}
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      )}
      {drawingLine && (
        <Line
          points={[
            [drawingLine.start.x, drawingLine.start.y, drawingLine.start.z],
            getLinePoints(drawingLine.position === "top")[1],
          ]}
          color="#ff00ff"
          lineWidth={3}
          dashed={true}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      )}
    </group>
  );
}
