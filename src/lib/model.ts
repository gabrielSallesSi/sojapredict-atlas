import type { ForestModel, Tree } from "./types";

/** Percorre uma árvore exportada do scikit-learn (feature < 0 indica folha). */
export function predictTree(tree: Tree, x: number[]): number {
  let i = 0;
  while (tree.f[i] >= 0) {
    // scikit-learn compara em float32
    i = Math.fround(x[tree.f[i]]) <= tree.t[i] ? tree.l[i] : tree.r[i];
  }
  return tree.v[i];
}

/** Média das árvores, como RandomForestRegressor.predict. */
export function predictForest(model: ForestModel, x: number[]): number {
  let s = 0;
  for (const t of model.trees) s += predictTree(t, x);
  return s / model.trees.length;
}

/** Previsões de cada árvore: usadas para mostrar a dispersão do ensemble. */
export function treeSpread(model: ForestModel, x: number[]): { p10: number; p90: number } {
  const v = model.trees.map((t) => predictTree(t, x)).sort((a, b) => a - b);
  const q = (p: number) => v[Math.min(v.length - 1, Math.max(0, Math.round(p * (v.length - 1))))];
  return { p10: q(0.1), p90: q(0.9) };
}
