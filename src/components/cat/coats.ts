import { makeRng } from "./catMachine";

/**
 * Coat definition for the cat rig. The site has ONE cat, the cream fluffy one, so every cat on every page is the same character.
 */
export type Coat = "cream";

export type CoatDef = {
  fur: [string, string, string];            // coat colour, top / middle / underside
  stripe: string; stripeOp: number;         // tabby marking colour and strength (0 = solid coat)
  light: string; dark: string;              // individual fur strands: tips that catch light, and shadowed ones
  bib: string;                              // cream chest, white muzzle and paws
  bibOn: { chest: boolean; muzzle: boolean; paws: boolean };
  earIn: string; nose: string; lip: string;
  iris: [string, string, string];           // centre / middle / rim of the iris
  fluff: number;                            // how ragged and soft the silhouette is (px of displacement)
  strand: number;                           // how many fur strands per texture tile
  flat: boolean;                            // Persian: short muzzle, wide face, small ears
  rings: boolean;                           // ringed tail (tabbies) or a soft plume
};

export const COATS: Record<Coat, CoatDef> = {
  cream: {
    fur: ["#fff6e2", "#ecd9b4", "#bfa57c"], stripe: "#000000", stripeOp: 0, light: "#ffffff", dark: "#8f7650",
    bib: "#fffaf0", bibOn: { chest: true, muzzle: false, paws: false },
    earIn: "#eebdad", nose: "#dc9a8e", lip: "#6a3a30", iris: ["#f0a040", "#c0701f", "#7a3d12"],
    fluff: 1.2, strand: 120, flat: true, rings: false,
  },
};

/** a tile of fine fur strands (SVG path data, drawn as thin strokes). Seeded, so a coat always looks the same. */
export function strandPaths(c: CoatDef, seed: number) {
  const r = makeRng(seed);
  let lo = "", hi = "";
  for (let i = 0; i < c.strand; i++) {
    const x = r() * 44, y = r() * 44, len = 5 + r() * 7, bend = (r() - 0.5) * 3;
    const d = `M${x.toFixed(1)} ${y.toFixed(1)}q${(bend).toFixed(1)} ${(len / 2).toFixed(1)} ${(bend * 0.4).toFixed(1)} ${len.toFixed(1)}`;
    if (r() < 0.45) lo += d; else hi += d;
  }
  return { lo, hi };
}

/* ───────── small geometry helpers for tapering shapes (tails) ───────── */
export type Pt = [number, number];
const bez = (p: Pt[], t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
    u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1],
  ];
};
const dbez = (p: Pt[], t: number): Pt => {
  const u = 1 - t;
  return [
    3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]),
    3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]),
  ];
};
const f = (n: number) => n.toFixed(1);

/** a thick tapering tube along a cubic curve: the outline of a tail, plus ring bands across it for tabby tails */
export function tube(p: Pt[], w0: number, w1: number, ringAt: number[] = []) {
  const n = 26, L: Pt[] = [], R: Pt[] = [];
  const frame = (t: number) => {
    const c = bez(p, t), d = dbez(p, t), len = Math.hypot(d[0], d[1]) || 1;
    const w = w0 + (w1 - w0) * Math.pow(t, 0.8);
    return { c, tx: d[0] / len, ty: d[1] / len, nx: -d[1] / len, ny: d[0] / len, w };
  };
  for (let i = 0; i <= n; i++) {
    const { c, nx, ny, w } = frame(i / n);
    L.push([c[0] + nx * w, c[1] + ny * w]); R.push([c[0] - nx * w, c[1] - ny * w]);
  }
  let d = `M${f(L[0][0])} ${f(L[0][1])}`;
  for (let i = 1; i <= n; i++) d += `L${f(L[i][0])} ${f(L[i][1])}`;
  d += `A${f(w1)} ${f(w1)} 0 0 1 ${f(R[n][0])} ${f(R[n][1])}`;
  for (let i = n - 1; i >= 0; i--) d += `L${f(R[i][0])} ${f(R[i][1])}`;
  d += "Z";
  let rings = "";
  for (const t of ringAt) {
    const { c, tx, ty, nx, ny, w } = frame(t), a = 2.3, e = w + 2;
    rings += `M${f(c[0] - tx * a + nx * e)} ${f(c[1] - ty * a + ny * e)}L${f(c[0] + tx * a + nx * e)} ${f(c[1] + ty * a + ny * e)}L${f(c[0] + tx * a - nx * e)} ${f(c[1] + ty * a - ny * e)}L${f(c[0] - tx * a - nx * e)} ${f(c[1] - ty * a - ny * e)}Z`;
  }
  return { d, rings };
}

/** tapering tabby stripe: wide at the spine, a point at the belly end */
export function stripe(x: number, y0: number, len: number, w: number, bend: number) {
  return `M${f(x - w / 2)} ${f(y0)}Q${f(x - w / 2 + bend * 0.6)} ${f(y0 + len * 0.6)} ${f(x + bend)} ${f(y0 + len)}Q${f(x + w / 2 + bend * 0.6)} ${f(y0 + len * 0.6)} ${f(x + w / 2)} ${f(y0)}Z`;
}

/** a row of stripes across a body, seeded */
export function stripeRow(seed: number, x0: number, x1: number, y0: number, len: number, w: number, step: number, lean = 0) {
  const r = makeRng(seed);
  let d = "";
  for (let x = x0; x <= x1; x += step * (0.85 + r() * 0.3)) d += stripe(x + (r() - 0.5) * 2, y0 + (r() - 0.5) * 3, len * (0.7 + r() * 0.5), w * (0.75 + r() * 0.5), lean + (r() - 0.5) * 6);
  return d;
}
