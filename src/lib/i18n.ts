import { create } from "zustand";
import type { Region } from "./types";

export type Lang = "pt" | "en";

const KEY = "sojapredict-lang";

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "pt" || q === "en") return q;
    const s = localStorage.getItem(KEY);
    if (s === "pt" || s === "en") return s;
  } catch { /* storage indisponível */ }
  return typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
}

function applyDocument(lang: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.title = dict[lang].meta.title;
}

export const useLang = create<{ lang: Lang; setLang: (l: Lang) => void }>((set) => ({
  lang: typeof window === "undefined" ? "pt" : initialLang(),
  setLang: (lang) => {
    try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
    applyDocument(lang);
    set({ lang });
  },
}));

export const locale = () => (useLang.getState().lang === "pt" ? "pt-BR" : "en-US");

type Title = { a: string; em: string; b: string };

const pt = {
  meta: { title: "SojaPredict Atlas · Produtividade da soja em Goiás" },
  nav: { atlas: "Atlas", trends: "Tendências", models: "Modelos", sim: "Simulador", method: "Método", home: "Início", langLabel: "Idioma" },
  regions: { Norte: "Norte", Leste: "Leste", Centro: "Centro", Sul: "Sul", Sudoeste: "Sudoeste" } as Record<Region, string>,
  season: "Safra",
  hero: {
    eyebrow: "Dissertação de mestrado · Engenharia Agrícola · UEG",
    l1: "O clima conta", l2: "a história da", em: "safra",
    lead: "Um atlas interativo da produtividade da soja em Goiás. Explore doze safras no mapa, compare quatro modelos de aprendizado de máquina e simule cenários climáticos com um Random Forest que roda direto no seu navegador.",
    cta1: "Simular uma safra", cta2: "Explorar o mapa",
    stats: ["observações município-safra", "municípios goianos", "safras (2014–2025)", "R² médio do Random Forest (validação cruzada)"],
  },
  atlas: {
    eyebrow: "01 · Atlas",
    title: { a: "Doze safras, ", em: "município a município", b: "." } as Title,
    lead: "Aperte o play para ver a produtividade evoluir ano a ano, troque a variável para comparar com chuva e temperatura, e clique em um município para ver sua trajetória.",
    metrics: { prod: "Produtividade", chuva: "Chuva", tmax: "Temp. máxima" },
    units: { prod: "kg/ha", chuva: "mm/ano", tmax: "°C" },
    play: "Animar safras", pause: "Pausar animação", year: "Ano da safra",
    withData: (n: number) => `${n} municípios com dados · cinza: sem dados`,
    region: (r: string) => `Região ${r}`,
    prodSeason: (s: string) => `Produtividade ${s}`,
    rank: "Posição no estado", of: (n: number) => `de ${n}`, rankFmt: (n: number) => `${n}º`,
    rain: "Chuva", deficit: "Déficit hídrico",
    vsMean: (above: boolean): string => (above ? "Acima" : "Abaixo"),
    vsMeanTail: (mean: string) => ` da média dos municípios na safra (${mean} kg/ha) em `,
    clickHint: "Clique em um município colorido no mapa.",
    top5: (y: number) => `Top 5 · safra ${y}`,
    tipMax: "máx.",
    mapLabel: "Mapa dos municípios de Goiás",
  },
  trends: {
    eyebrow: "02 · Tendências",
    title: { a: "Onde chove mais, ", em: "colhe-se mais", b: "." } as Title,
    lead: "A produtividade média subiu ao longo da década, com quedas marcantes nas safras 2014/15 e 2020/21. Entre as variáveis climáticas, as ligadas à disponibilidade de água são as que mais acompanham o rendimento.",
    byRegion: "Produtividade média por região",
    byRegionSub: "kg/ha · clique na legenda para ocultar regiões",
    state: "Goiás",
    x: { chuva: "Chuva", def: "Déficit hídrico", tmax: "Temp. máxima" },
    scatterSub: "660 pontos · Pearson r =",
    corrTitle: "Correlação de cada variável com a produtividade",
    corrSub: "Coeficiente de Pearson, dissertação (n = 660)",
  },
  models: {
    eyebrow: "03 · Modelos",
    title: { a: "Quatro algoritmos, ", em: "um vencedor discreto", b: "." } as Title,
    lead: "Regressão linear, Random Forest, XGBoost e rede neural MLP foram treinados com 14 variáveis climáticas e de balanço hídrico e avaliados por validação cruzada e por teste de Diebold-Mariano.",
    best: "melhor", r2cv: "R² na validação cruzada", mapeTest: "MAPE teste", trainTest: "R² treino → teste",
    dmTitle: "Teste de Diebold-Mariano",
    dmSub: "Os erros de previsão diferem de forma significativa? (α = 0,05)",
    dmText: (p: string) => `Random Forest e XGBoost superam significativamente a regressão linear, mas não diferem entre si (p = ${p}). Ganho real dos modelos de árvores, sem um campeão absoluto.`,
    impTitle: "O que o Random Forest mais usa",
    impSub: "Importância por redução de impureza (dissertação)",
    impText: "As variáveis de água (evapotranspiração real, chuva, aridez e déficit hídrico) dominam o ranking.",
    short: { T1_Linear: "Linear", T2_RandomForest: "RF", T3_XGBoost: "XGB", T4_MLP: "MLP" } as Record<string, string>,
  },
  sim: {
    eyebrow: "04 · Simulador",
    title: { a: "E se chovesse ", em: "menos", b: "?" } as Title,
    lead: (n: number) => `Escolha um município e ajuste o clima da safra. Um Random Forest com ${n} árvores, exportado do Python, calcula a produtividade esperada aqui mesmo no navegador, sem servidor.`,
    municipality: "Município", start: "Cenário de partida",
    avg: "Média 2014–2025", dry: (s: string) => `Mais seca (${s})`, wet: (s: string) => `Mais chuvosa (${s})`,
    rain: "Precipitação anual", tmax: "Temperatura máxima média", tmin: "Temperatura mínima média", rh: "Umidade relativa média",
    reset: "Voltar à média do município",
    predicted: (m: string) => `Produtividade prevista · ${m}`,
    bags: "sc/ha", spread: "faixa das árvores (p10–p90):", to: "a",
    vsHist: "vs. média observada do município",
    curve: "Curva de resposta à chuva", curveNote: "(demais variáveis fixas)",
    qualTitle: "Quão bom é o modelo do navegador?",
    qualSub: "Observado × previsto fora da amostra (validação cruzada 5-fold)",
    obs: "obs.", pred: "prev.", observed: "Observado", predictedAxis: "Previsto",
    sheet: "Ficha técnica",
    rows: {
      algo: "Algoritmo", algoV: (n: number, d: number) => `Random Forest · ${n} árvores · prof. máx. ${d}`,
      inputs: "Entradas", inputsV: "lat., long., temp. máx., temp. mín., chuva, umidade",
      r2k: "R² (5-fold aleatório)", r2g: "R² (5-fold por município)", err: "RMSE / MAE",
      size: "Tamanho", sizeV: "~430 kB em JSON, inferência em TypeScript",
    },
    note: "Versão compacta, com menos variáveis que os modelos da dissertação, para caber no navegador. O desempenho fica próximo ao do Random Forest completo (R² 0,55). Valores fora da faixa observada não são extrapolados.",
  },
  method: {
    eyebrow: "05 · Método",
    title: { a: "Do dado bruto ao ", em: "navegador", b: "." } as Title,
    steps: [
      { t: "Dados", d: "Produtividade municipal (CONAB, IBGE/PAM, SEAPA-GO) integrada a 55 municípios e 12 safras, 2014 a 2025." },
      { t: "Clima e água", d: "Normais climatológicas e anomalias do INMET; balanço hídrico de Thornthwaite-Mather com ETP, ETR, déficit e excedente." },
      { t: "Modelagem", d: "Regressão linear, Random Forest, XGBoost e MLP em Python (scikit-learn), com validação cruzada e testes estatísticos." },
      { t: "Apoio à decisão", d: "Resultados e um modelo compacto exportados para JSON e servidos como site estático, sem backend." },
    ],
  },
  footer: { degree: "Mestrado em Engenharia Agrícola · UEG · Orientação: Prof. Dr. Francisco Ramos de Melo" },
  modelLabel: { T1_Linear: "Regressão Linear", T2_RandomForest: "Random Forest", T3_XGBoost: "XGBoost", T4_MLP: "Rede Neural MLP" } as Record<string, string>,
  feature: {
    temp_media_anual_C: "Temperatura média", temp_max_media_anual_C: "Temperatura máxima", temp_min_media_anual_C: "Temperatura mínima",
    amplitude_termica_C: "Amplitude térmica", precipitacao_total_mm: "Precipitação total", umidade_relativa_media_pct: "Umidade relativa",
    pet_anual_mm: "Evapotranspiração potencial", etr_anual_mm: "Evapotranspiração real", arm_final_mm: "Armazenamento de água",
    def_hidrico_mm: "Déficit hídrico", exc_hidrico_mm: "Excedente hídrico", razao_etr_pet: "Razão ETR/PET",
    indice_aridez: "Índice de aridez", chuva_por_grau: "Chuva por grau", latitude: "Latitude", longitude: "Longitude",
  } as Record<string, string>,
};

export type Dict = typeof pt;

const en: Dict = {
  meta: { title: "SojaPredict Atlas · Soybean yield in Goiás, Brazil" },
  nav: { atlas: "Atlas", trends: "Trends", models: "Models", sim: "Simulator", method: "Method", home: "Home", langLabel: "Language" },
  regions: { Norte: "North", Leste: "East", Centro: "Center", Sul: "South", Sudoeste: "Southwest" },
  season: "Season",
  hero: {
    eyebrow: "Master's thesis · Agricultural Engineering · UEG, Brazil",
    l1: "Climate tells", l2: "the story of the", em: "harvest",
    lead: "An interactive atlas of soybean yield in Goiás, Brazil. Explore twelve seasons on the map, compare four machine learning models and simulate climate scenarios with a Random Forest that runs right in your browser.",
    cta1: "Simulate a season", cta2: "Explore the map",
    stats: ["municipality-season observations", "municipalities in Goiás", "seasons (2014–2025)", "Random Forest mean R² (cross-validation)"],
  },
  atlas: {
    eyebrow: "01 · Atlas",
    title: { a: "Twelve seasons, ", em: "one municipality at a time", b: "." },
    lead: "Press play to watch yield change year by year, switch the variable to compare it with rainfall and temperature, and click a municipality to see its trajectory.",
    metrics: { prod: "Yield", chuva: "Rainfall", tmax: "Max. temp." },
    units: { prod: "kg/ha", chuva: "mm/yr", tmax: "°C" },
    play: "Animate seasons", pause: "Pause animation", year: "Season year",
    withData: (n) => `${n} municipalities with data · gray: no data`,
    region: (r) => `${r} region`,
    prodSeason: (s) => `Yield ${s}`,
    rank: "Rank in the state", of: (n) => `of ${n}`, rankFmt: (n) => `#${n}`,
    rain: "Rainfall", deficit: "Water deficit",
    vsMean: (above) => (above ? "Above" : "Below"),
    vsMeanTail: (mean) => ` the municipal average for the season (${mean} kg/ha) by `,
    clickHint: "Click a colored municipality on the map.",
    top5: (y) => `Top 5 · ${y} season`,
    tipMax: "max.",
    mapLabel: "Map of the municipalities of Goiás",
  },
  trends: {
    eyebrow: "02 · Trends",
    title: { a: "More rain, ", em: "more soybeans", b: "." },
    lead: "Average yield rose over the decade, with sharp drops in the 2014/15 and 2020/21 seasons. Among the climate variables, those tied to water availability track yield most closely.",
    byRegion: "Average yield by region",
    byRegionSub: "kg/ha · click the legend to hide regions",
    state: "Goiás",
    x: { chuva: "Rainfall", def: "Water deficit", tmax: "Max. temp." },
    scatterSub: "660 points · Pearson r =",
    corrTitle: "Correlation of each variable with yield",
    corrSub: "Pearson coefficient, thesis data (n = 660)",
  },
  models: {
    eyebrow: "03 · Models",
    title: { a: "Four algorithms, ", em: "a narrow winner", b: "." },
    lead: "Linear regression, Random Forest, XGBoost and an MLP neural network were trained on 14 climate and water-balance variables and evaluated with cross-validation and the Diebold-Mariano test.",
    best: "best", r2cv: "Cross-validation R²", mapeTest: "Test MAPE", trainTest: "R² train → test",
    dmTitle: "Diebold-Mariano test",
    dmSub: "Do forecast errors differ significantly? (α = 0.05)",
    dmText: (p) => `Random Forest and XGBoost significantly outperform linear regression but do not differ from each other (p = ${p}). A real gain from tree-based models, with no absolute champion.`,
    impTitle: "What the Random Forest relies on",
    impSub: "Impurity-based importance (thesis)",
    impText: "Water variables (actual evapotranspiration, rainfall, aridity and water deficit) dominate the ranking.",
    short: { T1_Linear: "Linear", T2_RandomForest: "RF", T3_XGBoost: "XGB", T4_MLP: "MLP" },
  },
  sim: {
    eyebrow: "04 · Simulator",
    title: { a: "What if it rained ", em: "less", b: "?" },
    lead: (n) => `Pick a municipality and adjust the season's climate. A ${n}-tree Random Forest, exported from Python, computes the expected yield right here in your browser, with no server.`,
    municipality: "Municipality", start: "Starting scenario",
    avg: "2014–2025 average", dry: (s) => `Driest (${s})`, wet: (s) => `Wettest (${s})`,
    rain: "Annual rainfall", tmax: "Mean max. temperature", tmin: "Mean min. temperature", rh: "Mean relative humidity",
    reset: "Back to the municipality's average",
    predicted: (m) => `Predicted yield · ${m}`,
    bags: "bags/ha", spread: "tree range (p10–p90):", to: "to",
    vsHist: "vs. the municipality's observed average",
    curve: "Rainfall response curve", curveNote: "(other variables held fixed)",
    qualTitle: "How good is the in-browser model?",
    qualSub: "Observed × out-of-sample predicted (5-fold cross-validation)",
    obs: "obs.", pred: "pred.", observed: "Observed", predictedAxis: "Predicted",
    sheet: "Model card",
    rows: {
      algo: "Algorithm", algoV: (n, d) => `Random Forest · ${n} trees · max depth ${d}`,
      inputs: "Inputs", inputsV: "lat., long., max. temp., min. temp., rainfall, humidity",
      r2k: "R² (random 5-fold)", r2g: "R² (5-fold by municipality)", err: "RMSE / MAE",
      size: "Size", sizeV: "~430 kB of JSON, inference in TypeScript",
    },
    note: "A compact version with fewer variables than the thesis models, so it fits in the browser. Performance is close to the full Random Forest (R² 0.55). Values outside the observed range are not extrapolated.",
  },
  method: {
    eyebrow: "05 · Method",
    title: { a: "From raw data to ", em: "the browser", b: "." },
    steps: [
      { t: "Data", d: "Municipal yield (CONAB, IBGE/PAM, SEAPA-GO) integrated for 55 municipalities and 12 seasons, 2014 to 2025." },
      { t: "Climate and water", d: "INMET climate normals and anomalies; Thornthwaite-Mather water balance with PET, AET, deficit and surplus." },
      { t: "Modeling", d: "Linear regression, Random Forest, XGBoost and MLP in Python (scikit-learn), with cross-validation and statistical tests." },
      { t: "Decision support", d: "Results and a compact model exported to JSON and served as a static site, with no backend." },
    ],
  },
  footer: { degree: "M.Sc. in Agricultural Engineering · UEG, Brazil · Advisor: Prof. Dr. Francisco Ramos de Melo" },
  modelLabel: { T1_Linear: "Linear Regression", T2_RandomForest: "Random Forest", T3_XGBoost: "XGBoost", T4_MLP: "MLP Neural Network" },
  feature: {
    temp_media_anual_C: "Mean temperature", temp_max_media_anual_C: "Max. temperature", temp_min_media_anual_C: "Min. temperature",
    amplitude_termica_C: "Temperature range", precipitacao_total_mm: "Total rainfall", umidade_relativa_media_pct: "Relative humidity",
    pet_anual_mm: "Potential evapotranspiration", etr_anual_mm: "Actual evapotranspiration", arm_final_mm: "Soil water storage",
    def_hidrico_mm: "Water deficit", exc_hidrico_mm: "Water surplus", razao_etr_pet: "AET/PET ratio",
    indice_aridez: "Aridity index", chuva_por_grau: "Rainfall per degree", latitude: "Latitude", longitude: "Longitude",
  },
};

export const dict: Record<Lang, Dict> = { pt, en };

export function useT() {
  const lang = useLang((s) => s.lang);
  return dict[lang];
}

if (typeof window !== "undefined") applyDocument(useLang.getState().lang);
