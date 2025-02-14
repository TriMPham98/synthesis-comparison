import { create } from "zustand";

interface ComparisonState {
  leftStack: number;
  rightStack: number;
  mode: "none" | "addRemove" | "drawCompare";
  showAutoLines: boolean;
  studentLines: {
    top: boolean;
    bottom: boolean;
  };
  labels: {
    left: string;
    right: string;
  };
  labelMode: "input" | "label";
  isAnimating: boolean;
  animationProgress: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  setStack: (side: "left" | "right", value: number) => void;
  setMode: (mode: "none" | "addRemove" | "drawCompare") => void;
  toggleAutoLines: () => void;
  setStudentLine: (position: "top" | "bottom", value: boolean) => void;
  setLabel: (side: "left" | "right", value: string) => void;
  setLabelMode: (mode: "input" | "label") => void;
  setAnimationProgress: (value: number) => void;
  clearAll: () => void;
  isPlayingSound: boolean;
  setIsAnimating: (value: boolean) => void;
  setIsPlayingSound: (value: boolean) => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  leftStack: 0,
  rightStack: 0,
  mode: "none",
  showAutoLines: false,
  studentLines: {
    top: false,
    bottom: false,
  },
  labels: {
    left: "0",
    right: "0",
  },
  labelMode: "label",
  isAnimating: false,
  animationProgress: 0,
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setStack: (side, value) =>
    set(() => ({
      ...(side === "left" ? { leftStack: value } : { rightStack: value }),
    })),
  setMode: (mode) =>
    set((state) => ({
      mode,
      ...(state.mode === "drawCompare" &&
        mode !== "drawCompare" &&
        (!state.studentLines.top || !state.studentLines.bottom) && {
          studentLines: {
            top: false,
            bottom: false,
          },
        }),
    })),
  toggleAutoLines: () =>
    set((state) => ({ showAutoLines: !state.showAutoLines })),
  setStudentLine: (position, value) =>
    set((state) => ({
      studentLines: {
        ...state.studentLines,
        [position]: value,
      },
    })),
  setLabel: (side, value) =>
    set((state) => ({
      labels: {
        ...state.labels,
        [side]: value,
      },
    })),
  setLabelMode: (mode) => set({ labelMode: mode }),
  setAnimationProgress: (value) => set({ animationProgress: value }),
  clearAll: () =>
    set({
      leftStack: 0,
      rightStack: 0,
      studentLines: {
        top: false,
        bottom: false,
      },
      mode: "none",
    }),
  isPlayingSound: false,
  setIsAnimating: (value) => set({ isAnimating: value }),
  setIsPlayingSound: (value) => set({ isPlayingSound: value }),
}));
