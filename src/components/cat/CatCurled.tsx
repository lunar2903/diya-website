import { useId } from "react";
import { COATS, strandPaths, tube, type Coat } from "./coats";

/**
 * A cat curled up asleep (default: the cream Persian, long coat, flat face). Static apart from slow breathing,
 * which is CSS (.cat-curl .c-breath in globals.css, and it stops under prefers-reduced-motion).
 * Same fur treatment as CatRig: coat gradient, strand texture, ragged fur silhouette, warm rim light, contact shadow.
 */
const BODY = "M26 104C20 74 52 52 94 52C136 50 172 62 186 90C194 110 170 128 118 128C70 128 31 126 26 104Z";

export default function CatCurled({ coat = "cream", label, className = "" }: { coat?: Coat; label?: string; className?: string }) {
  const u = "k" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = COATS[coat];
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  const sp = strandPaths(c, 41);
  const tail = tube([[30, 100], [52, 134], [118, 136], [164, 124]], 11, 8, c.rings ? [0.3, 0.46, 0.62, 0.78] : []);
  const [f0, f1, f2] = c.fur;
  return (
    <svg viewBox="0 0 220 135" className={`cat-curl ${className}`} {...a11y} style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id={`${u}-f`} gradientUnits="userSpaceOnUse" x1="0" y1="56" x2="0" y2="130"><stop offset="0" stopColor={f0} /><stop offset=".5" stopColor={f1} /><stop offset="1" stopColor={f2} /></linearGradient>
        <linearGradient id={`${u}-r`} gradientUnits="userSpaceOnUse" x1="200" y1="40" x2="60" y2="120"><stop offset="0" stopColor="#ffe2a8" /><stop offset=".6" stopColor="#f2b45a" stopOpacity=".4" /><stop offset="1" stopColor="#f2b45a" stopOpacity="0" /></linearGradient>
        <linearGradient id={`${u}-sh`} gradientUnits="userSpaceOnUse" x1="0" y1="84" x2="0" y2="130"><stop offset="0" stopColor="#0a0503" stopOpacity="0" /><stop offset="1" stopColor="#0a0503" stopOpacity=".4" /></linearGradient>
        <radialGradient id={`${u}-g`}><stop offset="0" stopColor="#050302" stopOpacity=".8" /><stop offset="1" stopColor="#050302" stopOpacity="0" /></radialGradient>
        <pattern id={`${u}-s`} width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(70)">
          <path d={sp.lo} stroke={c.dark} strokeWidth=".45" fill="none" opacity=".4" /><path d={sp.hi} stroke={c.light} strokeWidth=".45" fill="none" opacity=".5" />
        </pattern>
        <filter id={`${u}-e`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="260" height="190"><feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="9" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={c.fluff} xChannelSelector="R" yChannelSelector="G" /></filter>
        <filter id={`${u}-b`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4" /></filter>
        <clipPath id={`${u}-body`}><path d={BODY} /></clipPath>
      </defs>
      <ellipse cx="112" cy="128" rx="104" ry="9" fill={`url(#${u}-g)`} />
      <g className="c-breath">
        <g filter={`url(#${u}-e)`}>
          <path d={BODY} fill={`url(#${u}-f)`} />
          <g clipPath={`url(#${u}-body)`}>
            <ellipse cx="62" cy="86" rx="38" ry="32" fill={f0} opacity=".5" filter={`url(#${u}-b)`} />
            <path d="M92 70C104 82 104 104 90 122" fill="none" stroke="#0a0503" strokeWidth="3" opacity=".2" filter={`url(#${u}-b)`} />
            <rect x="20" y="50" width="190" height="90" fill={`url(#${u}-s)`} />
            <rect x="20" y="84" width="190" height="56" fill={`url(#${u}-sh)`} />
          </g>
          <path d="M30 78C48 56 90 52 136 60C160 64 176 74 186 88" fill="none" stroke={`url(#${u}-r)`} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </g>
      <g filter={`url(#${u}-e)`}>
        <path d={tail.d} fill={`url(#${u}-f)`} />
        <path d={tail.d} fill={`url(#${u}-s)`} />
        <path d={tail.d} fill="none" stroke={`url(#${u}-r)`} strokeWidth="1.4" opacity=".7" />
      </g>
      {/* head, resting on the paws */}
      <g filter={`url(#${u}-e)`}>
        <ellipse cx="166" cy="106" rx="14" ry="7" fill={c.bib} /><ellipse cx="146" cy="116" rx="13" ry="6" fill={c.bib} />
        <g fill={`url(#${u}-f)`}>
          <path d="M141 90C138 80 140 72 145 67C152 70 157 76 158 84Z" /><path d="M178 84C180 76 184 70 191 67C196 73 197 82 195 91Z" />
          <ellipse cx="166" cy="98" rx="32" ry="25" />
        </g>
        <path d="M143 87C143 81 144 76 147 73C150 75 153 78 154 82Z" fill={c.earIn} opacity=".85" /><path d="M182 82C184 77 186 74 189 72C191 76 192 81 191 86Z" fill={c.earIn} opacity=".85" />
        <ellipse cx="166" cy="98" rx="32" ry="25" fill={`url(#${u}-s)`} />
        <ellipse cx="168" cy="110" rx="18" ry="10" fill={c.bib} opacity=".55" filter={`url(#${u}-b)`} />
      </g>
      <path d="M150 98Q156 103 162 98M171 98Q177 103 183 98" fill="none" stroke="#3a2418" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M164 105Q167.5 103 171 105Q169 108.6 167.5 108.8Q166 108.6 164 105Z" fill={c.nose} />
      <path d="M167.5 108.8V111M167.5 111Q164.5 113 161.5 111.6M167.5 111Q170.5 113 173.5 111.6" fill="none" stroke={c.lip} strokeWidth=".7" strokeLinecap="round" opacity=".8" />
      <g stroke="#f8f0e0" strokeWidth=".5" fill="none" opacity=".6" strokeLinecap="round">
        <path d="M172 106Q184 103 196 103M172 108Q185 108 197 110M161 106Q150 103 138 103M161 108Q149 109 137 111" />
      </g>
      <path d="M140 88C146 78 156 73 167 73C178 73 188 78 194 88" fill="none" stroke={`url(#${u}-r)`} strokeWidth="1.6" strokeLinecap="round" filter={`url(#${u}-b)`} />
    </svg>
  );
}
