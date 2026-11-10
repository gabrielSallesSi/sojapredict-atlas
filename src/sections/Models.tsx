import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useResults } from "../lib/data";
import { fmt0, fmt2, fmt3 } from "../lib/format";
import { Reveal, SectionHeader, Skeleton, TitleText } from "../components/ui";
import { useT } from "../lib/i18n";

const KEYS = ["T1_Linear", "T2_RandomForest", "T3_XGBoost", "T4_MLP"] as const;

export function Models() {
  const { data: res } = useResults();
  const t = useT();
  const SHORT = t.models.short;
  if (!res) return <div className="container-x py-24"><Skeleton className="h-96" /></div>;

  const best = KEYS.reduce((a, b) => (res.cv_summary[a].R2_mean >= res.cv_summary[b].R2_mean ? a : b));
  const maxImp = Math.max(...res.importancia_rf.map((d) => d.Importance));

  const dm = (a: string, b: string) => res.diebold_mariano[`${a}_vs_${b}`] ?? res.diebold_mariano[`${b}_vs_${a}`];

  return (
    <section id="modelos" className="scroll-mt-16 py-24">
      <div className="container-x">
        <SectionHeader eyebrow={t.models.eyebrow} title={<TitleText t={t.models.title} />}>
          {t.models.lead}
        </SectionHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KEYS.map((k, i) => {
            const cv = res.cv_summary[k];
            const tt = res.train_test[k];
            const isBest = k === best;
            return (
              <Reveal key={k} delay={i * 0.08}>
                <div className={`card relative h-full overflow-hidden p-5 ${isBest ? "!border-grain-400/50" : ""}`}>
                  {isBest && <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-grain-400/20 blur-2xl" />}
                  <div className="relative flex items-center justify-between">
                    <h3 className="font-medium text-stone-100">{t.modelLabel[k]}</h3>
                    {isBest && <span className="flex items-center gap-1 rounded-full bg-grain-400 px-2 py-0.5 text-[11px] font-semibold text-ink-950"><Trophy size={11} /> {t.models.best}</span>}
                  </div>
                  <p className="mt-5 text-xs text-stone-500">{t.models.r2cv}</p>
                  <p className="num text-4xl text-stone-50">{fmt3(cv.R2_mean)}<span className="ml-1 text-base text-stone-500">± {fmt2(cv.R2_std)}</span></p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-700">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${cv.R2_mean * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.2 + i * 0.1 }} className={`h-full rounded-full ${isBest ? "bg-grain-400" : "bg-leaf-500"}`} />
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-stone-500">RMSE</dt><dd className="num text-right text-stone-200">{fmt0(cv.RMSE_mean)} kg/ha</dd>
                    <dt className="text-stone-500">MAE</dt><dd className="num text-right text-stone-200">{fmt0(cv.MAE_mean)} kg/ha</dd>
                    <dt className="text-stone-500">{t.models.mapeTest}</dt><dd className="num text-right text-stone-200">{fmt2(tt.MAPE_test)}%</dd>
                    <dt className="text-stone-500">{t.models.trainTest}</dt><dd className="num text-right text-stone-200">{fmt2(tt.R2_train)} → {fmt2(tt.R2_test)}</dd>
                  </dl>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Reveal className="card p-5 sm:p-6">
            <h3 className="font-medium text-stone-100">{t.models.dmTitle}</h3>
            <p className="text-sm text-stone-500">{t.models.dmSub}</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[320px] border-separate border-spacing-1.5 text-center text-sm">
                <thead>
                  <tr><th />{KEYS.map((k) => <th key={k} className="pb-1 font-mono text-xs font-normal text-stone-500">{SHORT[k]}</th>)}</tr>
                </thead>
                <tbody>
                  {KEYS.map((a) => (
                    <tr key={a}>
                      <th className="pr-2 text-right font-mono text-xs font-normal text-stone-500">{SHORT[a]}</th>
                      {KEYS.map((b) => {
                        if (a === b) return <td key={b} className="rounded-lg bg-ink-800/40 py-3 text-stone-700">·</td>;
                        const d = dm(a, b);
                        const sig = d?.sig === "*";
                        return (
                          <td key={b} title={`DM = ${fmt3(d.DM)}`} className={`rounded-lg py-3 ${sig ? "bg-leaf-500/20 text-leaf-300" : "bg-ink-800 text-stone-500"}`}>
                            <span className="num text-xs">p={fmt3(d.p)}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-400">
              {t.models.dmText(fmt3(dm("T2_RandomForest", "T3_XGBoost").p))}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="card p-5 sm:p-6">
            <h3 className="font-medium text-stone-100">{t.models.impTitle}</h3>
            <p className="text-sm text-stone-500">{t.models.impSub}</p>
            <ul className="mt-6 space-y-2.5">
              {res.importancia_rf.slice(0, 10).map((d, i) => (
                <li key={d.Feature} className="grid grid-cols-[11rem_1fr_3.5rem] items-center gap-3 text-sm sm:grid-cols-[14rem_1fr_3.5rem]">
                  <span className="truncate text-stone-400">{t.feature[d.Feature] ?? d.Feature}</span>
                  <div className="h-5 overflow-hidden rounded bg-ink-800">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(d.Importance / maxImp) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded"
                      style={{ background: `linear-gradient(90deg, #2d6a4f, ${i < 3 ? "#e9c46a" : "#7bd389"})` }}
                    />
                  </div>
                  <span className="num text-right text-stone-300">{fmt3(d.Importance)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-stone-400">{t.models.impText}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
