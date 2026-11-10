import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { motion } from "framer-motion";
import { useMemo, useRef, useState, type ReactNode } from "react";

const W = 560;
const H = 620;

export interface MapPoint { name: string; lat: number; lon: number }

interface Props {
  geo: FeatureCollection<Geometry, { name: string }>;
  fill: (name: string) => string | null;
  selected?: string | null;
  onSelect?: (name: string) => void;
  tooltip?: (name: string) => ReactNode;
  extraPoints?: MapPoint[];
  className?: string;
  label?: string;
}

export function GoiasMap({ geo, fill, selected, onSelect, tooltip, extraPoints = [], className, label = "Goiás" }: Props) {
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const { paths, project } = useMemo(() => {
    const proj = geoMercator().fitSize([W, H], geo);
    const gp = geoPath(proj);
    return {
      paths: geo.features.map((f) => ({ name: f.properties.name, d: gp(f) ?? "" })),
      project: (lon: number, lat: number) => proj([lon, lat]) ?? [0, 0],
    };
  }, [geo]);

  const move = (name: string) => (e: React.PointerEvent) => {
    const box = wrap.current!.getBoundingClientRect();
    setHover({ name, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const sel = paths.find((p) => p.name === selected);

  return (
    <div ref={wrap} className={`relative ${className ?? ""}`} onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g>
          {paths.map((p) => {
            const c = fill(p.name);
            const has = c !== null;
            return (
              <motion.path
                key={p.name}
                d={p.d}
                initial={false}
                animate={{ fill: c ?? "#101712" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                stroke={has ? "rgba(7,10,8,.85)" : "rgba(255,255,255,.06)"}
                strokeWidth={0.6}
                className={has ? "cursor-pointer outline-none" : ""}
                tabIndex={has ? 0 : -1}
                aria-label={has ? p.name : undefined}
                onPointerMove={has ? move(p.name) : undefined}
                onClick={has && onSelect ? () => onSelect(p.name) : undefined}
                onKeyDown={has && onSelect ? (e) => (e.key === "Enter" || e.key === " ") && onSelect(p.name) : undefined}
                style={{ opacity: hover && hover.name !== p.name && has ? 0.82 : 1 }}
              />
            );
          })}
        </g>
        {sel && (
          <path d={sel.d} fill="none" stroke="#f6e3a8" strokeWidth={2.2} filter="url(#glow)" pointerEvents="none" />
        )}
        {extraPoints.map((pt) => {
          const [x, y] = project(pt.lon, pt.lat);
          const c = fill(pt.name) ?? "#555";
          return (
            <g key={pt.name} className="cursor-pointer" onPointerMove={move(pt.name)} onClick={() => onSelect?.(pt.name)}>
              <motion.circle cx={x} cy={y} r={selected === pt.name ? 8 : 6} animate={{ fill: c }} stroke={selected === pt.name ? "#f6e3a8" : "#070a08"} strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      {hover && tooltip && (
        <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)]" style={{ left: hover.x, top: hover.y }}>
          {tooltip(hover.name)}
        </div>
      )}
    </div>
  );
}
