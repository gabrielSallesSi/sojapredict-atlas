import { RAMPS, type MetricKey } from "../lib/colors";

export function GradientLegend({ metric, min, max, unit }: { metric: MetricKey; min: string; max: string; unit: string }) {
  const stops = RAMPS[metric];
  return (
    <div className="w-full max-w-xs">
      <div className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${stops.join(",")})` }} />
      <div className="num mt-1.5 flex justify-between text-[11px] text-stone-500">
        <span>{min}</span><span>{unit}</span><span>{max}</span>
      </div>
    </div>
  );
}
