import { motion, useScroll, useTransform } from "framer-motion";
import { Github } from "lucide-react";
import { useLang, useT, type Lang } from "../lib/i18n";
import clsx from "clsx";


export function Nav() {
  const t = useT();
  const LINKS = [["#atlas", t.nav.atlas], ["#tendencias", t.nav.trends], ["#modelos", t.nav.models], ["#simulador", t.nav.sim], ["#metodo", t.nav.method]] as const;
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["rgba(7,10,8,0)", "rgba(7,10,8,0.82)"]);
  const border = useTransform(scrollY, [0, 120], ["rgba(255,255,255,0)", "rgba(255,255,255,0.07)"]);
  return (
    <motion.header style={{ backgroundColor: bg, borderColor: border }} className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md">
      <nav className="container-x flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" aria-label={t.nav.home}>
          <Logo />
          <span className="font-display text-lg tracking-tight text-stone-50">SojaPredict <span className="italic text-grain-400">Atlas</span></span>
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="text-sm text-stone-400 transition-colors hover:text-stone-50">{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
        <LangSwitch />
        <a href="https://github.com/gabrielSallesSi/sojapredict-atlas" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-stone-300 transition hover:border-grain-400/60 hover:text-stone-50">
          <Github size={15} /> <span className="hidden sm:inline">GitHub</span>
        </a>
        </div>
      </nav>
    </motion.header>
  );
}

function LangSwitch() {
  const { lang, setLang } = useLang();
  const t = useT();
  const opts: { v: Lang; label: string; full: string }[] = [
    { v: "pt", label: "PT", full: "Português (Brasil)" },
    { v: "en", label: "EN", full: "English" },
  ];
  return (
    <div role="group" aria-label={t.nav.langLabel} className="flex rounded-full border border-white/10 p-0.5 font-mono text-xs">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => setLang(o.v)}
          aria-pressed={lang === o.v}
          title={o.full}
          lang={o.v === "pt" ? "pt-BR" : "en"}
          className={clsx("rounded-full px-2.5 py-1 transition", lang === o.v ? "bg-grain-400 text-ink-950" : "text-stone-400 hover:text-stone-100")}
        >
          {o.label}
        </button>
      ))}
    </div>
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
