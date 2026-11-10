# SojaPredict Atlas

**Site:** https://gabrielsallessi.github.io/sojapredict-atlas/

Atlas interativo da produtividade da soja em 55 municípios de Goiás (safras 2013/14 a 2024/25), com comparação de modelos de aprendizado de máquina e um **simulador climático que roda um Random Forest direto no navegador**, sem servidor.

Parte da dissertação *"Previsão da produtividade da soja em Goiás por aprendizado de máquina: desenvolvimento de um sistema computacional de apoio à decisão"* (Mestrado em Engenharia Agrícola, UEG).

## Destaques

- **Mapa coroplético animado** dos municípios goianos (D3-geo + Framer Motion), com play ano a ano e troca entre produtividade, chuva e temperatura
- **Gráficos interativos** de tendência regional, dispersão clima × produtividade e correlações (Recharts)
- **Comparação de 4 modelos** (Linear, Random Forest, XGBoost, MLP) com validação cruzada e teste de Diebold-Mariano
- **ML no navegador**: Random Forest de 80 árvores treinado no scikit-learn, exportado para JSON e executado em TypeScript, com teste automatizado que garante as mesmas previsões do Python
- **Bilíngue (PT-BR / EN)**: seletor no menu, detecção do idioma do navegador, escolha salva e link direto com `?lang=en`
- 100% estático: funciona no GitHub Pages e na Vercel (plano gratuito)

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · Recharts · D3-geo · TanStack Query · Zustand · Vitest · GitHub Actions · Python (pandas, scikit-learn)

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # confere a inferência do modelo
npm run build      # gera dist/
```

## Regenerar dados e modelo

Os JSONs em `public/data/` já vêm prontos. Para refazer a partir dos dados da dissertação:

```bash
pip install pandas scikit-learn
npm run export:model
```

`scripts/export_model.py` lê o CSV integrado e a pasta `results/` do repositório da dissertação (ajuste os caminhos em `npm run export:model`), treina o Random Forest compacto, mede o desempenho (KFold e GroupKFold por município) e grava `dataset.json`, `results.json` e `model.json`.

O contorno dos municípios (`goias.geojson`) vem de [tbrugz/geodata-br](https://github.com/tbrugz/geodata-br), simplificado com mapshaper e reorientado com `scripts/rewind-geo.mjs`.

## Deploy

**GitHub Pages (um comando):**

```bash
npm run deploy
```

Compila e envia `dist/` para o branch `gh-pages`. No GitHub, em *Settings → Pages*, escolha *Deploy from a branch* → `gh-pages` / `root`. O site fica em `https://<usuario>.github.io/<repositorio>/`.

**GitHub Pages com CI:** o workflow `.github/workflows/deploy.yml` roda os testes, compila e publica a cada push em `main` (Settings → Pages → Source: *GitHub Actions*).

**Vercel:** importe o repositório; o `vercel.json` já configura o build.

## Sobre o modelo do navegador

| | R² | RMSE (kg/ha) |
|---|---|---|
| Random Forest da dissertação (14 variáveis, CV) | 0,551 | 305 |
| Random Forest do navegador (6 variáveis, KFold 5) | 0,57 | 304 |
| Random Forest do navegador (GroupKFold por município) | 0,56 | 307 |

O modelo compacto usa latitude, longitude, temperaturas máxima e mínima, precipitação e umidade relativa, para que o usuário possa mexer diretamente nas variáveis climáticas.

---

Gabriel Sá da Silveira · Orientação: Prof. Dr. Francisco Ramos de Melo · UEG
