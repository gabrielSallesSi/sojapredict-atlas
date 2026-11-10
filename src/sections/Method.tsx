import { Database, CloudSun, Cpu, LineChart } from "lucide-react";
import { Reveal, SectionHeader, TitleText } from "../components/ui";
import { useT } from "../lib/i18n";
import { Logo } from "../components/Nav";

const ICONS = [Database, CloudSun, Cpu, LineChart];

const STACK = ["React 18", "TypeScript", "Vite", "Tailwind CSS", "Framer Motion", "Recharts", "D3-geo", "TanStack Query", "Zustand", "Vitest", "GitHub Actions", "Python · scikit-learn"];

export function Method() {
  const t = useT();
  const STEPS = t.method.steps.map((s, i) => ({ ...s, icon: ICONS[i] }));
  return (
    <section id="metodo" className="scroll-mt-16 py-24">
      <div className="container-x">
        <SectionHeader eyebrow={t.method.eyebrow} title={<TitleText t={t.method.title} />} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08} className="card relative p-6">
              <span className="num absolute right-5 top-5 text-xs text-stone-600">0{i + 1}</span>
              <s.icon className="text-grain-400" size={22} />
              <h3 className="mt-5 font-display text-xl text-stone-50">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-400">{s.d}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex flex-wrap gap-2">
          {STACK.map((s) => <span key={s} className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-stone-400">{s}</span>)}
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-white/[0.07] py-12">
      <div className="container-x flex flex-col gap-6 text-sm text-stone-500 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Logo size={24} />
          <div>
            <p className="text-stone-300">Gabriel Sá da Silveira</p>
            <p>{t.footer.degree}</p>
          </div>
        </div>
        <div className="flex gap-5">
          <a className="hover:text-stone-200" href="https://github.com/gabrielSallesSi" target="_blank" rel="noreferrer">GitHub</a>
          <a className="hover:text-stone-200" href="https://www.linkedin.com/in/gabriel-s%C3%A1-da-silveira-1298ab201/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
