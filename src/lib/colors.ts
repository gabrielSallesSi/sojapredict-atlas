import { scaleSequential } from "d3-scale";
import { interpolateRgbBasis } from "d3-interpolate";
import type { Region } from "./types";

export const REGION_COLOR: Record<Region, string> = {
  Norte: "#f4a261",
  Leste: "#6fb7e8",
  Centro: "#c9a7eb",
  Sul: "#7bd389",
  Sudoeste: "#e9c46a",
};
export const REGIONS: Region[] = ["Norte", "Leste", "Centro", "Sul", "Sudoeste"];

export const RAMPS = {
  prod: ["#1b2b24", "#24493a", "#2d6a4f", "#52a370", "#a7d77d", "#e9c46a", "#f6e3a8"],
  chuva: ["#2b1d14", "#5a3a22", "#8a6a3a", "#4f8a8b", "#3f8fc9", "#8cc8f0"],
  tmax: ["#16323a", "#2f5d62", "#8f8a52", "#d9a441", "#e76f51", "#ff9a7a"],
} as const;

export type MetricKey = keyof typeof RAMPS;

export function makeScale(metric: MetricKey, domain: [number, number]) {
  return scaleSequential(interpolateRgbBasis([...RAMPS[metric]])).domain(domain).clamp(true);
}
