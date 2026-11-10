import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { geoMercator, geoPath } from "d3-geo";
import { useMemo } from "react";
import { useGeo, useResults } from "../lib/data";
import { Counter } from "../components/ui";
import { fmt0, fmt2 } from "../lib/format";
import { useT } from "../lib/i18n";

function DrawnGoias() {
  const { data: geo } = useGeo();
  const paths = useMemo(() => {
    if (!geo) return [];
    const gp = geoPath(geoMercator().fitSize([560, 620], geo));
    return geo.features.map((f) => gp(f) ?? "");
  }, [geo]);
  return (
    <svg viewBox="0 0 560 620" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="hg" gradientUnits="userSpaceOnUse" cx="330" cy="420" r="420">
          <stop offset="0%" stopColor="#e9c46a" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#7bd389" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#7bd389" stopOpacity="0.08" />
        </radialGradient>
      </defs>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="url(#hg)"
          fillOpacity={0}
          stroke="url(#hg)"
          strokeWidth={0.8}
          initial={{ pathLength: 0, fillOpacity: 0 }}
          animate={{ pathLength: 1, fillOpacity: 0.12 + ((i * 37) % 11) / 60 }}
          transition={{ pathLength: { duration: 2.2, delay: (i % 40) * 0.025, ease: "easeInOut" }, fillOpacity: { duration: 1.2, delay: 1.6 + (i % 30) * 0.03 } }}
        />
      ))}
    </svg>
  );
}

export function Hero() {
  const { data: res } = useResults();
  const t = useT();
  const best = res?.cv_summary.T2_RandomForest;
  const stats = [
    { v: res?.n_total ?? 660, f: fmt0, label: t.hero.stats[0] },
    { v: res?.n_municipios ?? 55, f: fmt0, label: t.hero.stats[1] },
    { v: res ? res.anos.length : 12, f: fmt0, label: t.hero.stats[2] },
    { v: best?.R2_mean ?? 0.55, f: fmt2, label: t.hero.stats[3] },
  ];

  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="grain-bg absolute inset-0 opacity-60" />
      <div className="absolute -right-40 top-10 h-[620px] w-[620px] rounded-full bg-leaf-500/10 blur-[120px]" />
      <div className="container-x relative grid items-center gap-10 pb-16 lg:grid-cols-[1.15fr_1fr] lg:pb-24">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="eyebrow">
            {t.hero.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-[2.9rem] font-medium leading-[0.98] tracking-tight text-stone-50 sm:text-7xl"
          >
            {t.hero.l1}<br />
            {t.hero.l2} <span className="italic text-grain-400">{t.hero.em}</span>.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }} className="mt-6 max-w-xl text-lg leading-relaxed text-stone-400">
            {t.hero.lead}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-9 flex flex-wrap gap-3">
            <a href="#simulador" className="group rounded-full bg-grain-400 px-6 py-3 font-medium text-ink-950 transition hover:bg-grain-300">
              {t.hero.cta1}
            </a>
            <a href="#atlas" className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-stone-200 transition hover:border-white/40">
              {t.hero.cta2} <ArrowDown size={16} className="transition group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </div>
        <div className="relative mx-auto aspect-[56/62] w-full max-w-[460px]">
          <DrawnGoias />
        </div>
      </div>
      <div className="container-x relative pb-20">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink-950 p-6">
              <Counter value={s.v} format={s.f} className="num block text-3xl text-stone-50 sm:text-4xl" />
              <p className="mt-2 text-sm text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
