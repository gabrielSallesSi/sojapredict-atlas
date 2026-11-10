import { Database, CloudSun, Cpu, LineChart } from "lucide-react";
import { Reveal, SectionHeader } from "../components/ui";
import { Logo } from "../components/Nav";

const STEPS = [
  { icon: Database, t: "Dados", d: "Produtividade municipal (CONAB, IBGE/PAM, SEAPA-GO) integrada a 55 municípios e 12 safras, 2014 a 2025." },
  { icon: CloudSun, t: "Clima e água", d: "Normais climatológicas e anomalias do INMET; balanço hídrico de Thornthwaite-Mather com ETP, ETR, déficit e excedente." },
  { icon: Cpu, t: "Modelagem", d: "Regressão linear, Random Forest, XGBoost e MLP em Python (scikit-learn), com validação cruzada e testes estatísticos." },
  { icon: LineChart, t: "Apoio à decisão", d: "Resultados e um modelo compacto exportados para JSON e servidos como site estático, sem backend." },
];

const STACK = ["React 18", "TypeScript", "Vite", "Tailwind CSS", "Framer Motion", "Recharts", "D3-geo", "TanStack Query", "Zustand", "Vitest", "GitHub Actions", "Python · scikit-learn"];

export function Method() {
  return (
    <section id="metodo" className="scroll-mt-16 py-24">
      <div className="container-x">
        <SectionHeader eyebrow="05 · Método" title={<>Do dado bruto ao <span className="italic text-grain-400">navegador</span>.</>} />
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
  return (
    <footer className="border-t border-white/[0.07] py-12">
      <div className="container-x flex flex-col gap-6 text-sm text-stone-500 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Logo size={24} />
          <div>
            <p className="text-stone-300">Gabriel Sá da Silveira</p>
            <p>Mestrado em Engenharia Agrícola · UEG · Orientação: Prof. Dr. Francisco Ramos de Melo</p>
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
