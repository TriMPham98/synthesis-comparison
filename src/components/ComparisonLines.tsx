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
  const { mode, studentLines, toggleStudentLine } = useComparisonStore();
  const leftStack = useComparisonStore((state) => state.leftStack);
  const rightStack = useComparisonStore((state) => state.rightStack);

  const [drawingLine, setDrawingLine] = useState<{
    start: THREE.Vector3;
    position: "top" | "bottom";
    currentEnd: THREE.Vector3;
  } | null>(null);
  const [hovered, setHovered] = useState(false);

  useCursor(hovered && mode === "drawCompare");

  const getLinePoints = (isTop: boolean) => {
    const leftHeight = leftStack * 0.6;
    const rightHeight = rightStack * 0.6;

    const leftBaseY = leftPos[1] - leftHeight / 2;
    const rightBaseY = rightPos[1] - rightHeight / 2;

    const leftX = leftPos[0] + 0.45;
    const rightX = rightPos[0] - 0.45;

    const BLOCK_HEIGHT = 0.5;

    if (isTop) {
      const leftTopBlockY = leftBaseY + leftHeight - 1.25 * BLOCK_HEIGHT;
      const rightTopBlockY = rightBaseY + rightHeight - 1.25 * BLOCK_HEIGHT;
      return [
        [leftX, leftTopBlockY, leftPos[2]] as const,
        [rightX, rightTopBlockY, rightPos[2]] as const,
      ] as const;
    } else {
      const leftBottomBlockY = leftBaseY;
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

    const baseY = stackPos[1] - (stackHeight * 0.6) / 2;
    const topY = baseY + stackHeight * 0.6 - BLOCK_HEIGHT;
    const bottomY = baseY + BLOCK_HEIGHT / 2;

    const xDistance = Math.abs(point.x - stackPos[0]);
    if (xDistance > 0.5) return null;

    const distanceThreshold = 0.3;

    if (Math.abs(point.y - topY) < distanceThreshold) return "top";
    if (Math.abs(point.y - bottomY) < distanceThreshold) return "bottom";
    return null;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (mode !== "drawCompare") return;

    const point = e.point.clone();

    if (!drawingLine) {
      // Starting a new line
      const position = isNearStackPoint(point, "left");

      if (position && !studentLines[position]) {
        setDrawingLine({
          start: point,
          position,
          currentEnd: point.clone(), // Initialize end point as start point
        });
      }
    } else {
      // Completing a line
      const endPosition = isNearStackPoint(point, "right");

      if (endPosition === drawingLine.position) {
        toggleStudentLine(drawingLine.position);
      }
      setDrawingLine(null);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const point = e.point.clone();

    if (mode === "drawCompare") {
      // Update line end point while drawing
      if (drawingLine) {
        setDrawingLine({
          ...drawingLine,
          currentEnd: point,
        });
      }

      // Update hover state
      const isNearLeft = isNearStackPoint(point, "left");
      const isNearRight = isNearStackPoint(point, "right");
      setHovered(!!isNearLeft || !!isNearRight);
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
            [
              drawingLine.currentEnd.x,
              drawingLine.currentEnd.y,
              drawingLine.currentEnd.z,
            ],
          ]}
          color="#ff00ff"
          lineWidth={3}
          dashed={true}
          dashSize={0.1} // Added smaller dash size
          gapSize={0.1} // Added matching gap size for even spacing
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      )}
    </group>
  );
}
