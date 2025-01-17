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
  const { mode, studentLines, setStudentLine } = useComparisonStore();
  const leftStack = useComparisonStore((state) => state.leftStack);
  const rightStack = useComparisonStore((state) => state.rightStack);

  const [drawingLine, setDrawingLine] = useState<{
    start: THREE.Vector3;
    position: "top" | "bottom";
    startSide: "left" | "right";
    currentEnd: THREE.Vector3;
  } | null>(null);
  const [hovered, setHovered] = useState(false);

  useCursor(hovered && mode === "drawCompare");

  const getLinePoints = (isTop: boolean) => {
    const BLOCK_HEIGHT = 0.5;
    const leftHeight = Math.max(leftStack * 0.6, BLOCK_HEIGHT);
    const rightHeight = Math.max(rightStack * 0.6, BLOCK_HEIGHT);

    const leftBaseY = leftPos[1] - leftHeight / 2;
    const rightBaseY = rightPos[1] - rightHeight / 2;

    const leftX = leftPos[0] + 0.45;
    const rightX = rightPos[0] - 0.45;

    if (rightStack === 0) {
      const leftTopEdge = leftBaseY + leftHeight;
      const leftTopBlockY = leftTopEdge - BLOCK_HEIGHT * 0.8;
      const leftBottomBlockY = leftBaseY - BLOCK_HEIGHT * 0.2;

      const leftSpan = leftTopBlockY - leftBottomBlockY;
      const horizontalDistance = rightX - leftX;
      const convergenceY = (leftTopBlockY + leftBottomBlockY) / 2;

      const rightY = convergenceY;

      return [
        [leftX, isTop ? leftTopBlockY : leftBottomBlockY, leftPos[2]] as const,
        [rightX, rightY, rightPos[2]] as const,
      ] as const;
    }

    if (isTop) {
      const leftTopEdge = leftBaseY + leftHeight;
      const rightTopEdge = rightBaseY + rightHeight;

      const leftTopBlockY = leftTopEdge - BLOCK_HEIGHT * 0.8;
      const rightTopBlockY = rightTopEdge - BLOCK_HEIGHT * 0.8;

      return [
        [leftX, leftTopBlockY, leftPos[2]] as const,
        [rightX, rightTopBlockY, rightPos[2]] as const,
      ] as const;
    } else {
      const leftBottomBlockY = leftBaseY - BLOCK_HEIGHT * 0.2;
      const rightBottomBlockY = rightBaseY - BLOCK_HEIGHT * 0.2;

      return [
        [leftX, leftBottomBlockY, leftPos[2]] as const,
        [rightX, rightBottomBlockY, rightPos[2]] as const,
      ] as const;
    }
  };

  const getSnapPoint = (
    side: "left" | "right",
    position: "top" | "bottom"
  ): THREE.Vector3 => {
    const points = getLinePoints(position === "top");
    const [leftPoint, rightPoint] = points;
    const point = side === "left" ? leftPoint : rightPoint;
    return new THREE.Vector3(point[0], point[1], point[2]);
  };

  const isNearStackPoint = (
    point: THREE.Vector3,
    side: "left" | "right",
    preferredPosition?: "top" | "bottom"
  ): "top" | "bottom" | null => {
    const stackPos = side === "left" ? leftPos : rightPos;
    const stackCount = side === "left" ? leftStack : rightStack;
    const BLOCK_HEIGHT = 0.5;

    const xDistance = Math.abs(point.x - stackPos[0]);
    if (xDistance > 0.5) return null;

    const Y_THRESHOLD = 0.5;

    if (stackCount === 0) {
      const baseY = stackPos[1] - BLOCK_HEIGHT * 0.75;
      const singlePointY = baseY + BLOCK_HEIGHT / 2;

      const topDistance = Math.abs(point.y - singlePointY);
      const bottomDistance = Math.abs(point.y - baseY);

      if (preferredPosition === "top" && topDistance < Y_THRESHOLD)
        return "top";
      if (preferredPosition === "bottom" && bottomDistance < Y_THRESHOLD)
        return "bottom";

      if (topDistance < Y_THRESHOLD) return "top";
      if (bottomDistance < Y_THRESHOLD) return "bottom";
      return null;
    }

    const stackHeight = stackCount * 0.6;
    const baseY = stackPos[1] - stackHeight / 2;
    const topY = baseY + stackHeight - BLOCK_HEIGHT;
    const bottomY = baseY + BLOCK_HEIGHT / 2;

    const topDistance = Math.abs(point.y - topY);
    const bottomDistance = Math.abs(point.y - bottomY);

    if (preferredPosition === "top" && topDistance < Y_THRESHOLD) return "top";
    if (preferredPosition === "bottom" && bottomDistance < Y_THRESHOLD)
      return "bottom";

    if (topDistance < Y_THRESHOLD) return "top";
    if (bottomDistance < Y_THRESHOLD) return "bottom";
    return null;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (mode !== "drawCompare") return;

    const point = e.point.clone();

    if (!drawingLine) {
      const leftPosition = isNearStackPoint(point, "left");
      const rightPosition = isNearStackPoint(point, "right");

      const preferredPosition = leftPosition || rightPosition;

      const finalLeftPosition = preferredPosition
        ? isNearStackPoint(point, "left", preferredPosition)
        : leftPosition;
      const finalRightPosition = preferredPosition
        ? isNearStackPoint(point, "right", preferredPosition)
        : rightPosition;

      const position = studentLines.top ? "bottom" : "top";

      if (finalLeftPosition) {
        const snapPoint = getSnapPoint("left", position);
        setDrawingLine({
          start: snapPoint,
          position: position,
          startSide: "left",
          currentEnd: snapPoint.clone(),
        });
      } else if (finalRightPosition) {
        const snapPoint = getSnapPoint("right", position);
        setDrawingLine({
          start: snapPoint,
          position: position,
          startSide: "right",
          currentEnd: snapPoint.clone(),
        });
      }
    } else {
      const targetSide = drawingLine.startSide === "left" ? "right" : "left";
      const endPosition = isNearStackPoint(
        point,
        targetSide,
        drawingLine.position
      );

      if (endPosition) {
        console.log("Completing line:", {
          position: drawingLine.position,
          currentStudentLines: studentLines,
        });
        setStudentLine(drawingLine.position, true);

        if (studentLines.top || studentLines.bottom) {
          const [topStart, topEnd] = getLinePoints(true);
          const [bottomStart, bottomEnd] = getLinePoints(false);

          const topVector = new THREE.Vector3(
            topEnd[0] - topStart[0],
            topEnd[1] - topStart[1],
            topEnd[2] - topStart[2]
          );
          const bottomVector = new THREE.Vector3(
            bottomEnd[0] - bottomStart[0],
            bottomEnd[1] - bottomStart[1],
            bottomEnd[2] - bottomStart[2]
          );

          const angle = topVector.angleTo(bottomVector) * (180 / Math.PI);

          const topMidpoint = new THREE.Vector3(
            (topStart[0] + topEnd[0]) / 2,
            (topStart[1] + topEnd[1]) / 2,
            (topStart[2] + topEnd[2]) / 2
          );
          const bottomMidpoint = new THREE.Vector3(
            (bottomStart[0] + bottomEnd[0]) / 2,
            (bottomStart[1] + bottomEnd[1]) / 2,
            (bottomStart[2] + bottomEnd[2]) / 2
          );
          const distance = topMidpoint.distanceTo(bottomMidpoint);

          console.log("Line Measurements:", {
            angle: angle.toFixed(2) + "°",
            distance: distance.toFixed(2) + " units",
            topVector,
            bottomVector,
            topMidpoint,
            bottomMidpoint,
          });
        }
      }
      setDrawingLine(null);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const point = e.point.clone();

    if (mode === "drawCompare") {
      if (drawingLine) {
        const targetSide = drawingLine.startSide === "left" ? "right" : "left";
        const hoverPosition = isNearStackPoint(
          point,
          targetSide,
          drawingLine.position
        );

        if (hoverPosition) {
          const snapPoint = getSnapPoint(targetSide, hoverPosition);
          setDrawingLine({
            ...drawingLine,
            currentEnd: snapPoint,
          });
        } else {
          setDrawingLine({
            ...drawingLine,
            currentEnd: point,
          });
        }
      }

      const leftPosition = isNearStackPoint(point, "left");
      const rightPosition = isNearStackPoint(point, "right");

      const preferredPosition = leftPosition || rightPosition;

      const finalLeftPosition = preferredPosition
        ? isNearStackPoint(point, "left", preferredPosition)
        : leftPosition;
      const finalRightPosition = preferredPosition
        ? isNearStackPoint(point, "right", preferredPosition)
        : rightPosition;

      setHovered(!!finalLeftPosition || !!finalRightPosition);
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
          opacity={1}
          toneMapped={false}
          position={[0, 0.05, 0]}
        />
      )}
      {studentLines.bottom && (
        <Line
          points={getLinePoints(false)}
          color="#ff00ff"
          lineWidth={3}
          dashed={false}
          transparent
          opacity={1}
          toneMapped={false}
          position={[0, -0.15, 0]}
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
          dashSize={0.1}
          gapSize={0.1}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      )}
    </group>
  );
}
