import { motion, useScroll, useTransform } from "framer-motion";
import { Github } from "lucide-react";

const LINKS = [
  ["#atlas", "Atlas"],
  ["#tendencias", "Tendências"],
  ["#modelos", "Modelos"],
  ["#simulador", "Simulador"],
  ["#metodo", "Método"],
] as const;

export function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["rgba(7,10,8,0)", "rgba(7,10,8,0.82)"]);
  const border = useTransform(scrollY, [0, 120], ["rgba(255,255,255,0)", "rgba(255,255,255,0.07)"]);
  return (
    <motion.header style={{ backgroundColor: bg, borderColor: border }} className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md">
      <nav className="container-x flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" aria-label="Início">
          <Logo />
          <span className="font-display text-lg tracking-tight text-stone-50">SojaPredict <span className="italic text-grain-400">Atlas</span></span>
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="text-sm text-stone-400 transition-colors hover:text-stone-50">{label}</a>
          ))}
        </div>
        <a href="https://github.com/gabrielSallesSi" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-stone-300 transition hover:border-grain-400/60 hover:text-stone-50">
          <Github size={15} /> <span className="hidden sm:inline">GitHub</span>
        </a>
      </nav>
    </motion.header>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="15" fill="none" stroke="rgba(233,196,106,.35)" />
      <ellipse cx="12.5" cy="16" rx="4.2" ry="6.4" fill="#e9c46a" />
      <ellipse cx="19.5" cy="16" rx="4.2" ry="6.4" fill="#7bd389" opacity=".9" />
    </svg>
  );
}
