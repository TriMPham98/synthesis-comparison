import { Line } from "@react-three/drei";
import { useComparisonStore } from "../store/comparisonStore";

interface ComparisonLinesProps {
  leftPos: [number, number, number];
  rightPos: [number, number, number];
}

export function ComparisonLines({ leftPos, rightPos }: ComparisonLinesProps) {
  const { showAutoLines, studentLines, leftStack, rightStack } =
    useComparisonStore();

  const getLinePoints = (isTop: boolean) => {
    const leftHeight = leftStack * 0.6;
    const rightHeight = rightStack * 0.6;
    const y = isTop ? Math.max(leftHeight, rightHeight) : 0;

    return [
      [leftPos[0], leftPos[1] + y, leftPos[2]] as const,
      [rightPos[0], rightPos[1] + y, rightPos[2]] as const,
    ] as const;
  };

  return (
    <>
      {showAutoLines && (
        <>
          <Line
            points={getLinePoints(true)}
            color="#00ffff"
            lineWidth={2}
            dashed={false}
          />
          <Line
            points={getLinePoints(false)}
            color="#00ffff"
            lineWidth={2}
            dashed={false}
          />
        </>
      )}
      {studentLines.top && (
        <Line
          points={getLinePoints(true)}
          color="#ff00ff"
          lineWidth={3}
          dashed={false}
        />
      )}
      {studentLines.bottom && (
        <Line
          points={getLinePoints(false)}
          color="#ff00ff"
          lineWidth={3}
          dashed={false}
        />
      )}
    </>
  );
}
