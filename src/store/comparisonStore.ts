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
  setStack: (side: "left" | "right", value: number) => void;
  setMode: (mode: "none" | "addRemove" | "drawCompare") => void;
  toggleAutoLines: () => void;
  setStudentLine: (position: "top" | "bottom", value: boolean) => void;
  setLabel: (side: "left" | "right", value: string) => void;
  setLabelMode: (mode: "input" | "label") => void;
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
  setStack: (side, value) =>
    set((state) => ({
      ...(side === "left" ? { leftStack: value } : { rightStack: value }),
    })),
  setMode: (mode) => set({ mode }),
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
}));
