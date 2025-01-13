import { Plus, Minus, MousePointer2, Pencil } from 'lucide-react';
import { useComparisonStore } from '../store/comparisonStore';

export function ControlPanel() {
  const {
    leftStack,
    rightStack,
    mode,
    showAutoLines,
    labels,
    labelMode,
    setStack,
    setMode,
    toggleAutoLines,
    setLabel,
    setLabelMode,
  } = useComparisonStore();

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 text-white p-4 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Left Stack</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStack('left', Math.max(0, leftStack - 1))}
              className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              value={leftStack}
              onChange={(e) => setStack('left', Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-16 bg-gray-800 rounded px-2 py-1 text-center"
            />
            <button
              onClick={() => setStack('left', Math.min(10, leftStack + 1))}
              className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Mode</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setMode('addRemove')}
              className={`p-2 rounded-lg ${
                mode === 'addRemove' ? 'bg-cyan-600' : 'bg-gray-700'
              }`}
            >
              <MousePointer2 size={16} />
            </button>
            <button
              onClick={() => setMode('drawCompare')}
              className={`p-2 rounded-lg ${
                mode === 'drawCompare' ? 'bg-cyan-600' : 'bg-gray-700'
              }`}
            >
              <Pencil size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Right Stack</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStack('right', Math.max(0, rightStack - 1))}
              className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              value={rightStack}
              onChange={(e) => setStack('right', Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-16 bg-gray-800 rounded px-2 py-1 text-center"
            />
            <button
              onClick={() => setStack('right', Math.min(10, rightStack + 1))}
              className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}