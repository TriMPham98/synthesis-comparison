import { Block } from './Block';
import { useComparisonStore } from '../store/comparisonStore';

interface StackProps {
  side: 'left' | 'right';
  position: [number, number, number];
}

export function Stack({ side, position }: StackProps) {
  const count = useComparisonStore((state) => state[`${side}Stack`]);
  const mode = useComparisonStore((state) => state.mode);

  const blocks = Array.from({ length: count }, (_, i) => (
    <Block
      key={i}
      position={[position[0], position[1] + i * 0.6, position[2]]}
      hover={mode === 'addRemove'}
    />
  ));

  return <group>{blocks}</group>;
}