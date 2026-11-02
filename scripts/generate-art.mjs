// Generates lightweight SVG placeholder artwork into public/art.
// Run: node scripts/generate-art.mjs   (replace the output with Diya's real artwork later)
import { mkdirSync, writeFileSync } from "node:fs";

const C = { paper: "#F6F3EC", paper2: "#E9E3D8", ink: "#242521", rose: "#D8A6AC", sage: "#A9B6A2", ochre: "#D7BC7A", sageD: "#7F8F78", roseD: "#B97F87" };
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const motifs = {
  "poster-series": (f, s) => `
    <rect width="600" height="800" ${f(C.paper2, true)}/>
    <circle cx="300" cy="320" r="150" ${f(C.ochre)}/>
    <polygon points="0,620 190,360 340,560 430,440 600,640 600,800 0,800" ${f(C.sage)}/>
    <polygon points="0,700 250,500 420,680 600,560 600,800 0,800" ${f(C.sageD)}/>
    ${[0, 1, 2, 3].map((i) => `<rect x="60" y="${690 + i * 18}" width="${480 - i * 90}" height="8" ${f(C.rose)}/>`).join("")}
    <rect x="40" y="40" width="520" height="720" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`,
  "botanical-collection": (f, s) => {
    const r = rng(s);
    const leaves = Array.from({ length: 8 }, (_, i) => {
      const y = 700 - i * 70, side = i % 2 ? 1 : -1, rot = side * (50 + r() * 15);
      return `<ellipse cx="${300 + side * 62}" cy="${y}" rx="62" ry="22" transform="rotate(${rot} ${300 + side * 62} ${y})" ${f(i % 3 ? C.sage : C.sageD)}/>`;
    }).join("");
    return `<rect width="600" height="800" ${f(C.paper, true)}/>
    <path d="M300 770 C280 560 320 340 300 150" fill="none" stroke="${C.ink}" stroke-width="4"/>
    ${leaves}
    ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="300" cy="90" rx="22" ry="52" transform="rotate(${a} 300 140)" ${f(C.rose)}/>`).join("")}
    <circle cx="300" cy="140" r="26" ${f(C.ochre)}/>`;
  },
  "experimental-typography": (f) => `
    <rect width="600" height="800" ${f(C.ink, true)}/>
    <text x="40" y="470" font-family="Georgia, serif" font-size="430" font-style="italic" ${f(C.ochre)} ${f === undefined ? "" : ""}>Aa</text>
    <text x="330" y="720" font-family="Georgia, serif" font-size="210" ${f(C.rose)}>&amp;</text>
    <rect x="50" y="560" width="220" height="14" ${f(C.sage)}/>
    <rect x="50" y="590" width="150" height="14" ${f(C.sage)}/>
    <rect x="50" y="620" width="190" height="14" ${f(C.sage)}/>`,
  "fictional-brand-identity": (f) => {
    const shapes = [
      (x, y, c) => `<circle cx="${x + 70}" cy="${y + 70}" r="64" ${f(c)}/>`,
      (x, y, c) => `<path d="M${x + 6} ${y + 134} A64 64 0 0 1 ${x + 134} ${y + 134} Z" ${f(c)}/>`,
      (x, y, c) => `<rect x="${x + 8}" y="${y + 8}" width="124" height="124" ${f(c)}/>`,
      (x, y, c) => `<path d="M${x + 70} ${y + 6} L${x + 134} ${y + 134} L${x + 6} ${y + 134} Z" ${f(c)}/>`,
    ];
    const cols = [C.paper, C.ink, C.ochre, C.sage];
    const cells = Array.from({ length: 12 }, (_, i) => {
      const x = 40 + (i % 3) * 180, y = 60 + Math.floor(i / 3) * 175;
      return shapes[(i * 3 + Math.floor(i / 3)) % 4](x, y, cols[(i * 5) % 4]);
    }).join("");
    return `<rect width="600" height="800" ${f(C.rose, true)}/>${cells}`;
  },
  "editorial-illustration": (f, s) => {
    const r = rng(s + 7);
    const loops = Array.from({ length: 9 }, (_, i) => `<path d="M${200 + i * 25} 200 q${30 + r() * 40} ${-80 - r() * 40} ${60 + r() * 30} ${-10}" fill="none" stroke="${C.ink}" stroke-width="2.5"/>`).join("");
    return `<rect width="600" height="800" ${f(C.ochre, true)}/>
    <rect x="130" y="470" width="340" height="330" rx="170" ${f(C.sage)}/>
    <circle cx="300" cy="330" r="150" ${f(C.rose)}/>
    <circle cx="250" cy="320" r="10" ${f(C.ink)}/><circle cx="350" cy="320" r="10" ${f(C.ink)}/>
    <path d="M265 395 Q300 420 335 395" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
    ${loops}
    <circle cx="90" cy="110" r="40" ${f(C.paper)}/><circle cx="520" cy="660" r="55" ${f(C.paper2)}/>`;
  },
  "personal-visual-exploration": (f, s) => {
    const r = rng(s + 3);
    const scribbles = Array.from({ length: 7 }, () => {
      const x = 60 + r() * 480, y = 80 + r() * 640;
      return `<path d="M${x} ${y} c${40 * r()} ${-90 * r()} ${90 + 40 * r()} ${90 * r()} ${50} ${70} s${-120 * r()} ${60} ${-30} ${-60}" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>`;
    }).join("");
    const dots = Array.from({ length: 14 }, () => `<circle cx="${40 + r() * 520}" cy="${40 + r() * 720}" r="${4 + r() * 9}" ${f(r() > 0.5 ? C.paper : C.rose)}/>`).join("");
    return `<rect width="600" height="800" ${f(C.sage, true)}/>
    <circle cx="380" cy="260" r="120" ${f(C.ochre)}/>${scribbles}${dots}
    <path d="M100 640 q100 -120 200 0 t200 0" fill="none" stroke="${C.paper}" stroke-width="6"/>`;
  },
};

const out = "public/art";
mkdirSync(out, { recursive: true });
const variants = [
  ["cover", { mode: "color", crop: "0 0 600 800", seed: 1 }],
  ["p1", { mode: "sketch", crop: "0 0 600 800", seed: 1 }],
  ["p2", { mode: "sketch", crop: "100 120 400 300", seed: 2 }],
  ["f1", { mode: "color", crop: "0 150 600 450", seed: 4 }],
  ["f2", { mode: "color", crop: "120 80 360 480", seed: 9 }],
];
for (const [slug, draw] of Object.entries(motifs)) {
  for (const [name, v] of variants) {
    const f = (color, bg) => v.mode === "sketch"
      ? (bg ? `fill="${C.paper}"` : `fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-dasharray="7 5"`)
      : `fill="${color}"`;
    const [x, y, w, h] = v.crop.split(" ");
    const body = draw(f, v.seed);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.crop}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
    writeFileSync(`${out}/${slug}-${name}.svg`, svg);
  }
}
console.log("Art generated.");
