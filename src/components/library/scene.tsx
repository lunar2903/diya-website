import { makeRng } from "../cat/catMachine";

/**
 * Static artwork for the library scene behind every page. Three SVG layers (far shelves, stained-glass window,
 * architecture) all drawn in the same 1600x900 space and laid over a 16:9 "stage" that is cropped to the viewport,
 * so DOM glows, shafts and particles line up with the drawing. Everything is generated from a fixed seed.
 */

export const W = 1600, H = 900;

/* ───────────── layer 1: floor-to-ceiling shelves, hundreds of spines ───────────── */
const SPINES = ["#4a3020", "#5a3a24", "#3a2618", "#6a4a30", "#7a5a3a", "#4a1a1c", "#5e2224", "#3a1416", "#1f3326", "#2a4030", "#18281e", "#1d2638", "#262f45", "#8a7556", "#2a1a10"];

function shelves() {
  const r = makeRng(7);
  const rows = 9, rowH = 100, boardH = 9;
  const byColour: Record<string, string> = {};
  let gold = "";
  const movers: { x: number; y: number; w: number; h: number; c: string }[] = [];
  for (let row = 0; row < rows; row++) {
    const base = row * rowH + 78 + 14; // top of the board
    let x = -10 + r() * 14;
    while (x < W + 10) {
      const gap = r() < 0.05;
      const w = 9 + r() * 15, h = 54 + r() * 30;
      if (gap) { x += 14 + r() * 26; continue; }
      const c = SPINES[Math.floor(r() * SPINES.length)];
      const lean = r() < 0.03;
      const y = base - h;
      const d = lean ? `M${x.toFixed(1)} ${base}L${(x + 10).toFixed(1)} ${y.toFixed(1)}L${(x + w + 10).toFixed(1)} ${y.toFixed(1)}L${(x + w).toFixed(1)} ${base}Z` : `M${x.toFixed(1)} ${y.toFixed(1)}h${w.toFixed(1)}V${base}h-${w.toFixed(1)}Z`;
      byColour[c] = (byColour[c] ?? "") + d;
      if (r() < 0.55) gold += `M${x.toFixed(1)} ${(y + 8 + r() * 6).toFixed(1)}h${w.toFixed(1)}M${x.toFixed(1)} ${(y + h - 14 - r() * 8).toFixed(1)}h${w.toFixed(1)}`;
      if (!lean && row > 1 && row < 8 && movers.length < 14 && r() < 0.03 && x > 40 && x < W - 40) movers.push({ x, y, w, h, c });
      x += w + 0.4 + r() * 0.8;
    }
  }
  return { byColour, gold, movers, boards: Array.from({ length: rows + 1 }, (_, i) => i * rowH + 92), rowH, boardH };
}
const S = shelves();

export function FarShelves() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="lib-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0604" stopOpacity="1" /><stop offset=".22" stopColor="#0a0604" stopOpacity=".35" /><stop offset=".8" stopColor="#0a0604" stopOpacity=".2" /><stop offset="1" stopColor="#0a0604" stopOpacity=".8" /></linearGradient>
        <radialGradient id="lib-pool" cx=".42" cy=".42" r=".7"><stop offset="0" stopColor="#f2b45a" stopOpacity=".16" /><stop offset="1" stopColor="#f2b45a" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="#1c130d" />
      {Object.entries(S.byColour).map(([c, d]) => <path key={c} d={d} fill={c} />)}
      <path d={S.gold} stroke="#c8913f" strokeWidth="1.2" opacity=".5" fill="none" />
      {S.boards.map((y) => <rect key={y} x="0" y={y} width={W} height={S.boardH} fill="#120b07" />)}
      {S.boards.map((y) => <rect key={"l" + y} x="0" y={y} width={W} height="1.4" fill="#6a4a30" opacity=".5" />)}
      {/* books that slide out now and then: a few spines drawn separately so a CSS animation can move them */}
      {S.movers.map((m, i) => <rect key={i} className="lib-mover" data-ev={i} x={m.x} y={m.y} width={m.w} height={m.h} fill={m.c} stroke="#c8913f" strokeOpacity=".4" strokeWidth=".8" />)}
      {/* bay dividers */}
      {[0, 400, 800, 1200, 1600].map((x) => <rect key={x} x={x - 7} y="0" width="14" height={H} fill="#0e0805" opacity=".8" />)}
      <rect width={W} height={H} fill="url(#lib-pool)" />
      <rect width={W} height={H} fill="url(#lib-fade)" />
    </svg>
  );
}

/* ───────────── layer 2: gothic stained-glass window ───────────── */
const LEAD = "#120a06";
const PANES: { x: number; y: number; w: number; h: number; c: string }[] = (() => {
  const r = makeRng(31);
  const cols = ["#d98a2b", "#e8c873", "#8fa07a", "#c9702a", "#f0d98a", "#6f8a5c", "#e0a040"];
  const out = [];
  for (let row = 0; row < 11; row++) for (let col = 0; col < 3; col++) out.push({ x: 30 + col * 66.7, y: 120 + row * 38.2, w: 66.7, h: 38.2, c: cols[Math.floor(r() * cols.length)] });
  return out;
})();
const IVY = "M100 520C70 480 130 450 100 410C70 370 130 340 100 300C70 260 130 230 100 190";
const LEAVES = [[84, 486, -30], [118, 462, 25], [86, 424, -40], [116, 392, 30], [84, 356, -25], [118, 322, 35], [86, 282, -35], [116, 252, 30], [88, 214, -30]];

export function StainedWindow() {
  return (
    <svg viewBox="0 0 230 560" aria-hidden>
      <defs>
        <clipPath id="lib-arch"><path d="M30 540V190C30 120 70 60 115 30C160 60 200 120 200 190V540Z" /></clipPath>
        <radialGradient id="lib-back" cx=".5" cy=".45" r=".7"><stop offset="0" stopColor="#fff2c8" stopOpacity=".9" /><stop offset="1" stopColor="#f2b45a" stopOpacity=".25" /></radialGradient>
      </defs>
      <path d="M22 548V190C22 114 66 52 115 20C164 52 208 114 208 190V548Z" fill="#0f0a06" />
      <g clipPath="url(#lib-arch)">
        <rect x="0" y="0" width="230" height="560" fill="#e0a040" />
        {PANES.map((p, i) => <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.c} opacity=".9" />)}
        <rect x="0" y="0" width="230" height="560" fill="url(#lib-back)" />
        {/* arch top: a rose of petals */}
        <g transform="translate(115 118)">
          {Array.from({ length: 8 }, (_, i) => <path key={i} transform={`rotate(${i * 45})`} d="M0 0C-9 -14 -7 -28 0 -36C7 -28 9 -14 0 0Z" fill={i % 2 ? "#e8c873" : "#8fa07a"} stroke={LEAD} strokeWidth="2.4" />)}
          <circle r="7" fill="#c9702a" stroke={LEAD} strokeWidth="2.4" />
        </g>
        <path d="M70 190C70 130 90 76 115 56C140 76 160 130 160 190" fill="none" stroke={LEAD} strokeWidth="3" />
        {/* leading, mullions */}
        <g stroke={LEAD} strokeWidth="3.4" fill="none">
          <path d="M96.7 120V540M163.3 120V540" /><path d="M30 120H200" />
          {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M30 ${120 + i * 38.2}H200`} strokeWidth="2.2" />)}
        </g>
        {/* ivy and leaf leading across the lower panes */}
        <path d={IVY} fill="none" stroke={LEAD} strokeWidth="3" strokeLinecap="round" />
        {LEAVES.map(([x, y, a], i) => <path key={i} transform={`translate(${x} ${y}) rotate(${a})`} d="M0 0C-8 -6 -8 -16 0 -22C8 -16 8 -6 0 0Z" fill="#4e6a3e" stroke={LEAD} strokeWidth="1.8" />)}
      </g>
      <path d="M22 548V190C22 114 66 52 115 20C164 52 208 114 208 190V548" fill="none" stroke="#2a1a10" strokeWidth="8" />
      <path d="M22 548V190C22 114 66 52 115 20C164 52 208 114 208 190V548" fill="none" stroke="#6a4a30" strokeWidth="1.6" opacity=".7" />
      <rect x="10" y="546" width="210" height="14" fill="#2a1a10" /><rect x="10" y="546" width="210" height="2" fill="#6a4a30" opacity=".8" />
    </svg>
  );
}

/* ───────────── layer 3: architecture, furniture, candles ───────────── */
/** sconce flame positions as fractions of the stage, shared by the drawing and the DOM glows */
export const SCONCES = [{ x: 0.27, y: 0.3 }, { x: 0.5, y: 0.3 }, { x: 0.93, y: 0.36 }];

function Pillar({ x, w = 74 }: { x: number; w?: number }) {
  const flutes = Array.from({ length: 5 }, (_, i) => x + 12 + i * ((w - 24) / 4));
  return (
    <g>
      <rect x={x} y="0" width={w} height={H} fill="url(#lib-wood)" />
      <rect x={x - 6} y="0" width={w + 12} height="46" fill="#1a0f08" /><rect x={x - 6} y="40" width={w + 12} height="6" fill="#6a4a30" opacity=".6" />
      <rect x={x - 6} y="760" width={w + 12} height="140" fill="#1a0f08" /><rect x={x - 6} y="760" width={w + 12} height="5" fill="#6a4a30" opacity=".6" />
      {flutes.map((fx) => <path key={fx} d={`M${fx} 60V740`} stroke="#0a0604" strokeWidth="3" opacity=".7" />)}
      {flutes.map((fx) => <path key={"h" + fx} d={`M${fx + 3} 60V740`} stroke="#8a6a44" strokeWidth="1" opacity=".35" />)}
      <path d={`M${x + w / 2} 120l12 18-12 18-12-18z M${x + w / 2} 420l12 18-12 18-12-18z M${x + w / 2} 640l12 18-12 18-12-18z`} fill="none" stroke="#8a6a44" strokeWidth="1.6" opacity=".6" />
    </g>
  );
}

export function Architecture() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="lib-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0e0805" /><stop offset=".3" stopColor="#3a2416" /><stop offset=".55" stopColor="#4a2c1d" /><stop offset="1" stopColor="#120a06" /></linearGradient>
        <linearGradient id="lib-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2416" /><stop offset="1" stopColor="#0c0704" /></linearGradient>
        <radialGradient id="lib-globe" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#c8a064" /><stop offset=".55" stopColor="#6a4a2a" /><stop offset="1" stopColor="#1a0f08" /></radialGradient>
      </defs>
      {/* floor with plank lines */}
      <rect x="0" y="790" width={W} height="110" fill="url(#lib-floor)" />
      {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${i * 140 - 40} 900L${i * 130 + 120} 790`} stroke="#0a0604" strokeWidth="2" opacity=".5" />)}
      <path d="M0 790H1600" stroke="#6a4a30" strokeWidth="2" opacity=".5" />
      <Pillar x={150} /><Pillar x={600} /><Pillar x={1010} w={64} /><Pillar x={1480} w={80} />
      {/* picture rail and rolling ladder on the left shelves */}
      <path d="M0 330H1600" stroke="#8a6a30" strokeWidth="3" opacity=".5" />
      <g stroke="#3a2416" fill="none" strokeLinecap="round">
        <path d="M268 336L226 786M312 336L278 786" strokeWidth="9" />
        <path d="M268 336L226 786M312 336L278 786" strokeWidth="2" stroke="#8a6a44" opacity=".4" />
        {Array.from({ length: 9 }, (_, i) => { const t = (i + 0.7) / 9.6, y = 336 + t * 450; return <path key={i} d={`M${268 - 42 * t} ${y}L${312 - 34 * t} ${y}`} strokeWidth="5" />; })}
        <path d="M262 326h56" strokeWidth="6" stroke="#8a6a30" />
      </g>
      <circle cx="226" cy="788" r="7" fill="#1a0f08" stroke="#8a6a30" strokeWidth="1.5" /><circle cx="278" cy="788" r="7" fill="#1a0f08" stroke="#8a6a30" strokeWidth="1.5" />
      {/* globe on a stand */}
      <g transform="translate(430 640)">
        <path d="M-42 150L-12 80M42 150L12 80M0 150V80" stroke="#2a1a10" strokeWidth="8" strokeLinecap="round" />
        <path d="M-50 150h100" stroke="#2a1a10" strokeWidth="6" />
        <circle r="62" cy="30" fill="url(#lib-globe)" />
        <g fill="none" stroke="#120a06" strokeWidth="1.2" opacity=".6"><ellipse cy="30" rx="62" ry="22" /><ellipse cy="30" rx="26" ry="62" /><path d="M-62 30H62" /></g>
        <path d="M-58 -2A64 64 0 0 1 58 -2" fill="none" stroke="#c8913f" strokeWidth="3" opacity=".7" />
      </g>
      {/* wall sconces: bracket, candle, drip */}
      {SCONCES.map((s, i) => {
        const x = s.x * W, y = s.y * H;
        return (
          <g key={i}>
            <path d={`M${x - 14} ${y + 48}C${x - 14} ${y + 70} ${x + 14} ${y + 70} ${x + 14} ${y + 48}M${x} ${y + 62}V${y + 100}`} stroke="#8a6a30" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x={x - 5} y={y + 4} width="10" height="46" rx="2" fill="#e8d6ae" /><rect x={x - 5} y={y + 4} width="3" height="46" fill="#fff" opacity=".25" />
            <path d={`M${x - 10} ${y + 50}h20`} stroke="#8a6a30" strokeWidth="3" />
            <g className="lib-flame" style={{ transformOrigin: `${x}px ${y + 4}px` }}>
              <path d={`M${x} ${y - 24}C${x - 9} ${y - 10} ${x - 7} ${y} ${x} ${y + 4}C${x + 7} ${y} ${x + 9} ${y - 10} ${x} ${y - 24}Z`} fill="#ffb347" /><path d={`M${x} ${y - 12}C${x - 4} ${y - 5} ${x - 3} ${y} ${x} ${y + 3}C${x + 3} ${y} ${x + 4} ${y - 5} ${x} ${y - 12}Z`} fill="#fff1c4" />
            </g>
          </g>
        );
      })}
      {/* armchair silhouette near the bottom edge */}
      <g transform="translate(1180 700)" fill="#0b0604">
        <path d="M0 200V60C0 20 28 0 60 0C80 0 90 14 90 30V70H210V30C210 14 220 0 240 0C272 0 300 20 300 60V200Z" />
        <path d="M30 200V110H270V200Z" fill="#150c07" /><path d="M20 90C20 70 40 66 60 66H240C260 66 280 70 280 90V110H20Z" fill="#1a0f08" />
        <path d="M0 60C0 20 28 0 60 0C80 0 90 14 90 30" fill="none" stroke="#c8913f" strokeWidth="2" opacity=".35" />
        <path d="M300 60C300 20 272 0 240 0C220 0 210 14 210 30" fill="none" stroke="#c8913f" strokeWidth="2" opacity=".35" />
        <rect x="30" y="196" width="14" height="14" /><rect x="256" y="196" width="14" height="14" />
      </g>
    </svg>
  );
}
