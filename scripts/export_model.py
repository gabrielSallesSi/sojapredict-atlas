"""Exporta dados, resultados da dissertação e um Random Forest compacto
para JSON estático consumido pelo front-end (inferência no navegador).

Uso (a partir da pasta atlas/):
    python scripts/export_model.py --data ../data/dataset_integrado_soja_go_2014_2024.csv --results ../results
"""
import argparse, json, math
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupKFold, KFold, cross_val_predict

FEATURES = [
    "latitude",
    "longitude",
    "temp_max_media_anual_C",
    "temp_min_media_anual_C",
    "precipitacao_total_mm",
    "umidade_relativa_media_pct",
]
TARGET = "produtividade_kg_ha"
RF_PARAMS = dict(n_estimators=80, max_depth=10, min_samples_leaf=3, random_state=42, n_jobs=-1)


def r(x, n=3):
    return None if x is None or (isinstance(x, float) and math.isnan(x)) else round(float(x), n)


def export_tree(est):
    t = est.tree_
    return {
        "f": t.feature.tolist(),  # -2 = folha
        "t": [float(v) for v in t.threshold],
        "l": t.children_left.tolist(),
        "r": t.children_right.tolist(),
        "v": [r(v, 1) for v in t.value[:, 0, 0]],
    }


def metrics(y, p):
    return {
        "r2": r(r2_score(y, p), 4),
        "rmse": r(math.sqrt(mean_squared_error(y, p)), 2),
        "mae": r(mean_absolute_error(y, p), 2),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--results", required=True)
    ap.add_argument("--out", default="public/data")
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(a.data, encoding="utf-8-sig")
    X, y = df[FEATURES].values, df[TARGET].values

    # Validação: KFold aleatório e GroupKFold por município (generalização espacial)
    rf = RandomForestRegressor(**RF_PARAMS)
    oof = cross_val_predict(rf, X, y, cv=KFold(5, shuffle=True, random_state=42))
    oof_g = cross_val_predict(rf, X, y, cv=GroupKFold(5), groups=df["municipio"])

    rf.fit(X, y)
    test_X = X[:20]
    model = {
        "features": FEATURES,
        "params": {k: v for k, v in RF_PARAMS.items() if k != "n_jobs"},
        "validation": {"kfold5": metrics(y, oof), "groupkfold5_municipio": metrics(y, oof_g)},
        "importance": dict(zip(FEATURES, [r(v, 4) for v in rf.feature_importances_])),
        "ranges": {f: [r(df[f].min(), 2), r(df[f].max(), 2)] for f in FEATURES},
        "trees": [export_tree(e) for e in rf.estimators_],
        "selfcheck": {"X": test_X.tolist(), "y": [r(v, 2) for v in rf.predict(test_X)]},
    }
    (out / "model.json").write_text(json.dumps(model, separators=(",", ":")), encoding="utf-8")

    cols = ["municipio", "regiao", "latitude", "longitude", "ano", "safra", TARGET,
            "produtividade_sc_ha", "temp_media_anual_C"] + FEATURES[2:] + ["def_hidrico_mm", "etr_anual_mm", "indice_aridez"]
    rows = df[cols].copy()
    rows["pred_oof"] = np.round(oof, 0)
    rows = rows.rename(columns={
        TARGET: "prod", "produtividade_sc_ha": "sc", "temp_media_anual_C": "tmed",
        "temp_max_media_anual_C": "tmax", "temp_min_media_anual_C": "tmin",
        "precipitacao_total_mm": "chuva", "umidade_relativa_media_pct": "ur",
        "def_hidrico_mm": "def", "etr_anual_mm": "etr", "indice_aridez": "ia",
        "municipio": "mun", "regiao": "reg", "latitude": "lat", "longitude": "lon",
    })
    (out / "dataset.json").write_text(rows.to_json(orient="records", force_ascii=False), encoding="utf-8")

    res = json.loads((Path(a.results) / "resultados_consolidados.json").read_text(encoding="utf-8"))
    for name in ["importancia_rf", "importancia_permutation"]:
        res[name] = pd.read_csv(Path(a.results) / f"{name}.csv").round(5).to_dict(orient="records")
    corr = pd.read_csv(Path(a.results) / "correlacao_pearson.csv", index_col=0)
    res["corr_prod"] = corr[TARGET].drop(TARGET).round(3).to_dict()
    res.pop("vif_top5", None)
    (out / "results.json").write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")

    print("validação navegador:", model["validation"])


if __name__ == "__main__":
    main()
