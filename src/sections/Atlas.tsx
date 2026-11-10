import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { useDataset, useGeo } from "../lib/data";
import { useAtlas } from "../lib/store";
import { makeScale, REGION_COLOR, type MetricKey } from "../lib/colors";
import { fmt0, fmt1 } from "../lib/format";
import { GoiasMap } from "../components/GoiasMap";
import { GradientLegend } from "../components/Legend";
import { Reveal, SectionHeader, Segmented, Skeleton } from "../components/ui";
import { TipBox } from "../components/ChartTooltip";
import type { Row } from "../lib/types";

const METRICS: Record<MetricKey, { label: string; unit: string; key: keyof Row; f: (n: number) => string }> = {
  prod: { label: "Produtividade", unit: "kg/ha", key: "prod", f: fmt0 },
  chuva: { label: "Chuva", unit: "mm/ano", key: "chuva", f: fmt0 },
  tmax: { label: "Temp. máxima", unit: "°C", key: "tmax", f: fmt1 },
};

export function Atlas() {
  const { data: rows } = useDataset();
  const { data: geo } = useGeo();
  const { year, setYear, metric, setMetric, selected, select } = useAtlas();
  const [playing, setPlaying] = useState(false);

  const years = useMemo(() => (rows ? [...new Set(rows.map((r) => r.ano))].sort() : []), [rows]);
  const m = METRICS[metric];

  useEffect(() => {
    if (!playing || !years.length) return;
    const id = setInterval(() => {
      const s = useAtlas.getState();
      const i = years.indexOf(s.year);
      if (i >= years.length - 1) { setPlaying(false); return; }
      s.setYear(years[i + 1]);
    }, 900);
    return () => clearInterval(id);
  }, [playing, years]);

  const { byMun, scale, domain, geoNames, extra, yearRows } = useMemo(() => {
    if (!rows || !geo) return { byMun: new Map<string, Row>(), scale: null, domain: [0, 1] as [number, number], geoNames: new Set<string>(), extra: [], yearRows: [] as Row[] };
    const vals = rows.map((r) => r[m.key] as number).sort((a, b) => a - b);
    const q = (p: number) => vals[Math.floor(p * (vals.length - 1))];
    const domain: [number, number] = [q(0.02), q(0.98)];
    const yearRows = rows.filter((r) => r.ano === year);
    const byMun = new Map(yearRows.map((r) => [r.mun, r]));
    const geoNames = new Set(geo.features.map((f) => f.properties.name));
    const extra = yearRows.filter((r) => !geoNames.has(r.mun)).map((r) => ({ name: r.mun, lat: r.lat, lon: r.lon }));
    return { byMun, scale: makeScale(metric, domain), domain, geoNames, extra, yearRows };
  }, [rows, geo, year, metric, m.key]);

  const sel = selected ? byMun.get(selected) : undefined;
  const history = useMemo(() => (rows && selected ? rows.filter((r) => r.mun === selected).sort((a, b) => a.ano - b.ano) : []), [rows, selected]);
  const ranked = useMemo(() => [...yearRows].sort((a, b) => b.prod - a.prod), [yearRows]);
  const rank = sel ? ranked.findIndex((r) => r.mun === sel.mun) + 1 : 0;
  const stateMean = yearRows.length ? yearRows.reduce((s, r) => s + r.prod, 0) / yearRows.length : 0;

  return (
    <section id="atlas" className="relative scroll-mt-16 py-24">
      <div className="container-x">
        <SectionHeader eyebrow="01 · Atlas" title={<>Doze safras, <span className="italic text-grain-400">município a município</span>.</>}>
          Aperte o play para ver a produtividade evoluir ano a ano, troque a variável para comparar com chuva e temperatura, e clique em um município para ver sua trajetória.
        </SectionHeader>

        <Reveal>
          <div className="card overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <Segmented<MetricKey>
                value={metric}
                onChange={setMetric}
                options={(Object.keys(METRICS) as MetricKey[]).map((k) => ({ value: k, label: METRICS[k].label }))}
              />
              <div className="flex flex-1 items-center gap-4 sm:max-w-md">
                <button
                  onClick={() => { if (!playing && year === years[years.length - 1]) setYear(years[0]); setPlaying((p) => !p); }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-grain-400 text-ink-950 transition hover:bg-grain-300"
                  aria-label={playing ? "Pausar animação" : "Animar safras"}
                >
                  {playing ? <Pause size={16} /> : <Play size={16} className="translate-x-px" />}
                </button>
                <input
                  type="range" min={years[0] ?? 2014} max={years[years.length - 1] ?? 2025} step={1} value={year}
                  onChange={(e) => { setPlaying(false); setYear(Number(e.target.value)); }}
                  style={{ ["--p" as string]: `${years.length ? ((year - years[0]) / (years.length - 1)) * 100 : 0}%` }}
                  aria-label="Ano da safra"
                />
                <div className="w-20 text-right">
                  <AnimatePresence mode="popLayout">
                    <motion.span key={year} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="num block text-2xl text-stone-50">
                      {year}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.25fr_1fr]">
              <div className="relative p-4 sm:p-8">
                {geo && scale ? (
                  <>
                    <GoiasMap
                      geo={geo}
                      selected={selected}
                      onSelect={select}
                      extraPoints={extra}
                      fill={(name) => { const r = byMun.get(name); return r ? scale(r[m.key] as number) : null; }}
                      tooltip={(name) => {
                        const r = byMun.get(name);
                        if (!r) return null;
                        return (
                          <TipBox title={name}>
                            <div>{r.reg} · safra {r.safra}</div>
                            <div className="num text-stone-200">{fmt0(r.prod)} kg/ha · {fmt1(r.sc)} sc/ha</div>
                            <div className="num">{fmt0(r.chuva)} mm · {fmt1(r.tmax)} °C máx.</div>
                          </TipBox>
                        );
                      }}
                    />
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                      <GradientLegend metric={metric} min={m.f(domain[0])} max={m.f(domain[1])} unit={m.unit} />
                      <p className="text-xs text-stone-500">{geoNames.size ? `${byMun.size} municípios com dados · cinza: sem dados` : ""}</p>
                    </div>
                  </>
                ) : (
                  <Skeleton className="aspect-[56/62] w-full" />
                )}
              </div>

              <aside className="border-t border-white/[0.07] p-5 sm:p-8 lg:border-l lg:border-t-0">
                {sel ? (
                  <motion.div key={sel.mun} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full" style={{ background: REGION_COLOR[sel.reg] }} />
                      <span className="text-stone-400">Região {sel.reg}</span>
                    </div>
                    <h3 className="mt-2 font-display text-3xl text-stone-50">{sel.mun}</h3>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <Stat label={`Produtividade ${sel.safra}`} value={`${fmt0(sel.prod)}`} unit="kg/ha" accent />
                      <Stat label="Posição no estado" value={`${rank}º`} unit={`de ${ranked.length}`} />
                      <Stat label="Chuva" value={fmt0(sel.chuva)} unit="mm" />
                      <Stat label="Déficit hídrico" value={fmt0(sel.def)} unit="mm" />
                    </div>
                    <p className="mt-4 text-sm text-stone-400">
                      {sel.prod >= stateMean ? "Acima" : "Abaixo"} da média dos municípios na safra ({fmt0(stateMean)} kg/ha) em{" "}
                      <span className="num text-stone-200">{fmt0(Math.abs(sel.prod - stateMean))} kg/ha</span>.
                    </p>
                    <div className="mt-6 h-40">
                      <ResponsiveContainer>
                        <AreaChart data={history} margin={{ top: 5, right: 4, bottom: 0, left: -18 }}>
                          <defs>
                            <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#e9c46a" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="#e9c46a" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="ano" tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
                          <YAxis tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} domain={["dataMin - 200", "dataMax + 200"]} tickFormatter={(v) => fmt0(v)} />
                          <ReferenceLine x={year} stroke="#f6e3a8" strokeDasharray="3 3" />
                          <Tooltip content={({ active, payload }) => active && payload?.length ? <TipBox title={`Safra ${(payload[0].payload as Row).safra}`}><span className="num text-stone-200">{fmt0(payload[0].value as number)} kg/ha</span></TipBox> : null} />
                          <Area type="monotone" dataKey="prod" stroke="#e9c46a" strokeWidth={2} fill="url(#spark)" dot={false} activeDot={{ r: 4, fill: "#f6e3a8" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-stone-500">Clique em um município colorido no mapa.</p>
                )}
                <div className="mt-8 border-t border-white/[0.07] pt-6">
                  <p className="eyebrow !text-stone-500">Top 5 · safra {year}</p>
                  <ol className="mt-3 space-y-1.5">
                    {ranked.slice(0, 5).map((r, i) => (
                      <li key={r.mun}>
                        <button onClick={() => select(r.mun)} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-white/5">
                          <span className="num w-4 text-stone-500">{i + 1}</span>
                          <span className="flex-1 text-stone-200">{r.mun}</span>
                          <span className="num text-grain-300">{fmt0(r.prod)}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-ink-800/70 p-3.5">
      <p className="text-xs text-stone-500">{label}</p>
      <p className={`num mt-1 text-xl ${accent ? "text-grain-300" : "text-stone-100"}`}>{value} <span className="text-xs text-stone-500">{unit}</span></p>
    </div>
  );
}
