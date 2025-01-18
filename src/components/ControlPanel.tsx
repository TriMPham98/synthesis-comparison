import {
  Plus,
  Minus,
  MousePointerClickIcon,
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
    isAnimating,
    isPlayingSound,
    animationProgress,
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
    // Only allow animation when both lines are drawn and not currently animating or playing sound
    if (
      !studentLines.top ||
      !studentLines.bottom ||
      isAnimating ||
      isPlayingSound
    ) {
      return;
    }

    setIsAnimating(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white py-2 px-4 md:py-4">
      <div className="w-full flex flex-col md:flex-row md:justify-center md:items-center md:gap-10 gap-4">
        {/* Mode Controls - Shown first on mobile */}
        <div className="flex flex-col items-center order-first md:order-none">
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Mode</h3>
          <div className="flex flex-col space-y-2 w-full max-w-xl">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  clearAll();
                  if (showAutoLines) toggleAutoLines();
                }}
                className="px-3 py-2 md:px-5 md:py-2.5 rounded-lg flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 touch-manipulation">
                <Trash2 size={18} className="md:hidden" />
                <Trash2 size={22} className="hidden md:block" />
                <span className="text-xs md:text-base">Clear All</span>
              </button>
              <button
                onClick={() => handleModeClick("drawCompare")}
                className={`px-3 py-2 md:px-5 md:py-2.5 rounded-lg flex items-center justify-center space-x-2 ${
                  mode === "drawCompare" ? "bg-blue-600" : "bg-gray-700"
                } touch-manipulation`}>
                <Pencil size={18} className="md:hidden" />
                <Pencil size={22} className="hidden md:block" />
                <span className="text-xs md:text-base">Compare</span>
              </button>
              <button
                onClick={handleAnimateClick}
                disabled={
                  !studentLines.top ||
                  !studentLines.bottom ||
                  isAnimating ||
                  isPlayingSound
                }
                className={`px-3 py-2 md:px-5 md:py-2.5 rounded-lg flex items-center justify-center space-x-2 relative overflow-hidden
                  ${
                    !studentLines.top || !studentLines.bottom
                      ? "bg-gray-600 cursor-not-allowed"
                      : isAnimating || isPlayingSound
                      ? "bg-gray-600"
                      : "bg-green-600 hover:bg-green-700"
                  } touch-manipulation`}>
                {/* Animation progress bar */}
                {(isAnimating || isPlayingSound) && (
                  <div
                    className="absolute inset-0 bg-green-400/30"
                    style={{
                      width: isPlayingSound
                        ? "100%"
                        : `${animationProgress * 100}%`,
                      transition: "width 16ms linear",
                    }}
                  />
                )}
                {/* Button content */}
                <Play size={18} className="md:hidden z-10" />
                <Play size={22} className="hidden md:block z-10" />
                <span className="text-xs md:text-base z-10">Animate</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleModeClick("addRemove")}
                className={`px-3 py-2 md:px-5 md:py-2.5 rounded-lg flex items-center justify-center space-x-2 ${
                  mode === "addRemove" ? "bg-blue-600" : "bg-gray-700"
                } touch-manipulation`}>
                <MousePointerClickIcon size={18} className="md:hidden" />
                <MousePointerClickIcon size={22} className="hidden md:block" />
                <span className="text-xs md:text-base">Add/Remove</span>
              </button>
              <button
                onClick={toggleAutoLines}
                className={`px-3 py-2 md:px-5 md:py-2.5 rounded-lg flex items-center justify-center space-x-2 ${
                  showAutoLines ? "bg-blue-600" : "bg-gray-700"
                } touch-manipulation`}>
                <Eye size={18} className="md:hidden" />
                <Eye size={22} className="hidden md:block" />
                <span className="text-xs md:text-base">Auto Lines</span>
              </button>
              <button
                onClick={toggleSound}
                className={`px-3 py-2 md:px-5 md:py-2.5 rounded-lg flex items-center justify-center space-x-2 ${
                  soundEnabled ? "bg-blue-600" : "bg-gray-700"
                } touch-manipulation`}>
                {soundEnabled ? (
                  <>
                    <Volume2 size={18} className="md:hidden" />
                    <Volume2 size={22} className="hidden md:block" />
                  </>
                ) : (
                  <>
                    <VolumeX size={18} className="md:hidden" />
                    <VolumeX size={22} className="hidden md:block" />
                  </>
                )}
                <span className="text-xs md:text-base">
                  Sound {soundEnabled ? "On" : "Off"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Stack Controls Container for Mobile */}
        <div className="flex justify-around md:hidden">
          {/* Left Stack Controls */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <h3 className="text-lg font-bold mr-2">L</h3>
              <button
                onClick={() => setStack("left", Math.max(0, leftStack - 1))}
                className="p-2 bg-blue-400 rounded-lg hover:bg-blue-500 touch-manipulation">
                <Minus size={20} />
              </button>
              <input
                type="number"
                value={displayValue(leftStack, false)}
                onChange={(e) => {
                  const newValue = e.target.value
                    ? parseInt(e.target.value)
                    : 0;
                  setStack("left", Math.min(10, Math.max(0, newValue)));
                }}
                onKeyDown={handleKeyDown}
                className="w-12 h-[40px] bg-gray-800 rounded-lg px-2 py-2 text-center text-xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() => setStack("left", Math.min(10, leftStack + 1))}
                className="p-2 bg-blue-400 rounded-lg hover:bg-blue-500 touch-manipulation">
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Right Stack Controls */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <h3 className="text-lg font-bold mr-2">R</h3>
              <button
                onClick={() => setStack("right", Math.max(0, rightStack - 1))}
                className="p-2 bg-blue-400 rounded-lg hover:bg-blue-500 touch-manipulation">
                <Minus size={20} />
              </button>
              <input
                type="number"
                value={displayValue(rightStack, false)}
                onChange={(e) => {
                  const newValue = e.target.value
                    ? parseInt(e.target.value)
                    : 0;
                  setStack("right", Math.min(10, Math.max(0, newValue)));
                }}
                onKeyDown={handleKeyDown}
                className="w-12 h-[40px] bg-gray-800 rounded-lg px-2 py-2 text-center text-xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() => setStack("right", Math.min(10, rightStack + 1))}
                className="p-2 bg-blue-400 rounded-lg hover:bg-blue-500 touch-manipulation">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Original Left Stack Controls - Hidden on Mobile */}
        <div className="hidden md:flex md:flex-col md:items-center">
          <h3 className="text-lg md:text-xl font-bold md:mb-4">Left Stack</h3>
          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              onClick={() => setStack("left", Math.max(0, leftStack - 1))}
              className="p-2 md:p-4 bg-blue-400 rounded-lg hover:bg-blue-500 touch-manipulation">
              <Minus size={20} />
            </button>
            <input
              type="number"
              value={displayValue(leftStack, false)}
              onChange={(e) => {
                const newValue = e.target.value ? parseInt(e.target.value) : 0;
                setStack("left", Math.min(10, Math.max(0, newValue)));
              }}
              onKeyDown={handleKeyDown}
              className="w-12 md:w-24 h-[40px] md:h-auto bg-gray-800 rounded-lg px-2 py-2 md:px-4 md:py-3 text-center text-xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              onClick={() => setStack("left", Math.min(10, leftStack + 1))}
              className="p-2 md:p-4 bg-blue-400 rounded-lg hover:bg-blue-500 touch-manipulation">
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Original Right Stack Controls - Hidden on Mobile */}
        <div className="hidden md:flex md:flex-col md:items-center">
          <h3 className="text-lg md:text-xl font-bold md:mb-4">Right Stack</h3>
          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              onClick={() => setStack("right", Math.max(0, rightStack - 1))}
              className="p-2 md:p-4 bg-blue-400 rounded-lg hover:bg-blue-500 touch-manipulation">
              <Minus size={20} />
            </button>
            <input
              type="number"
              value={displayValue(rightStack, false)}
              onChange={(e) => {
                const newValue = e.target.value ? parseInt(e.target.value) : 0;
                setStack("right", Math.min(10, Math.max(0, newValue)));
              }}
              onKeyDown={handleKeyDown}
              className="w-12 md:w-24 h-[40px] md:h-auto bg-gray-800 rounded-lg px-2 py-2 md:px-4 md:py-3 text-center text-xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              onClick={() => setStack("right", Math.min(10, rightStack + 1))}
              className="p-2 md:p-4 bg-blue-400 rounded-lg hover:bg-blue-500 touch-manipulation">
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
