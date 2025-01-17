import { Line, Plane } from "@react-three/drei";
import { useComparisonStore } from "../store/comparisonStore";
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

interface ComparisonLinesProps {
  leftPos: [number, number, number];
  rightPos: [number, number, number];
}

export function ComparisonLines({ leftPos, rightPos }: ComparisonLinesProps) {
  const { mode, studentLines, isAnimating, setStudentLine, showAutoLines } =
    useComparisonStore();
  const animationProgress = useComparisonStore(
    (state) => state.animationProgress
  );
  const setAnimationProgress = useComparisonStore(
    (state) => state.setAnimationProgress
  );
  const leftStack = useComparisonStore((state) => state.leftStack);
  const rightStack = useComparisonStore((state) => state.rightStack);

  const [drawingLine, setDrawingLine] = useState<{
    start: THREE.Vector3;
    position: "top" | "bottom";
    startSide: "left" | "right";
    currentEnd: THREE.Vector3;
  } | null>(null);
  const [hovered, setHovered] = useState(false);

  const convergencePointRef = useRef<[number, number, number] | null>(null);

  useCursor(hovered && mode === "drawCompare");

  useFrame((_, delta) => {
    if (isAnimating) {
      setAnimationProgress(Math.min(1, animationProgress + delta));
    } else {
      setAnimationProgress(0);
    }
  });

  const getLinePoints = (isTop: boolean) => {
    const BLOCK_HEIGHT = 0.5;
    const leftHeight = Math.max(leftStack * 0.6, BLOCK_HEIGHT);
    const rightHeight = Math.max(rightStack * 0.6, BLOCK_HEIGHT);

    const leftBaseY = leftPos[1] - leftHeight / 2;
    const rightBaseY = rightPos[1] - rightHeight / 2;

    const leftX = leftPos[0] + 0.45;
    const rightX = rightPos[0] - 0.45;

    if (leftStack !== 0 && rightStack !== 0) {
      convergencePointRef.current = null;
    }

    if (leftStack === 0 && rightStack === 0) {
      const topOffset = -0.05;
      const bottomOffset = -0.55;

      return [
        [leftX, isTop ? topOffset : bottomOffset, leftPos[2]],
        [rightX, isTop ? topOffset : bottomOffset, rightPos[2]],
      ] as const;
    }

    if (rightStack === 0) {
      if (!convergencePointRef.current) {
        const convergenceX = rightX + 0.3;
        const convergenceY = -0.3;
        convergencePointRef.current = [convergenceX, convergenceY, rightPos[2]];
      }

      return [
        [
          leftX,
          isTop
            ? leftBaseY + leftHeight - BLOCK_HEIGHT * 0.7
            : leftBaseY - BLOCK_HEIGHT * 0.5,
          leftPos[2],
        ],
        convergencePointRef.current,
      ] as const;
    }

    if (leftStack === 0) {
      if (!convergencePointRef.current) {
        const convergenceX = leftX - 0.3;
        const convergenceY = -0.3;
        convergencePointRef.current = [convergenceX, convergenceY, leftPos[2]];
      }

      return [
        convergencePointRef.current,
        [
          rightX,
          isTop
            ? rightBaseY + rightHeight - BLOCK_HEIGHT * 0.7
            : rightBaseY - BLOCK_HEIGHT * 0.5,
          rightPos[2],
        ],
      ] as const;
    }

    if (isTop) {
      const leftTopEdge = leftBaseY + leftHeight;
      const rightTopEdge = rightBaseY + rightHeight;

      const leftTopBlockY = leftTopEdge - BLOCK_HEIGHT * 0.7;
      const rightTopBlockY = rightTopEdge - BLOCK_HEIGHT * 0.7;

      return [
        [leftX, leftTopBlockY, leftPos[2]],
        [rightX, rightTopBlockY, rightPos[2]],
      ] as const;
    } else {
      return [
        [leftX, leftBaseY - BLOCK_HEIGHT * 0.5, leftPos[2]],
        [rightX, rightBaseY - BLOCK_HEIGHT * 0.5, rightPos[2]],
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
    preferredPosition?: "top" | "bottom",
    isClick: boolean = false
  ): "top" | "bottom" | null => {
    const stackPos = side === "left" ? leftPos : rightPos;
    const stackCount = side === "left" ? leftStack : rightStack;
    const BLOCK_HEIGHT = 0.5;

    const xDistance = Math.abs(point.x - stackPos[0]);
    const X_THRESHOLD = 0.5;
    const X_PREFERRED = 0.35;

    if (preferredPosition && xDistance > X_PREFERRED) return null;
    if (!preferredPosition && xDistance > X_THRESHOLD) return null;

    const Y_THRESHOLD = 0.4;
    const Y_PREFERRED = 0.3;

    if (stackCount === 0) {
      const baseY = stackPos[1] - BLOCK_HEIGHT * 0.75;
      const singlePointY = baseY + BLOCK_HEIGHT / 2;

      if (preferredPosition === "top") {
        const topDistance = Math.abs(point.y - singlePointY);
        return topDistance < Y_PREFERRED ? "top" : null;
      } else if (preferredPosition === "bottom") {
        const bottomDistance = Math.abs(point.y - baseY);
        return bottomDistance < Y_PREFERRED ? "bottom" : null;
      }

      const topDistance = Math.abs(point.y - singlePointY);
      const bottomDistance = Math.abs(point.y - baseY);

      if (topDistance < Y_THRESHOLD && bottomDistance < Y_THRESHOLD) {
        return topDistance < bottomDistance ? "top" : "bottom";
      }
      if (topDistance < Y_THRESHOLD) return "top";
      if (bottomDistance < Y_THRESHOLD) return "bottom";
      return null;
    }

    const stackHeight = stackCount * 0.6;
    const baseY = stackPos[1] - stackHeight / 2;
    const topY = baseY + stackHeight - BLOCK_HEIGHT;
    const bottomY = baseY + BLOCK_HEIGHT / 2;

    if (preferredPosition === "top") {
      const topDistance = Math.abs(point.y - topY);
      return topDistance < Y_PREFERRED ? "top" : null;
    } else if (preferredPosition === "bottom") {
      const bottomDistance = Math.abs(point.y - bottomY);
      return bottomDistance < Y_PREFERRED ? "bottom" : null;
    }

    const topDistance = Math.abs(point.y - topY);
    const bottomDistance = Math.abs(point.y - bottomY);

    if (topDistance < Y_THRESHOLD && bottomDistance < Y_THRESHOLD) {
      return topDistance < bottomDistance ? "top" : "bottom";
    }
    if (topDistance < Y_THRESHOLD) return "top";
    if (bottomDistance < Y_THRESHOLD) return "bottom";
    return null;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (mode !== "drawCompare") return;
    if (studentLines.top && studentLines.bottom) return;

    const point = e.point.clone();
    const position = studentLines.top ? "bottom" : "top";

    if (!drawingLine) {
      const leftPosition = isNearStackPoint(point, "left", position, true);
      const rightPosition = isNearStackPoint(point, "right", position, true);

      if (leftPosition) {
        const snapPoint = getSnapPoint("left", position);
        setDrawingLine({
          start: snapPoint,
          position: position,
          startSide: "left",
          currentEnd: snapPoint.clone(),
        });
      } else if (rightPosition) {
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
        drawingLine.position,
        true
      );

      if (endPosition) {
        setStudentLine(drawingLine.position, true);
      }
      setDrawingLine(null);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const point = e.point.clone();

    if (mode === "drawCompare") {
      if (studentLines.top && studentLines.bottom) {
        setHovered(false);
        return;
      }

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
      } else {
        const leftPosition = isNearStackPoint(point, "left");
        const rightPosition = isNearStackPoint(point, "right");

        const preferredPosition = leftPosition || rightPosition;

        const finalLeftPosition = preferredPosition
          ? isNearStackPoint(point, "left", studentLines.top ? "bottom" : "top")
          : leftPosition;
        const finalRightPosition = preferredPosition
          ? isNearStackPoint(
              point,
              "right",
              studentLines.top ? "bottom" : "top"
            )
          : rightPosition;

        setHovered(!!finalLeftPosition || !!finalRightPosition);
      }
    }
  };

  useEffect(() => {
    convergencePointRef.current = null;
  }, [leftStack, rightStack]);

  const getAnimatedLinePoints = (isTop: boolean) => {
    if (!isAnimating) return getLinePoints(isTop);

    const originalPoints = getLinePoints(isTop);
    const [start, end] = originalPoints;

    // Animate the drawing process from start to end point
    return [
      [start[0], start[1], start[2]],
      [
        THREE.MathUtils.lerp(start[0], end[0], animationProgress),
        THREE.MathUtils.lerp(start[1], end[1], animationProgress),
        THREE.MathUtils.lerp(start[2], end[2], animationProgress),
      ],
    ] as const;
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

      {/* Auto comparison lines */}
      {showAutoLines && (
        <>
          {/* Auto top line */}
          <Line
            points={getLinePoints(true)}
            color="#666666"
            lineWidth={2}
            dashed={true}
            dashSize={0.1}
            gapSize={0.1}
            transparent
            opacity={0.5}
            toneMapped={false}
          />
          {/* Auto bottom line */}
          <Line
            points={getLinePoints(false)}
            color="#666666"
            lineWidth={2}
            dashed={true}
            dashSize={0.1}
            gapSize={0.1}
            transparent
            opacity={0.5}
            toneMapped={false}
          />
        </>
      )}

      {studentLines.top && (
        <>
          {/* Outer glow line */}
          <Line
            points={getAnimatedLinePoints(true)}
            color="#00ffff"
            lineWidth={8}
            dashed={false}
            transparent
            opacity={0.4}
            toneMapped={false}
          />
          {/* Inner bright line */}
          <Line
            points={getAnimatedLinePoints(true)}
            color="#ffffff"
            lineWidth={4}
            dashed={false}
            transparent
            opacity={0.9}
            toneMapped={false}
          />
        </>
      )}
      {studentLines.bottom && (
        <>
          {/* Outer glow line */}
          <Line
            points={getAnimatedLinePoints(false)}
            color="#00ffff"
            lineWidth={8}
            dashed={false}
            transparent
            opacity={0.4}
            toneMapped={false}
          />
          {/* Inner bright line */}
          <Line
            points={getAnimatedLinePoints(false)}
            color="#ffffff"
            lineWidth={4}
            dashed={false}
            transparent
            opacity={0.9}
            toneMapped={false}
          />
        </>
      )}
      {drawingLine && (
        <>
          {/* Outer glow line for preview */}
          <Line
            points={[
              [drawingLine.start.x, drawingLine.start.y, drawingLine.start.z],
              [
                drawingLine.currentEnd.x,
                drawingLine.currentEnd.y,
                drawingLine.currentEnd.z,
              ],
            ]}
            color="#00ffff"
            lineWidth={8}
            dashed={true}
            dashSize={0.1}
            gapSize={0.1}
            transparent
            opacity={0.3}
            toneMapped={false}
          />
          {/* Inner bright line for preview */}
          <Line
            points={[
              [drawingLine.start.x, drawingLine.start.y, drawingLine.start.z],
              [
                drawingLine.currentEnd.x,
                drawingLine.currentEnd.y,
                drawingLine.currentEnd.z,
              ],
            ]}
            color="#ffffff"
            lineWidth={4}
            dashed={true}
            dashSize={0.1}
            gapSize={0.1}
            transparent
            opacity={0.6}
            toneMapped={false}
          />
        </>
      )}
    </group>
  );
}
