const nf0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf3 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export const fmt0 = (n: number) => nf0.format(n);
export const fmt1 = (n: number) => nf1.format(n);
export const fmt2 = (n: number) => nf2.format(n);
export const fmt3 = (n: number) => nf3.format(n);
export const toSacas = (kg: number) => kg / 60;

export const MODEL_LABEL: Record<string, string> = {
  T1_Linear: "Regressão Linear",
  T2_RandomForest: "Random Forest",
  T3_XGBoost: "XGBoost",
  T4_MLP: "Rede Neural MLP",
};

export const FEATURE_LABEL: Record<string, string> = {
  temp_media_anual_C: "Temperatura média",
  temp_max_media_anual_C: "Temperatura máxima",
  temp_min_media_anual_C: "Temperatura mínima",
  amplitude_termica_C: "Amplitude térmica",
  precipitacao_total_mm: "Precipitação total",
  umidade_relativa_media_pct: "Umidade relativa",
  pet_anual_mm: "Evapotranspiração potencial",
  etr_anual_mm: "Evapotranspiração real",
  arm_final_mm: "Armazenamento de água",
  def_hidrico_mm: "Déficit hídrico",
  exc_hidrico_mm: "Excedente hídrico",
  razao_etr_pet: "Razão ETR/PET",
  indice_aridez: "Índice de aridez",
  chuva_por_grau: "Chuva por grau",
  latitude: "Latitude",
  longitude: "Longitude",
};
