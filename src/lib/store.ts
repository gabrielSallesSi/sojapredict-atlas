import { create } from "zustand";
import type { MetricKey } from "./colors";

interface AtlasState {
  year: number;
  metric: MetricKey;
  selected: string | null;
  setYear: (y: number) => void;
  setMetric: (m: MetricKey) => void;
  select: (m: string | null) => void;
}

export const useAtlas = create<AtlasState>((set) => ({
  year: 2025,
  metric: "prod",
  selected: "Rio Verde",
  setYear: (year) => set({ year }),
  setMetric: (metric) => set({ metric }),
  select: (selected) => set({ selected }),
}));
