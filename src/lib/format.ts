import { locale } from "./i18n";

const cache = new Map<string, Intl.NumberFormat>();
function nf(d: number) {
  const key = `${locale()}-${d}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale(), { minimumFractionDigits: d, maximumFractionDigits: d });
    cache.set(key, f);
  }
  return f;
}

export const fmt0 = (n: number) => nf(0).format(n);
export const fmt1 = (n: number) => nf(1).format(n);
export const fmt2 = (n: number) => nf(2).format(n);
export const fmt3 = (n: number) => nf(3).format(n);
