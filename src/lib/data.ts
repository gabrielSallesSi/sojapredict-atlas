import { useQuery } from "@tanstack/react-query";
import type { FeatureCollection, Geometry } from "geojson";
import type { ForestModel, Results, Row } from "./types";

const url = (p: string) => `${import.meta.env.BASE_URL}data/${p}`;

async function getJSON<T>(p: string): Promise<T> {
  const r = await fetch(url(p));
  if (!r.ok) throw new Error(`Falha ao carregar ${p}: ${r.status}`);
  return r.json() as Promise<T>;
}

export const useDataset = () => useQuery({ queryKey: ["dataset"], queryFn: () => getJSON<Row[]>("dataset.json") });
export const useResults = () => useQuery({ queryKey: ["results"], queryFn: () => getJSON<Results>("results.json") });
export const useModel = () => useQuery({ queryKey: ["model"], queryFn: () => getJSON<ForestModel>("model.json") });
export const useGeo = () =>
  useQuery({ queryKey: ["geo"], queryFn: () => getJSON<FeatureCollection<Geometry, { name: string }>>("goias.geojson") });
