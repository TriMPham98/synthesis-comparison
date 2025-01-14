import { Plus, Minus, MousePointer2, Pencil } from "lucide-react";
import { useComparisonStore } from "../store/comparisonStore";

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

  // Function to handle double click for mode switching
  const handleModeClick = (newMode) => {
    if (mode === newMode) {
      setMode("none"); // If clicked mode is already active, switch to none
    } else {
      setMode(newMode);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 text-white p-6 backdrop-blur-md">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
        <div className="space-y-4 text-center">
          <h3 className="text-xl font-bold">Left Stack</h3>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setStack("left", Math.max(0, leftStack - 1))}
              className="p-4 bg-blue-300 rounded-lg hover:bg-blue-400">
              <Minus size={24} />
            </button>
            <input
              type="number"
              value={leftStack}
              onChange={(e) =>
                setStack(
                  "left",
                  Math.min(10, Math.max(0, parseInt(e.target.value) || 0))
                )
              }
              className="w-24 bg-gray-800 rounded px-4 py-2 text-center text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setStack("left", Math.min(10, leftStack + 1))}
              className="p-4 bg-blue-300 rounded-lg hover:bg-blue-400">
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h3 className="text-xl font-bold">Mode</h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleModeClick("addRemove")}
              onDoubleClick={() => handleModeClick("addRemove")} // Handle double click
              className={`p-4 rounded-lg ${
                mode === "addRemove" ? "bg-cyan-600" : "bg-gray-700"
              }`}>
              <MousePointer2 size={24} />
            </button>
            <button
              onClick={() => handleModeClick("drawCompare")}
              onDoubleClick={() => handleModeClick("drawCompare")} // Handle double click
              className={`p-4 rounded-lg ${
                mode === "drawCompare" ? "bg-cyan-600" : "bg-gray-700"
              }`}>
              <Pencil size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h3 className="text-xl font-bold">Right Stack</h3>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setStack("right", Math.max(0, rightStack - 1))}
              className="p-4 bg-blue-300 rounded-lg hover:bg-blue-400">
              <Minus size={24} />
            </button>
            <input
              type="number"
              value={rightStack}
              onChange={(e) =>
                setStack(
                  "right",
                  Math.min(10, Math.max(0, parseInt(e.target.value) || 0))
                )
              }
              className="w-24 bg-gray-800 rounded px-4 py-2 text-center text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setStack("right", Math.min(10, rightStack + 1))}
              className="p-4 bg-blue-300 rounded-lg hover:bg-blue-400">
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
