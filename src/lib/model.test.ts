import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { predictForest, treeSpread } from "./model";
import type { ForestModel } from "./types";

const model = JSON.parse(readFileSync(resolve(__dirname, "../../public/data/model.json"), "utf-8")) as ForestModel;

describe("Random Forest no navegador", () => {
  it("reproduz as previsões do scikit-learn", () => {
    model.selfcheck.X.forEach((x, i) => {
      expect(Math.abs(predictForest(model, x) - model.selfcheck.y[i])).toBeLessThan(1);
    });
  });

  it("intervalo p10–p90 contém a média", () => {
    const x = model.selfcheck.X[0];
    const { p10, p90 } = treeSpread(model, x);
    const m = predictForest(model, x);
    expect(p10).toBeLessThanOrEqual(m);
    expect(p90).toBeGreaterThanOrEqual(m);
  });
});
