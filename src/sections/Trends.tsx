import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { motion } from "framer-motion";
import { useDataset, useResults } from "../lib/data";
import { REGION_COLOR, REGIONS } from "../lib/colors";
import { FEATURE_LABEL, fmt0, fmt2 } from "../lib/format";
import { Reveal, SectionHeader, Segmented } from "../components/ui";
import { TipBox } from "../components/ChartTooltip";
import type { Region, Row } from "../lib/types";

const axis = { tick: { fill: "#78716c", fontSize: 11 }, axisLine: false, tickLine: false } as const;

type XKey = "chuva" | "def" | "tmax";
const X_OPTS: Record<XKey, { label: string; unit: string; corrKey: string }> = {
  chuva: { label: "Chuva", unit: "mm", corrKey: "precipitacao_total_mm" },
  def: { label: "Déficit hídrico", unit: "mm", corrKey: "def_hidrico_mm" },
  tmax: { label: "Temp. máxima", unit: "°C", corrKey: "temp_max_media_anual_C" },
};

export function Trends() {
  const { data: rows } = useDataset();
  const { data: res } = useResults();
  const [xKey, setXKey] = useState<XKey>("chuva");
  const [hiddenRegions, setHidden] = useState<Set<Region>>(new Set());

  const series = useMemo(() => {
    if (!rows) return [];
    const years = [...new Set(rows.map((r) => r.ano))].sort();
    return years.map((ano) => {
      const o: Record<string, number> = { ano };
      for (const reg of REGIONS) {
        const v = rows.filter((r) => r.ano === ano && r.reg === reg);
        o[reg] = Math.round(v.reduce((s, r) => s + r.prod, 0) / v.length);
      }
      const all = rows.filter((r) => r.ano === ano);
      o.Goiás = Math.round(all.reduce((s, r) => s + r.prod, 0) / all.length);
      return o;
    });
  }, [rows]);

  const corr = useMemo(() => {
    if (!res) return [];
    return Object.entries(res.corr_prod).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v);
  }, [res]);

  const toggle = (r: Region) => setHidden((s) => { const n = new Set(s); n.has(r) ? n.delete(r) : n.add(r); return n; });

  return (
    <section id="tendencias" className="scroll-mt-16 py-24">
      <div className="container-x">
        <SectionHeader eyebrow="02 · Tendências" title={<>Onde chove mais, <span className="italic text-grain-400">colhe-se mais</span>.</>}>
          A produtividade média subiu ao longo da década, com quedas marcantes nas safras 2014/15 e 2020/21. Entre as variáveis climáticas, as ligadas à disponibilidade de água são as que mais acompanham o rendimento.
        </SectionHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal className="card p-5 sm:p-6">
            <h3 className="font-medium text-stone-100">Produtividade média por região</h3>
            <p className="text-sm text-stone-500">kg/ha · clique na legenda para ocultar regiões</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer>
                <LineChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                  <XAxis dataKey="ano" {...axis} />
                  <YAxis {...axis} domain={[2500, 4500]} ticks={[2500, 3000, 3500, 4000, 4500]} tickFormatter={fmt0} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <TipBox title={`Safra ${Number(label) - 1}/${String(label).slice(2)}`}>
                          {payload.map((p) => (
                            <div key={p.dataKey as string} className="flex justify-between gap-6">
                              <span style={{ color: p.color }}>{p.dataKey as string}</span>
                              <span className="num text-stone-200">{fmt0(p.value as number)}</span>
                            </div>
                          ))}
                        </TipBox>
                      ) : null
                    }
                  />
                  <Legend
                    onClick={(e) => e.dataKey !== "Goiás" && toggle(e.dataKey as Region)}
                    wrapperStyle={{ fontSize: 12, cursor: "pointer", paddingTop: 8 }}
                    formatter={(v: string) => <span style={{ color: hiddenRegions.has(v as Region) ? "#57534e" : "#d6d3d1" }}>{v}</span>}
                  />
                  {REGIONS.map((r) => (
                    <Line key={r} dataKey={r} stroke={REGION_COLOR[r]} strokeWidth={1.6} dot={false} hide={hiddenRegions.has(r)} animationDuration={1200} />
                  ))}
                  <Line dataKey="Goiás" stroke="#fafaf9" strokeWidth={2.6} strokeDasharray="5 4" dot={{ r: 2.5, fill: "#fafaf9" }} animationDuration={1400} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-stone-100">{X_OPTS[xKey].label} × produtividade</h3>
                <p className="text-sm text-stone-500">
                  660 pontos · Pearson r ={" "}
                  <span className="num text-grain-300">{res ? fmt2(res.corr_prod[X_OPTS[xKey].corrKey]) : "…"}</span>
                </p>
              </div>
              <Segmented<XKey> value={xKey} onChange={setXKey} options={(Object.keys(X_OPTS) as XKey[]).map((k) => ({ value: k, label: X_OPTS[k].label }))} />
            </div>
            <div className="mt-4 h-80">
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,.05)" />
                  <XAxis type="number" dataKey={xKey} name={X_OPTS[xKey].label} {...axis} domain={["dataMin", "dataMax"]} tickFormatter={fmt0} />
                  <YAxis type="number" dataKey="prod" {...axis} domain={[2000, 5000]} ticks={[2000, 3000, 4000, 5000]} tickFormatter={fmt0} />
                  <ZAxis range={[22, 22]} />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,.15)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const r = payload[0].payload as Row;
                      return (
                        <TipBox title={`${r.mun} · ${r.safra}`}>
                          <div className="num text-stone-200">{fmt0(r.prod)} kg/ha</div>
                          <div className="num">{X_OPTS[xKey].label}: {fmt0(r[xKey])} {X_OPTS[xKey].unit}</div>
                        </TipBox>
                      );
                    }}
                  />
                  {REGIONS.map((reg) => (
                    <Scatter key={reg} data={rows?.filter((r) => r.reg === reg) ?? []} fill={REGION_COLOR[reg]} fillOpacity={0.65} animationDuration={900} />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Reveal>
        </div>

        <Reveal className="card mt-6 p-5 sm:p-6">
          <h3 className="font-medium text-stone-100">Correlação de cada variável com a produtividade</h3>
          <p className="text-sm text-stone-500">Coeficiente de Pearson, dissertação (n = 660)</p>
          <div className="mt-6 grid gap-x-10 gap-y-2.5 md:grid-cols-2">
            {corr.map(({ k, v }, i) => (
              <div key={k} className="grid grid-cols-[10rem_1fr_3rem] items-center gap-3 text-sm sm:grid-cols-[13rem_1fr_3rem]">
                <span className="truncate text-stone-400">{FEATURE_LABEL[k] ?? k}</span>
                <div className="relative h-2 rounded-full bg-ink-700">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-y-0 rounded-full"
                    style={{
                      left: v >= 0 ? "50%" : `${50 + v * 50}%`,
                      width: `${Math.abs(v) * 50}%`,
                      background: v >= 0 ? "#7bd389" : "#f4a261",
                      transformOrigin: v >= 0 ? "left" : "right",
                    }}
                  />
                </div>
                <span className={`num text-right ${v >= 0 ? "text-leaf-400" : "text-clay-400"}`}>{fmt2(v)}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
