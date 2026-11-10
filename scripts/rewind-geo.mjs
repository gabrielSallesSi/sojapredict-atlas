// Garante a ordem de vértices esperada pelo d3-geo (anéis externos no sentido horário).
import { readFileSync, writeFileSync } from "node:fs";
import { geoArea } from "d3-geo";
const file = process.argv[2];
const g = JSON.parse(readFileSync(file, "utf-8"));
let fixed = 0;
for (const f of g.features) {
  if (geoArea(f) > 2 * Math.PI) {
    const rev = (poly) => poly.map((ring) => ring.slice().reverse());
    f.geometry.coordinates = f.geometry.type === "Polygon" ? rev(f.geometry.coordinates) : f.geometry.coordinates.map(rev);
    fixed++;
  }
}
writeFileSync(file, JSON.stringify(g));
console.log(`${fixed}/${g.features.length} feições reorientadas`);
