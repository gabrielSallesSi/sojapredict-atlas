export type Region = "Centro" | "Leste" | "Norte" | "Sudoeste" | "Sul";

export interface Row {
  mun: string;
  reg: Region;
  lat: number;
  lon: number;
  ano: number;
  safra: string;
  prod: number;
  sc: number;
  tmed: number;
  tmax: number;
  tmin: number;
  chuva: number;
  ur: number;
  def: number;
  etr: number;
  ia: number;
  pred_oof: number;
}

export interface Tree { f: number[]; t: number[]; l: number[]; r: number[]; v: number[] }

export interface Metrics { r2: number; rmse: number; mae: number }

export interface ForestModel {
  features: string[];
  params: Record<string, number>;
  validation: { kfold5: Metrics; groupkfold5_municipio: Metrics };
  importance: Record<string, number>;
  ranges: Record<string, [number, number]>;
  trees: Tree[];
  selfcheck: { X: number[][]; y: number[] };
}

export interface CvRow { R2_mean: number; R2_std: number; RMSE_mean: number; RMSE_std: number; MAE_mean: number }
export interface TtRow { R2_train: number; R2_test: number; RMSE_test: number; MAE_test: number; MAPE_test: number; NSE: number; Bias: number }

export interface Results {
  n_total: number;
  n_municipios: number;
  anos: number[];
  prod_mean: number;
  prod_std: number;
  prod_cv: number;
  prod_min: number;
  prod_max: number;
  train_test: Record<string, TtRow>;
  cv_summary: Record<string, CvRow>;
  diebold_mariano: Record<string, { DM: number; p: number; sig: string }>;
  anova: Record<string, number>;
  importancia_rf: { Feature: string; Importance: number }[];
  importancia_permutation: { Feature: string; Importance_mean: number; Importance_std: number }[];
  corr_prod: Record<string, number>;
  prod_por_regiao: Record<Region, { mean: number; std: number; count: number }>;
}
