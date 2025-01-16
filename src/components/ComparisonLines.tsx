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

    if (isTop) {
      let leftTopBlockY, rightTopBlockY;

      if (leftStack === 0) {
        leftTopBlockY = leftBaseY + BLOCK_HEIGHT / 2;
      } else {
        leftTopBlockY = leftBaseY + leftHeight - 1.25 * BLOCK_HEIGHT;
      }

      if (rightStack === 0) {
        rightTopBlockY = rightBaseY + BLOCK_HEIGHT / 2;
      } else {
        rightTopBlockY = rightBaseY + rightHeight - 1.25 * BLOCK_HEIGHT;
      }

      if (
        (leftStack === 0 && rightStack > 0) ||
        (leftStack > 0 && rightStack === 0)
      ) {
        if (leftStack === 0) {
          leftTopBlockY -= BLOCK_HEIGHT * 0.25;
        } else {
          rightTopBlockY -= BLOCK_HEIGHT * 0.25;
        }
      }

      return [
        [leftX, leftTopBlockY, leftPos[2]] as const,
        [rightX, rightTopBlockY, rightPos[2]] as const,
      ] as const;
    } else {
      const leftBottomBlockY =
        leftStack === 0 ? leftBaseY - BLOCK_HEIGHT * 0.25 : leftBaseY;
      const rightBottomBlockY =
        rightStack === 0 ? rightBaseY - BLOCK_HEIGHT * 0.25 : rightBaseY;

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
    side: "left" | "right"
  ): "top" | "bottom" | null => {
    const stackPos = side === "left" ? leftPos : rightPos;
    const stackCount = side === "left" ? leftStack : rightStack;
    const BLOCK_HEIGHT = 0.5;

    if (stackCount === 0) {
      const baseY = stackPos[1] - BLOCK_HEIGHT * 0.75;
      const singlePointY = baseY + BLOCK_HEIGHT / 2;

      const xDistance = Math.abs(point.x - stackPos[0]);
      if (xDistance > 0.5) return null;

      const distanceThreshold = 15;
      if (Math.abs(point.y - singlePointY) < distanceThreshold) return "top";
      if (Math.abs(point.y - baseY) < distanceThreshold) return "bottom";
      return null;
    }

    const stackHeight = stackCount * 0.6;
    const baseY = stackPos[1] - stackHeight / 2;
    const topY = baseY + stackHeight - BLOCK_HEIGHT;
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
      const leftPosition = isNearStackPoint(point, "left");
      const rightPosition = isNearStackPoint(point, "right");

      if (leftPosition && !studentLines[leftPosition]) {
        const snapPoint = getSnapPoint("left", leftPosition);
        setDrawingLine({
          start: snapPoint,
          position: leftPosition,
          startSide: "left",
          currentEnd: snapPoint.clone(),
        });
      } else if (rightPosition && !studentLines[rightPosition]) {
        const snapPoint = getSnapPoint("right", rightPosition);
        setDrawingLine({
          start: snapPoint,
          position: rightPosition,
          startSide: "right",
          currentEnd: snapPoint.clone(),
        });
      }
    } else {
      const targetSide = drawingLine.startSide === "left" ? "right" : "left";
      const endPosition = isNearStackPoint(point, targetSide);

      if (endPosition === drawingLine.position) {
        toggleStudentLine(drawingLine.position);
      }
      setDrawingLine(null);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const point = e.point.clone();

    if (mode === "drawCompare") {
      if (drawingLine) {
        const targetSide = drawingLine.startSide === "left" ? "right" : "left";
        const hoverPosition = isNearStackPoint(point, targetSide);

        if (hoverPosition === drawingLine.position) {
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
