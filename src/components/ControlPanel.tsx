import {
  Plus,
  Minus,
  Pointer,
  Pencil,
  Play,
  Eye,
  Trash2,
  VolumeX,
  Volume2,
} from "lucide-react";
import { useComparisonStore } from "../store/comparisonStore";

export function ControlPanel() {
  const {
    leftStack,
    rightStack,
    mode,
    setStack,
    setMode,
    studentLines,
    setIsAnimating,
    showAutoLines,
    toggleAutoLines,
    clearAll,
    soundEnabled,
    toggleSound,
  } = useComparisonStore();

  const handleModeClick = (newMode: "addRemove" | "drawCompare" | "none") => {
    if (mode === newMode) {
      setMode("none");
    } else {
      setMode(newMode);
    }
  };

  // Helper function to return an empty string if the value is 0 but only when the user is typing
  const displayValue = (value: number, isTyping: boolean) =>
    isTyping ? "" : value.toString();

  const handleAnimateClick = () => {
    // Only allow animation when both lines are drawn
    if (!studentLines.top || !studentLines.bottom) {
      return;
    }

    setIsAnimating(true);

    // Reset animation after completion
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000); // Back to 1 second since we're only doing one animation
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white py-4">
      <div className="max-w-6xl mx-auto px-8 flex justify-center items-center gap-24">
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4 text-center">Left Stack</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setStack("left", Math.max(0, leftStack - 1))}
              className="p-4 bg-blue-400 rounded-lg hover:bg-blue-500">
              <Minus size={24} />
            </button>
            <input
              type="number"
              value={displayValue(leftStack, false)}
              onChange={(e) => {
                const newValue = e.target.value ? parseInt(e.target.value) : 0;
                setStack("left", Math.min(10, Math.max(0, newValue)));
              }}
              className="w-24 bg-gray-800 rounded-lg px-4 py-3 text-center text-xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              onClick={() => setStack("left", Math.min(10, leftStack + 1))}
              className="p-4 bg-blue-400 rounded-lg hover:bg-blue-500">
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4 text-center">Mode</h3>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  clearAll();
                  if (showAutoLines) {
                    toggleAutoLines();
                  }
                }}
                className="px-5 py-2.5 rounded-lg flex items-center space-x-2 w-[160px] justify-center bg-red-600 hover:bg-red-700">
                <Trash2 size={22} />
                <span>Clear All</span>
              </button>
              <button
                onClick={() => handleModeClick("drawCompare")}
                className={`px-5 py-2.5 rounded-lg flex items-center space-x-2 w-[160px] justify-center ${
                  mode === "drawCompare" ? "bg-blue-600" : "bg-gray-700"
                }`}>
                <Pencil size={22} />
                <span>Compare</span>
              </button>
              <button
                onClick={handleAnimateClick}
                disabled={!studentLines.top || !studentLines.bottom}
                className={`px-5 py-2.5 rounded-lg flex items-center space-x-2 w-[160px] justify-center
                  ${
                    !studentLines.top || !studentLines.bottom
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}>
                <Play size={22} />
                <span>Animate</span>
              </button>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleModeClick("addRemove")}
                className={`px-5 py-2.5 rounded-lg flex items-center space-x-2 w-[160px] justify-center ${
                  mode === "addRemove" ? "bg-blue-600" : "bg-gray-700"
                }`}>
                <Pointer size={22} />
                <span>Add/Remove</span>
              </button>
              <button
                onClick={toggleAutoLines}
                className={`px-5 py-2.5 rounded-lg flex items-center space-x-2 w-[160px] justify-center ${
                  showAutoLines ? "bg-blue-600" : "bg-gray-700"
                }`}>
                <Eye size={22} />
                <span>Auto Lines</span>
              </button>
              <button
                onClick={toggleSound}
                className={`px-5 py-2.5 rounded-lg flex items-center space-x-2 w-[160px] justify-center ${
                  soundEnabled ? "bg-blue-600" : "bg-gray-700"
                }`}>
                {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
                <span>Sound {soundEnabled ? "On" : "Off"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4 text-center">Right Stack</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setStack("right", Math.max(0, rightStack - 1))}
              className="p-4 bg-blue-400 rounded-lg hover:bg-blue-500">
              <Minus size={24} />
            </button>
            <input
              type="number"
              value={displayValue(rightStack, false)}
              onChange={(e) => {
                const newValue = e.target.value ? parseInt(e.target.value) : 0;
                setStack("right", Math.min(10, Math.max(0, newValue)));
              }}
              className="w-24 bg-gray-800 rounded-lg px-4 py-3 text-center text-xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              onClick={() => setStack("right", Math.min(10, rightStack + 1))}
              className="p-4 bg-blue-400 rounded-lg hover:bg-blue-500">
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
