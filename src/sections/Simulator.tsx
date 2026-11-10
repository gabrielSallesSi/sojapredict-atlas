import { useEffect, useMemo, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceDot, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { CloudRain, RotateCcw, Sun, Thermometer } from "lucide-react";
import { useDataset, useModel } from "../lib/data";
import { useAtlas } from "../lib/store";
import { predictForest, treeSpread } from "../lib/model";
import { fmt0, fmt1, fmt2 } from "../lib/format";
import { Reveal, SectionHeader, Skeleton, Slider, TitleText } from "../components/ui";
import { useT } from "../lib/i18n";
import { TipBox } from "../components/ChartTooltip";
import type { Row } from "../lib/types";

interface Climate { chuva: number; tmax: number; tmin: number; ur: number }
const axis = { tick: { fill: "#78716c", fontSize: 11 }, axisLine: false, tickLine: false } as const;
const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const txt = useTransform(mv, (v) => fmt0(v));
  useEffect(() => { const c = animate(mv, value, { duration: 0.5, ease: "easeOut" }); return () => c.stop(); }, [value, mv]);
  return <motion.span>{txt}</motion.span>;
}

export function Simulator() {
  const { data: rows } = useDataset();
  const { data: model } = useModel();
  const { selected, select } = useAtlas();
  const t = useT();
  const mun = selected ?? "Rio Verde";

  const munRows = useMemo(() => (rows ?? []).filter((r) => r.mun === mun), [rows, mun]);
  const municipios = useMemo(() => [...new Set((rows ?? []).map((r) => r.mun))].sort((a, b) => a.localeCompare(b, "pt-BR")), [rows]);

  const presets = useMemo(() => {
    if (!munRows.length) return null;
    const avg = (k: keyof Row) => munRows.reduce((s, r) => s + (r[k] as number), 0) / munRows.length;
    const pick = (r: Row): Climate => ({ chuva: round(r.chuva, 0), tmax: round(r.tmax), tmin: round(r.tmin), ur: round(r.ur) });
    const dry = munRows.reduce((a, b) => (b.chuva < a.chuva ? b : a));
    const wet = munRows.reduce((a, b) => (b.chuva > a.chuva ? b : a));
    return {
      media: { c: { chuva: round(avg("chuva"), 0), tmax: round(avg("tmax")), tmin: round(avg("tmin")), ur: round(avg("ur")) }, label: t.sim.avg },
      seca: { c: pick(dry), label: t.sim.dry(dry.safra) },
      chuvosa: { c: pick(wet), label: t.sim.wet(wet.safra) },
      histProd: avg("prod"),
    };
  }, [munRows, t]);

  const [clim, setClim] = useState<Climate | null>(null);
  const [preset, setPreset] = useState<"media" | "seca" | "chuvosa" | null>("media");
  useEffect(() => { if (presets) { setClim(presets.media.c); setPreset("media"); } }, [presets]);

  const base = munRows[0];
  const x = (c: Climate) => [base.lat, base.lon, c.tmax, c.tmin, c.chuva, c.ur];

  const out = useMemo(() => {
    if (!model || !clim || !base) return null;
    const p = predictForest(model, x(clim));
    const spread = treeSpread(model, x(clim));
    const [lo, hi] = model.ranges.precipitacao_total_mm;
    const curve = Array.from({ length: 41 }, (_, i) => {
      const chuva = lo + ((hi - lo) * i) / 40;
      const xi = x({ ...clim, chuva });
      const s = treeSpread(model, xi);
      return { chuva: Math.round(chuva), pred: Math.round(predictForest(model, xi)), band: [Math.round(s.p10), Math.round(s.p90)] };
    });
    return { p, spread, curve };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, clim, base]);

  if (!model || !rows || !clim || !presets || !out) {
    return <section id="simulador" className="container-x py-24"><Skeleton className="h-[560px]" /></section>;
  }

  const r = model.ranges;
  const set = (k: keyof Climate) => (v: number) => {
    setPreset(null);
    setClim((c) => {
      const n = { ...c!, [k]: v };
      if (k === "tmin" && v > n.tmax - 8) n.tmax = round(v + 8);
      if (k === "tmax" && v < n.tmin + 8) n.tmin = round(v - 8);
      return n;
    });
  };
  const delta = out.p - presets.histProd;
  const v = model.validation;

  return (
    <section id="simulador" className="relative scroll-mt-16 py-24">
      <div className="absolute inset-x-0 top-1/3 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-grain-400/[0.06] blur-[100px]" />
      <div className="container-x">
        <SectionHeader eyebrow={t.sim.eyebrow} title={<TitleText t={t.sim.title} />}>
          {t.sim.lead(model.trees.length)}
        </SectionHeader>

        <Reveal>
          <div className="card grid overflow-hidden lg:grid-cols-[minmax(0,380px)_1fr]">
            <div className="space-y-6 border-b border-white/[0.07] p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <label className="block">
                <span className="text-sm text-stone-400">{t.sim.municipality}</span>
                <select value={mun} onChange={(e) => select(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-3.5 py-2.5 text-stone-100 outline-none focus:border-grain-400/60">
                  {municipios.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
              <div>
                <span className="text-sm text-stone-400">{t.sim.start}</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["seca", "media", "chuvosa"] as const).map((k) => {
                    const Icon = k === "seca" ? Sun : k === "chuvosa" ? CloudRain : Thermometer;
                    return (
                      <button key={k} onClick={() => { setClim(presets[k].c); setPreset(k); }}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] leading-tight transition ${preset === k ? "border-grain-400/70 bg-grain-400/10 text-grain-200" : "border-white/10 text-stone-400 hover:border-white/25"}`}>
                        <Icon size={16} /> {presets[k].label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Slider label={t.sim.rain} unit="mm" value={clim.chuva} min={r.precipitacao_total_mm[0]} max={r.precipitacao_total_mm[1]} step={10} onChange={set("chuva")} color="#6fb7e8" format={fmt0} />
              <Slider label={t.sim.tmax} unit="°C" value={clim.tmax} min={r.temp_max_media_anual_C[0]} max={r.temp_max_media_anual_C[1]} step={0.1} onChange={set("tmax")} color="#f4a261" format={fmt1} />
              <Slider label={t.sim.tmin} unit="°C" value={clim.tmin} min={r.temp_min_media_anual_C[0]} max={r.temp_min_media_anual_C[1]} step={0.1} onChange={set("tmin")} color="#e9c46a" format={fmt1} />
              <Slider label={t.sim.rh} unit="%" value={clim.ur} min={r.umidade_relativa_media_pct[0]} max={r.umidade_relativa_media_pct[1]} step={0.1} onChange={set("ur")} color="#7bd389" format={fmt1} />
              <button onClick={() => { setClim(presets.media.c); setPreset("media"); }} className="flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-200">
                <RotateCcw size={14} /> {t.sim.reset}
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="text-sm text-stone-400">{t.sim.predicted(mun)}</p>
                  <p className="mt-1 font-display text-6xl font-medium leading-none tabular-nums text-stone-50 sm:text-7xl">
                    <AnimatedNumber value={out.p} /><span className="ml-2 font-mono text-xl text-stone-500">kg/ha</span>
                  </p>
                  <p className="num mt-3 text-stone-400">
                    ≈ {fmt1(out.p / 60)} {t.sim.bags} · {t.sim.spread} {fmt0(out.spread.p10)} {t.sim.to} {fmt0(out.spread.p90)}
                  </p>
                </div>
                <div className={`rounded-2xl px-4 py-3 ${delta >= 0 ? "bg-leaf-500/15 text-leaf-300" : "bg-clay-500/15 text-clay-400"}`}>
                  <p className="text-xs opacity-80">{t.sim.vsHist}</p>
                  <p className="num text-2xl">{delta >= 0 ? "+" : "−"}{fmt0(Math.abs(delta))} <span className="text-sm">kg/ha</span></p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm text-stone-400">{t.sim.curve} <span className="text-stone-600">{t.sim.curveNote}</span></p>
                <div className="mt-3 h-64">
                  <ResponsiveContainer>
                    <ComposedChart data={out.curve} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                      <defs>
                        <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6fb7e8" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#6fb7e8" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                      <XAxis dataKey="chuva" type="number" domain={["dataMin", "dataMax"]} {...axis} tickFormatter={fmt0} />
                      <YAxis {...axis} domain={([lo, hi]: readonly number[]) => [Math.floor((lo - 100) / 250) * 250, Math.ceil((hi + 100) / 250) * 250]} tickFormatter={fmt0} />
                      <Tooltip content={({ active, payload }) => active && payload?.length ? (
                        <TipBox title={`${fmt0((payload[0].payload as { chuva: number }).chuva)} mm`}>
                          <span className="num text-stone-200">{fmt0((payload[0].payload as { pred: number }).pred)} kg/ha</span>
                        </TipBox>) : null} />
                      <Area dataKey="band" stroke="none" fill="url(#band)" isAnimationActive={false} />
                      <Line dataKey="pred" stroke="#6fb7e8" strokeWidth={2.4} dot={false} isAnimationActive={false} type="stepAfter" />
                      <ReferenceLine x={clim.chuva} stroke="rgba(246,227,168,.4)" strokeDasharray="3 3" />
                      <ReferenceDot x={clim.chuva} y={Math.round(out.p)} r={7} fill="#f6e3a8" stroke="#070a08" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Reveal className="card p-5 sm:p-6">
            <h3 className="font-medium text-stone-100">{t.sim.qualTitle}</h3>
            <p className="text-sm text-stone-500">{t.sim.qualSub}</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,.05)" />
                  <XAxis type="number" dataKey="prod" name={t.sim.observed} domain={[2000, 5000]} ticks={[2000, 3000, 4000, 5000]} {...axis} tickFormatter={fmt0} />
                  <YAxis type="number" dataKey="pred_oof" name={t.sim.predictedAxis} domain={[2000, 5000]} ticks={[2000, 3000, 4000, 5000]} {...axis} tickFormatter={fmt0} />
                  <ReferenceLine segment={[{ x: 2000, y: 2000 }, { x: 5000, y: 5000 }]} stroke="rgba(255,255,255,.25)" strokeDasharray="4 4" />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as Row;
                    return <TipBox title={`${p.mun} · ${p.safra}`}><div className="num">{t.sim.obs} {fmt0(p.prod)} · {t.sim.pred} {fmt0(p.pred_oof)}</div></TipBox>;
                  }} />
                  <Scatter data={rows} fill="#e9c46a" fillOpacity={0.45} shape="circle" isAnimationActive={false} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="card flex flex-col justify-between p-5 sm:p-6">
            <div>
              <h3 className="font-medium text-stone-100">{t.sim.sheet}</h3>
              <dl className="mt-5 space-y-3 text-sm">
                <Row2 k={t.sim.rows.algo} v={t.sim.rows.algoV(model.params.n_estimators, model.params.max_depth)} />
                <Row2 k={t.sim.rows.inputs} v={t.sim.rows.inputsV} />
                <Row2 k={t.sim.rows.r2k} v={fmt2(v.kfold5.r2)} mono />
                <Row2 k={t.sim.rows.r2g} v={fmt2(v.groupkfold5_municipio.r2)} mono />
                <Row2 k={t.sim.rows.err} v={`${fmt0(v.kfold5.rmse)} / ${fmt0(v.kfold5.mae)} kg/ha`} mono />
                <Row2 k={t.sim.rows.size} v={t.sim.rows.sizeV} />
              </dl>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-stone-500">
              {t.sim.note}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Row2({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/[0.05] pb-2.5">
      <dt className="text-stone-500">{k}</dt>
      <dd className={`text-right text-stone-200 ${mono ? "num" : ""}`}>{v}</dd>
    </div>
  );
}
