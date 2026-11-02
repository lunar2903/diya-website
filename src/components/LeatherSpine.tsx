import { useId } from "react";
import { makeRng } from "./cat/catMachine";

/**
 * One gilt-tooled, leather-bound spine, drawn as SVG at the book's real pixel size (width = thickness, height).
 * Everything is derived from `seed` (the project id) so a book looks the same on every visit, and from `index`
 * (its place on the shelf) so neighbours never share a leather colour or an ornament set.
 *
 * Layers, bottom to top:
 *   leather colour -> grain (noise) -> rounded-spine shading (dark edges, light centre) -> raised bands with
 *   highlight above and shadow below -> gold-foil tooling (embossed: a dark offset copy under the gold) ->
 *   contrasting title label -> edge wear -> hover glint (a light sweep masked to the gold only).
 * The hover effects are CSS in globals.css (.spine-*), triggered by the parent `.group`.
 */

export const LEATHERS = [
  { name: "oxblood",   base: "#5e1b20", label: "#17110d" },
  { name: "forest",    base: "#21402d", label: "#5e1b20" },
  { name: "navy",      base: "#1d2f52", label: "#5e1b20" },
  { name: "jet",       base: "#18130f", label: "#5e1b20" },
  { name: "cognac",    base: "#8c5431", label: "#17110d" },
  { name: "chocolate", base: "#3d2617", label: "#21402d" },
];
const ORNAMENT_SETS = ["fleuron", "lozenge", "arabesque", "deco", "geometric"] as const;
type OrnamentSet = (typeof ORNAMENT_SETS)[number];

export function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; }

/** the per-book variation the shelf applies too: height +-8%, width, a slight tilt, and a few books pulled forward */
export function spineVariation(seed: string) {
  const r = makeRng(hash(seed) ^ 0x9e3779b9);
  return { height: 0.92 + r() * 0.16, thick: 0.9 + r() * 0.22, tilt: r() < 0.3 ? (r() - 0.5) * 3.2 : 0, pull: r() < 0.22 ? 5 + r() * 6 : 0 };
}

const f = (n: number) => +n.toFixed(2);
type Paths = { s: string[]; f: string[] };
type Panel = { y0: number; y1: number };

/* ───────── ornaments: each returns stroke paths (s) and filled shapes (f) ───────── */
const fleur = (cx: number, cy: number, k: number) => ({
  f: [
    `M${f(cx)} ${f(cy - 8 * k)}C${f(cx + 3 * k)} ${f(cy - 4 * k)} ${f(cx + 3 * k)} ${f(cy + 2 * k)} ${f(cx)} ${f(cy + 6 * k)}C${f(cx - 3 * k)} ${f(cy + 2 * k)} ${f(cx - 3 * k)} ${f(cy - 4 * k)} ${f(cx)} ${f(cy - 8 * k)}Z`,
    `M${f(cx - k)} ${f(cy + 3 * k)}C${f(cx - 7 * k)} ${f(cy + k)} ${f(cx - 8 * k)} ${f(cy - 5 * k)} ${f(cx - 4 * k)} ${f(cy - 6 * k)}C${f(cx - 5 * k)} ${f(cy - 2 * k)} ${f(cx - 3 * k)} ${f(cy)} ${f(cx - k)} ${f(cy)}Z`,
    `M${f(cx + k)} ${f(cy + 3 * k)}C${f(cx + 7 * k)} ${f(cy + k)} ${f(cx + 8 * k)} ${f(cy - 5 * k)} ${f(cx + 4 * k)} ${f(cy - 6 * k)}C${f(cx + 5 * k)} ${f(cy - 2 * k)} ${f(cx + 3 * k)} ${f(cy)} ${f(cx + k)} ${f(cy)}Z`,
    `M${f(cx - 4 * k)} ${f(cy + 4.6 * k)}h${f(8 * k)}v${f(1.4 * k)}h${f(-8 * k)}Z`,
  ],
  s: [`M${f(cx)} ${f(cy + 6 * k)}v${f(2.6 * k)}`],
});
const lozenge = (cx: number, cy: number, w: number, h: number) => `M${f(cx)} ${f(cy - h)}L${f(cx + w)} ${f(cy)}L${f(cx)} ${f(cy + h)}L${f(cx - w)} ${f(cy)}Z`;
const dot = (cx: number, cy: number, r: number) => `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0Z`;
const scroll = (cx: number, cy: number, k: number, dir: 1 | -1) =>
  `M${f(cx)} ${f(cy)}C${f(cx + dir * 4 * k)} ${f(cy - 4 * k)} ${f(cx + dir * 9 * k)} ${f(cy - k)} ${f(cx + dir * 7 * k)} ${f(cy + 3 * k)}C${f(cx + dir * 5 * k)} ${f(cy + 6 * k)} ${f(cx + dir * 1.5 * k)} ${f(cy + 4 * k)} ${f(cx + dir * 3 * k)} ${f(cy + 1.4 * k)}`;
const fan = (cx: number, cy: number, r: number) => {
  let rays = "";
  for (let a = 25; a <= 155; a += 22.5) rays += `M${f(cx)} ${f(cy)}L${f(cx + r * Math.cos((a * Math.PI) / 180))} ${f(cy - r * Math.sin((a * Math.PI) / 180))}`;
  return `${rays}M${f(cx - r)} ${f(cy)}A${r} ${r} 0 0 1 ${f(cx + r)} ${f(cy)}M${f(cx - r * 0.55)} ${f(cy)}A${f(r * 0.55)} ${f(r * 0.55)} 0 0 1 ${f(cx + r * 0.55)} ${f(cy)}`;
};
const chevron = (cx: number, cy: number, w: number) => `M${f(cx - w)} ${f(cy + 2.4)}L${f(cx)} ${f(cy - 2.4)}L${f(cx + w)} ${f(cy + 2.4)}`;
const frame = (x0: number, y0: number, x1: number, y1: number) => `M${f(x0)} ${f(y0)}H${f(x1)}V${f(y1)}H${f(x0)}Z`;
const corner = (x: number, y: number, sx: 1 | -1, sy: 1 | -1) => `M${f(x)} ${f(y + sy * 4)}A4 4 0 0 ${sx * sy > 0 ? 1 : 0} ${f(x + sx * 4)} ${f(y)}`;

/** fill one panel with the ornament set's motifs */
function tool(set: OrnamentSet, g: Paths, p: Panel, w: number, rng: () => number, label: boolean) {
  const x0 = 5.5, x1 = w - 5.5, cx = w / 2, ph = p.y1 - p.y0;
  g.s.push(frame(x0, p.y0, x1, p.y1));
  if (ph > 12) g.s.push(frame(x0 + 2.4, p.y0 + 2.4, x1 - 2.4, p.y1 - 2.4)); // double rule
  if (label || ph < 18) return;
  const k = Math.min(1.1, (w - 14) / 22), mid = (p.y0 + p.y1) / 2, n = Math.max(1, Math.floor((ph - 8) / (set === "arabesque" ? 17 : 21)));
  const at = (i: number) => mid + (i - (n - 1) / 2) * (set === "arabesque" ? 17 : 21);
  switch (set) {
    case "fleuron":
      for (let i = 0; i < n; i++) { const m = fleur(cx, at(i), k); g.f.push(...m.f); g.s.push(...m.s); }
      g.s.push(corner(x0 + 2.4, p.y0 + 2.4, 1, 1), corner(x1 - 2.4, p.y0 + 2.4, -1, 1), corner(x0 + 2.4, p.y1 - 2.4, 1, -1), corner(x1 - 2.4, p.y1 - 2.4, -1, -1));
      break;
    case "lozenge":
      for (let i = 0; i < n; i++) { g.s.push(lozenge(cx, at(i), 8 * k, 9 * k)); g.f.push(lozenge(cx, at(i), 3 * k, 3.4 * k)); }
      break;
    case "arabesque":
      for (let i = 0; i < n; i++) { g.s.push(scroll(cx, at(i), k * 0.95, 1), scroll(cx, at(i), k * 0.95, -1)); g.f.push(dot(cx, at(i) + 6.4 * k, 0.9)); }
      break;
    case "deco":
      for (let i = 0; i < n; i++) { if (i % 2 === 0) g.s.push(fan(cx, at(i) + 6 * k, 8.5 * k)); else { g.s.push(chevron(cx, at(i) - 3, 8 * k), chevron(cx, at(i) + 2, 8 * k)); } }
      break;
    default: // geometric
      for (let i = 0; i < n; i++) { const y = at(i), hh = 7 * k; for (let d = 0; d < 3; d++) g.s.push(frame(cx - (9 - d * 3) * k, y - hh + d * 2.2, cx + (9 - d * 3) * k, y + hh - d * 2.2)); g.s.push(`M${f(cx - 9 * k)} ${f(y)}H${f(cx + 9 * k)}M${f(cx)} ${f(y - hh)}V${f(y + hh)}`); g.f.push(dot(cx, y, 1.3)); }
  }
  if (rng() < 0.5) for (let i = 0; i < 4; i++) g.f.push(dot(cx - 7.5 + i * 5, p.y0 + 5.6, 0.55)); // dotted rule below the top
}

export default function LeatherSpine({ seed, index, title, author, w, h }: { seed: string; index: number; title: string; author: string; w: number; h: number }) {
  const id = "ls" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const hs = hash(seed);
  const rng = makeRng(hs);
  const bit = hs & 1;
  const leather = LEATHERS[(index * 4 + bit) % LEATHERS.length];
  const set = ORNAMENT_SETS[(index * 3 + bit) % ORNAMENT_SETS.length];

  /* bands (raised ribs) divide the spine into panels; one tall panel carries the title label */
  const nBands = 4 + (rng() < 0.5 ? 1 : 0), bandH = 5, headM = 10, tailM = 12;
  const labelIdx = nBands >= 5 && rng() < 0.5 ? 2 : 1;
  const weights = Array.from({ length: nBands + 1 }, (_, i) => (i === labelIdx ? 3.4 : 0.85 + rng() * 0.5));
  const usable = h - headM - tailM - nBands * bandH, total = weights.reduce((a, b) => a + b, 0);
  const panels: Panel[] = [], bands: number[] = [];
  let y = headM;
  weights.forEach((wt, i) => { const ph = (usable * wt) / total; panels.push({ y0: y, y1: y + ph }); y += ph; if (i < nBands) { bands.push(y); y += bandH; } });

  const g: Paths = { s: [], f: [] };
  panels.forEach((p, i) => tool(set, g, p, w, rng, i === labelIdx));
  // gilt fillets on each band, turn-in lines at head and tail, optional tick marks on the bands
  bands.forEach((by, i) => { g.s.push(`M3 ${f(by + 1.2)}H${f(w - 3)}M3 ${f(by + bandH - 1.2)}H${f(w - 3)}`); if (i % 2 === 0) for (let x = 6; x < w - 5; x += 2.4) g.s.push(`M${f(x)} ${f(by + 1.8)}v${bandH - 3.6}`); });
  g.s.push(`M3 3.6H${f(w - 3)}M3 5.6H${f(w - 3)}M3 ${f(h - 4)}H${f(w - 3)}M3 ${f(h - 6)}H${f(w - 3)}`);

  const lp = panels[labelIdx], lh = lp.y1 - lp.y0, lx = 6.5, lw = w - 13;
  const chars = Math.max(6, title.length);
  const fs = Math.max(5.6, Math.min(w * 0.3, (lh - 12) / (chars * 0.56)));
  const wear = Array.from({ length: 5 }, () => ({ x: rng() < 0.5 ? rng() * 5 : w - rng() * 5, y: rng() < 0.5 ? rng() * 14 : h - rng() * 16, r: 1.6 + rng() * 3.2, o: 0.12 + rng() * 0.16 }));
  const scratches = Array.from({ length: 3 }, () => { const x = 6 + rng() * (w - 12), y0 = rng() * (h - 40); return `M${f(x)} ${f(y0)}l${f(rng() * 2 - 1)} ${f(8 + rng() * 22)}`; });
  const tooling = (
    <>
      {g.s.length > 0 && <path d={g.s.join("")} fill="none" strokeWidth=".85" strokeLinecap="round" strokeLinejoin="round" />}
      {g.f.length > 0 && <path d={g.f.join("")} stroke="none" />}
    </>
  );

  return (
    <svg className="spine-svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden style={{ display: "block", ["--sh" as string]: `${h}px` }}>
      <defs>
        <linearGradient id={`${id}-shade`} x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".66" /><stop offset=".16" stopColor="#000" stopOpacity=".2" /><stop offset=".42" stopColor="#fff" stopOpacity=".17" /><stop offset=".58" stopColor="#fff" stopOpacity=".05" /><stop offset=".84" stopColor="#000" stopOpacity=".22" /><stop offset="1" stopColor="#000" stopOpacity=".7" /></linearGradient>
        <linearGradient id={`${id}-gold`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2={h * 0.28} spreadMethod="repeat"><stop offset="0" stopColor="#8a6a2f" /><stop offset=".22" stopColor="#e8c873" /><stop offset=".4" stopColor="#a07c35" /><stop offset=".58" stopColor="#f2dc92" /><stop offset=".8" stopColor="#8a6a2f" /><stop offset="1" stopColor="#c9a24e" /></linearGradient>
        <linearGradient id={`${id}-lgold`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2={h * 0.3} spreadMethod="repeat"><stop offset="0" stopColor="#d2ab55" /><stop offset=".3" stopColor="#f6e29a" /><stop offset=".6" stopColor="#d9b862" /><stop offset="1" stopColor="#c9a24e" /></linearGradient>
        <linearGradient id={`${id}-rib`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".34" /><stop offset=".3" stopColor="#fff" stopOpacity=".08" /><stop offset=".7" stopColor="#000" stopOpacity=".12" /><stop offset="1" stopColor="#000" stopOpacity=".5" /></linearGradient>
        <linearGradient id={`${id}-lab`} x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".5" /><stop offset=".45" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#000" stopOpacity=".5" /></linearGradient>
        <linearGradient id={`${id}-sw`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85 .5" numOctaves="2" seed={hs % 97} result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.3 0 0 0 -.42" /></filter>
        <filter id={`${id}-sheen`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".6 .02" numOctaves="2" seed={hs % 53} result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 .92  0 0 0 0 .8  0 1.1 0 0 -.5" /></filter>
        <g id={`${id}-t`}>{tooling}</g>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <g transform={`rotate(-24 ${w / 2} ${h / 2})`}><rect className="spine-sweep" x={-w} y={-h * 0.4} width={w * 3} height={h * 0.16} fill={`url(#${id}-sw)`} /></g>
        </mask>
      </defs>

      <rect width={w} height={h} fill={leather.base} />
      <rect width={w} height={h} filter={`url(#${id}-grain)`} opacity=".5" />
      <rect width={w} height={h} filter={`url(#${id}-sheen)`} opacity=".16" />

      {/* raised bands: the ridge itself, a highlight on top and a cast shadow below */}
      {bands.map((by) => (
        <g key={by}>
          <rect x="0" y={by + bandH} width={w} height="3.4" fill="#000" opacity=".3" />
          <rect x="0" y={by} width={w} height={bandH} fill={leather.base} /><rect x="0" y={by} width={w} height={bandH} fill={`url(#${id}-rib)`} />
          <rect x="0" y={by} width={w} height=".9" fill="#fff" opacity=".28" />
        </g>
      ))}

      {/* gold tooling: a dark offset copy beneath gives the foil a pressed-in edge */}
      <use href={`#${id}-t`} transform="translate(.55 .7)" stroke="#000" fill="#000" opacity=".55" />
      <use href={`#${id}-t`} stroke={`url(#${id}-gold)`} fill={`url(#${id}-gold)`} />

      {/* title label: a contrasting leather panel with gold small caps */}
      <g className="spine-label">
        <rect className="spine-label-bg" x={lx} y={lp.y0 + 4} width={lw} height={lh - 8} rx="1" fill={leather.label} />
        <rect x={lx} y={lp.y0 + 4} width={lw} height={lh - 8} rx="1" fill={`url(#${id}-lab)`} />
        <rect x={lx} y={lp.y0 + 4} width={lw} height={lh - 8} rx="1" filter={`url(#${id}-grain)`} opacity=".4" />
        <rect x={lx + 1.6} y={lp.y0 + 5.6} width={lw - 3.2} height={lh - 11.2} fill="none" stroke={`url(#${id}-gold)`} strokeWidth=".7" />
        <text className="spine-title" transform={`translate(${w / 2 - (author ? 1.7 : 0)} ${lp.y0 + lh / 2}) rotate(90)`} textAnchor="middle" dominantBaseline="central" fill={`url(#${id}-lgold)`}
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 700, fontSize: fs, letterSpacing: "0.07em", fontVariant: "small-caps" }}>{title}</text>
        {author && <text className="spine-author" transform={`translate(${w / 2 + fs * 0.62} ${lp.y0 + lh / 2}) rotate(90)`} textAnchor="middle" dominantBaseline="central" fill={`url(#${id}-lgold)`}
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 600, fontSize: 4.1, letterSpacing: "0.2em", fontVariant: "small-caps" }}>{author}</text>}
      </g>

      {/* rounded-spine shading over everything: dark edges, light middle */}
      <rect width={w} height={h} fill={`url(#${id}-shade)`} />
      <rect x={w * 0.3} y="0" width={w * 0.12} height={h} fill="#fff" opacity=".07" />

      {/* hover glint: the same tooling in bright gold, visible only inside a moving band of light */}
      <use className="spine-glint" href={`#${id}-t`} stroke="#fff7d6" fill="#fff7d6" mask={`url(#${id}-m)`} />

      {/* wear: rubbed corners, scuffs, a scratch or two */}
      {wear.map((c, i) => <ellipse key={i} cx={c.x} cy={c.y} rx={c.r} ry={c.r * 1.3} fill="#d8b684" opacity={c.o} />)}
      <path d={scratches.join("")} stroke="#d8b684" strokeWidth=".35" opacity=".28" fill="none" />
      <rect x="0" y="0" width={w} height="1.6" fill="#000" opacity=".4" /><rect x="0" y={h - 1.6} width={w} height="1.6" fill="#000" opacity=".4" />
    </svg>
  );
}
