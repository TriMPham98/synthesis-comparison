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
  const {
    mode,
    studentLines,
    isAnimating,
    setStudentLine,
    showAutoLines,
    soundEnabled,
    setIsPlayingSound,
    setIsAnimating,
  } = useComparisonStore();
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useCursor(hovered && mode === "drawCompare");

  useEffect(() => {
    audioRef.current = new Audio("/sounds/correctCompare.mp3");
    const blockPopAudio = new Audio("/sounds/connectBlock.mp3");
    audioRef.current.volume = 0.5;
    blockPopAudio.volume = 0.5;
    return () => {
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isAnimating && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  }, [isAnimating]);

  useFrame((_, delta) => {
    if (isAnimating) {
      const newProgress = Math.min(1, animationProgress + delta);
      setAnimationProgress(newProgress);

      // If animation just completed
      if (newProgress >= 1) {
        setIsAnimating(false);
        if (soundEnabled && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
          setIsPlayingSound(true);
          audioRef.current.addEventListener(
            "ended",
            () => {
              setIsPlayingSound(false);
            },
            { once: true }
          ); // Add once: true to prevent memory leaks
        }
      }
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
      const topOffset = 0.95;
      const bottomOffset = 0.45;

      return [
        [leftX, isTop ? topOffset : bottomOffset, leftPos[2]],
        [rightX, isTop ? topOffset : bottomOffset, rightPos[2]],
      ] as const;
    }

    if (rightStack === 0) {
      if (!convergencePointRef.current) {
        const convergenceX = rightX + 0.3;
        const convergenceY = 0.7;
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
        const convergenceY = 0.7;
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
    preferredPosition?: "top" | "bottom"
  ): "top" | "bottom" | null => {
    const stackPos = side === "left" ? leftPos : rightPos;
    const stackCount = side === "left" ? leftStack : rightStack;
    const BLOCK_HEIGHT = 0.5;

    const xDistance = Math.abs(point.x - stackPos[0]);
    const X_THRESHOLD = 1.0;
    const X_PREFERRED = 0.65;

    if (preferredPosition && xDistance > X_PREFERRED) return null;
    if (!preferredPosition && xDistance > X_THRESHOLD) return null;

    const Y_THRESHOLD = 0.8;
    const Y_PREFERRED = 0.6;

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

    if (!drawingLine) {
      // Check both positions to see which one was clicked
      const leftTopPosition =
        !studentLines.top && isNearStackPoint(point, "left", "top");
      const leftBottomPosition =
        !studentLines.bottom && isNearStackPoint(point, "left", "bottom");
      const rightTopPosition =
        !studentLines.top && isNearStackPoint(point, "right", "top");
      const rightBottomPosition =
        !studentLines.bottom && isNearStackPoint(point, "right", "bottom");

      // Determine which position was clicked
      if (leftTopPosition || rightTopPosition) {
        const position = "top";
        const side = leftTopPosition ? "left" : "right";
        const snapPoint = getSnapPoint(side, position);
        setDrawingLine({
          start: snapPoint,
          position,
          startSide: side,
          currentEnd: snapPoint.clone(),
        });
      } else if (leftBottomPosition || rightBottomPosition) {
        const position = "bottom";
        const side = leftBottomPosition ? "left" : "right";
        const snapPoint = getSnapPoint(side, position);
        setDrawingLine({
          start: snapPoint,
          position,
          startSide: side,
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
        if (soundEnabled) {
          const blockPopAudio = new Audio("/sounds/connectBlock.mp3");
          blockPopAudio.volume = 0.5;
          blockPopAudio.play();
        }
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
        // Check both available positions for hover state
        const leftTopPosition =
          !studentLines.top && isNearStackPoint(point, "left", "top");
        const leftBottomPosition =
          !studentLines.bottom && isNearStackPoint(point, "left", "bottom");
        const rightTopPosition =
          !studentLines.top && isNearStackPoint(point, "right", "top");
        const rightBottomPosition =
          !studentLines.bottom && isNearStackPoint(point, "right", "bottom");

        setHovered(
          !!(
            leftTopPosition ||
            leftBottomPosition ||
            rightTopPosition ||
            rightBottomPosition
          )
        );
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
    <group renderOrder={1}>
      <Plane
        args={[20, 20]}
        position={[0, 0, -0.1]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        visible={false}>
        <meshBasicMaterial transparent opacity={0} depthTest={false} />
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
            depthTest={false}
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
            depthTest={false}
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
            depthTest={false}
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
            depthTest={false}
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
            depthTest={false}
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
            depthTest={false}
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
            depthTest={false}
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
            depthTest={false}
          />
        </>
      )}
    </group>
  );
}
