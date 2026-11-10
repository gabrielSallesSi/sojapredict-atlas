import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Counter({ value, format = (n) => String(Math.round(n)), className }: { value: number; format?: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => format(v));
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [inView, value, mv]);
  return <motion.span ref={ref} className={className}>{text}</motion.span>;
}

export function TitleText({ t }: { t: { a: string; em: string; b: string } }) {
  return <>{t.a}<span className="italic text-grain-400">{t.em}</span>{t.b}</>;
}

export function SectionHeader({ eyebrow, title, children, id }: { eyebrow: string; title: ReactNode; children?: ReactNode; id?: string }) {
  return (
    <Reveal className="mb-10 max-w-3xl">
      <p className="eyebrow" id={id}>{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-tight text-stone-50 sm:text-5xl">{title}</h2>
      {children && <p className="mt-4 text-lg leading-relaxed text-stone-400">{children}</p>}
    </Reveal>
  );
}

export function Segmented<T extends string>({ value, options, onChange, className }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={clsx("inline-flex rounded-full border border-white/10 bg-ink-900 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            "relative rounded-full px-3.5 py-1.5 text-sm transition-colors",
            value === o.value ? "text-ink-950" : "text-stone-400 hover:text-stone-200",
          )}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${options.map((x) => x.value).join("")}`} className="absolute inset-0 rounded-full bg-grain-400" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Slider({ label, value, min, max, step, unit, onChange, color = "#e9c46a", format }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; color?: string; format?: (n: number) => string;
}) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm text-stone-400">{label}</span>
        <span className="num text-sm text-stone-100">{format ? format(value) : value}<span className="ml-1 text-stone-500">{unit}</span></span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--p" as string]: `${p}%`, ["--fill" as string]: color }}
        aria-label={label}
      />
    </label>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-2xl bg-ink-800", className)} />;
}
