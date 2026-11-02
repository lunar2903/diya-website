import { forwardRef, useId, type CSSProperties } from "react";
import { COATS, strandPaths, stripeRow, tube, type Coat, type CoatDef } from "./coats";

/**
 * The cat's body: one layered SVG rig with separately animatable parts (head, jaw, eyelids, pupils, ears, tail,
 * chest, forelegs). It has no behaviour of its own: poses are CSS custom properties on the root <svg>
 * (see catMachine.ts for the pose table and globals.css for how each variable drives a part).
 *
 * Realism comes from layering, not from outlines:
 *   coat gradient -> tabby markings -> cream bib -> haunch and shoulder shading -> fine fur-strand texture
 *   -> belly shadow -> warm rim light, all run through a displacement filter that roughens the silhouette into fur.
 * Eyes are glossy (iris gradient, slit pupil that dilates, specular highlights, amber eye-glow), whiskers are
 * individual strands with a travelling glint, and a contact shadow sits under the paws.
 *
 * Two body silhouettes cross-fade: "lie" (loaf, sleep, stand, walk, stretch, knead) and "sit" (sit, groom, lick,
 * yawn, bat). Coordinates: viewBox 260x180, ground at y=168, the cat faces right (the wrapper mirrors it).
 * `lite` drops the filters and texture (used for tiny decorative cats).
 */

const v = (o: Record<string, string>) => o as unknown as CSSProperties;

/* silhouettes */
const LIE = "M168 116C162 108 148 105 134 107C116 109 98 106 80 106C62 106 49 122 50 141C51 156 61 168 78 168C100 169 124 165 148 168C162 169 174 160 175 145C176 132 172 122 168 116Z";
const SIT = "M138 78C118 84 100 106 94 130C90 148 92 164 108 168L156 168C160 148 164 124 160 100C158 88 152 80 144 77Z";

/* standing / walking: a rounded torso (about 110 wide, head about 1/3 of that) on four legs long enough to step */
const STAND = "M58 102C56 84 74 74 100 74C124 74 144 76 156 85C166 93 168 108 160 117C151 126 128 129 104 129C80 129 60 123 58 102Z";
const TAIL_STAND = tube([[64, 100], [38, 100], [22, 78], [34, 54]], 10, 7, []);

const TAIL_LIE = tube([[63, 142], [34, 148], [10, 128], [20, 94]], 8.5, 4.6, [0.2, 0.34, 0.48, 0.62, 0.76, 0.9]);
const TAIL_SIT = tube([[98, 160], [60, 170], [30, 152], [40, 122]], 8.5, 4.6, [0.2, 0.34, 0.48, 0.62, 0.76, 0.9]);
/* a tail that hangs down over the edge of whatever the cat sits on (the Cover book) */
const TAIL_HANG = tube([[100, 154], [82, 160], [72, 182], [76, 204]], 10, 7, []);
const PLUME_LIE = tube([[63, 142], [34, 150], [8, 130], [18, 92]], 11, 8, []);
const PLUME_SIT = tube([[98, 160], [60, 172], [28, 154], [38, 118]], 11, 8, []);

const almond = (cx: number, outer: 1 | -1) => {
  const o = cx + outer * 7.5, i = cx - outer * 7.5;
  return `M${o} 107.8Q${cx} 100.6 ${i} 109.2Q${cx} 116 ${o} 107.8Z`;
};
const EYES = [{ cx: 181.5, outer: -1 as const }, { cx: 199.5, outer: 1 as const }];

function Head({ c, u, k, lite }: { c: CoatDef; u: string; k: string; lite: boolean }) {
  const ed = lite ? undefined : `url(#${u}-ed)`;
  const flat = c.flat;
  const noseY = flat ? -2.4 : 0;
  return (
    <g className="c-head">
      <g className="c-neck"><ellipse cx="178" cy="126" rx="21" ry="16" fill={`url(#${u}-fur)`} filter={ed} /></g>

      {/* ears: outer fur, inner ear with tufts, darker rim */}
      <g className="c-ear c-ear-f"><g className="c-mic c-mic-f" filter={ed}>
        <path d="M169 103C166 93 167 85 172 77C181 82 188 89 190 97Z" fill={`url(#${u}-furH)`} />
        <path d="M173 98C172 92 173 87 175.5 83C180 86.5 184 91 185 96Z" fill={c.earIn} />
        <path d="M176 97l1-8M179 97l.5-7M182 96.5l-.5-6" stroke={c.bib} strokeWidth=".7" strokeLinecap="round" opacity=".75" fill="none" />
        <path d="M169 103C166 93 167 85 172 77" fill="none" stroke={c.dark} strokeWidth=".9" opacity=".5" />
      </g></g>
      <g className="c-ear c-ear-n"><g className="c-mic c-mic-n" filter={ed}>
        <path d="M191 97C193 89 199 82 208 76C212 85 213 95 211 105Z" fill={`url(#${u}-furH)`} />
        <path d="M196.5 96C198 90 202 86 206.5 83C208 89 208 95 207 101Z" fill={c.earIn} />
        <path d="M200 97l.5-8M203 98l1-7M206 99l1-6" stroke={c.bib} strokeWidth=".7" strokeLinecap="round" opacity=".75" fill="none" />
        <path d="M208 76C212 85 213 95 211 105" fill="none" stroke={`url(#${u}-rim)`} strokeWidth="1.2" />
      </g></g>

      {/* face */}
      <g filter={ed}>
        <path id={`${u}-face${k}`} d="M171 108C170 99 179 94 190 94C201 94 210 99 209 108C212 115 210 124 203 128C198 132 182 132 177 128C170 124 168 115 171 108Z" fill={`url(#${u}-furH)`} />
        <clipPath id={`${u}-faceC${k}`}><use href={`#${u}-face${k}`} /></clipPath>
        <g clipPath={`url(#${u}-faceC${k})`}>
          {c.stripeOp > 0 && (
            <g stroke={c.stripe} strokeLinecap="round" fill="none" opacity={c.stripeOp}>
              <path d="M187 95l.6 7M190 94.5v8M193 95l-.6 7" strokeWidth="1.6" />
              <path d="M184 99.5Q187 101.5 190 99.5Q193 101.5 196 99.5" strokeWidth=".9" />
              <path d="M174 106.5Q170 109 170.5 114M205 106.5Q209 109 208.5 114M173 114Q172 118 175 121M207 114Q208 118 205 121" strokeWidth="1.3" />
              <path d="M175.5 108l-7 1M204.5 108l7 1" strokeWidth=".9" />
            </g>
          )}
          {/* muzzle pads and chin */}
          <g filter={lite ? undefined : `url(#${u}-bl1)`}>
            {c.bibOn.muzzle && (<g fill={c.bib}><ellipse cx="184.5" cy="122" rx="8.5" ry="6.4" /><ellipse cx="195.5" cy="122" rx="8.5" ry="6.4" /><ellipse cx="190" cy="129" rx="6.4" ry="3.8" /></g>)}
            {!c.bibOn.muzzle && <g fill={c.light} opacity=".5"><ellipse cx="184.5" cy="122" rx="8" ry="6" /><ellipse cx="195.5" cy="122" rx="8" ry="6" /></g>}
          </g>
          <rect x="166" y="90" width="50" height="46" fill={`url(#${u}-strands)`} />
          <ellipse cx="190" cy="132" rx="26" ry="9" fill={`url(#${u}-ao)`} opacity=".7" />
        </g>
      </g>

      <g transform={`translate(0 ${noseY})`}>
        {/* open mouth, revealed when the jaw drops */}
        <g className="c-mouth">
          <ellipse cx="190" cy="125.5" rx="7.6" ry="5.2" fill="#3a0f0c" />
          <ellipse cx="190" cy="129" rx="4.4" ry="2.4" fill="#c4605c" />
          <path d="M185.6 121.6l.9 3 1-3zM192.4 121.6l.9 3 1-3z" fill="#f6efe2" />
        </g>
        <g className="c-jaw">
          <path d="M180.5 124.5Q190 128.5 199.5 124.5Q199 133 190 134.2Q181 133 180.5 124.5Z" fill={c.bibOn.muzzle ? c.bib : `url(#${u}-furH)`} filter={ed} />
          <path d="M184 128.4Q190 131.6 196 128.4" fill="none" stroke={c.lip} strokeWidth=".6" opacity=".45" />
        </g>
        {/* nose, philtrum, mouth */}
        <path d="M186.4 115.4Q190 113 193.6 115.4Q191.8 120 190 120.4Q188.2 120 186.4 115.4Z" fill={c.nose} />
        <path d="M187.6 115.5Q190 114.3 192.4 115.5" stroke="#fff" strokeOpacity=".5" strokeWidth=".7" fill="none" strokeLinecap="round" />
        <path d="M190 120.4V123.2M190 123.2Q186.4 126.4 183 124.2M190 123.2Q193.6 126.4 197 124.2" fill="none" stroke={c.lip} strokeWidth=".8" strokeLinecap="round" opacity=".8" />
        <g fill={c.dark} opacity=".35"><circle cx="180" cy="120" r=".6" /><circle cx="178.6" cy="122" r=".6" /><circle cx="180.6" cy="123.4" r=".6" /><circle cx="200" cy="120" r=".6" /><circle cx="201.4" cy="122" r=".6" /><circle cx="199.4" cy="123.4" r=".6" /></g>
      </g>

      {/* eyes: glossy iris, dilating slit pupil, highlights, eyelid */}
      {EYES.map(({ cx, outer }, n) => {
        const d = almond(cx, outer);
        const id = `${u}-eye${k}${n}`;
        return (
          <g key={n} transform={flat ? `translate(${(cx - 190) * 0.06} 0.8)` : undefined}>
            <ellipse cx={cx} cy="108.4" rx="10.5" ry="7" fill="#1a0e08" opacity=".2" filter={lite ? undefined : `url(#${u}-bl2)`} />
            <clipPath id={id}><path d={d} /></clipPath>
            <path d={d} fill={c.iris[2]} />
            <g clipPath={`url(#${id})`}>
              <ellipse cx={cx} cy="108.6" rx="9" ry="6.2" fill={`url(#${u}-iris)`} />
              <ellipse className="c-eyeglow" cx={cx} cy="112.2" rx="7" ry="2.6" fill="#ffc870" filter={lite ? undefined : `url(#${u}-bl1)`} />
              <g className="c-pupil" style={v({ "--ox": `${cx}px`, "--oy": "108.6px" })}><ellipse cx={cx + 0.4} cy="108.6" rx="2.7" ry="4.7" fill="#0a0604" /></g>
              <ellipse cx={cx} cy="105" rx="9" ry="3" fill="#000" opacity=".28" />
              <ellipse cx={cx + 2.5} cy="106" rx="1.7" ry="1.2" fill="#fff" opacity=".95" />
              <circle cx={cx - 2.4} cy="111" r=".75" fill="#fff" opacity=".55" />
            </g>
            <path d={d} fill="none" stroke="#150b06" strokeWidth=".7" opacity=".85" />
            <g className="c-lid" style={v({ "--ox": `${cx}px`, "--oy": "103.4px" })}>
              <path d={d} fill={`url(#${u}-furH)`} stroke={`url(#${u}-furH)`} strokeWidth="1.4" />
              <path d={`M${cx - 7.5} 109.4Q${cx} 114 ${cx + 7.5} 108.6`} fill="none" stroke="#150b06" strokeWidth=".9" strokeLinecap="round" opacity=".9" />
            </g>
            <path d={`M${cx - 7.6} 108.4Q${cx} 101 ${cx + 7.6} 108.4`} fill="none" stroke="#150b06" strokeWidth=".9" strokeLinecap="round" opacity=".6" />
          </g>
        );
      })}

      {/* whiskers: individual strands with a glint that travels along them */}
      <g fill="none" strokeLinecap="round">
        <g stroke="#f8f0e0" strokeWidth=".55" opacity=".7">
          <path d="M199 119.5Q212 116 226 116" /><path d="M200 122Q214 122 228 125" /><path d="M199 124.5Q212 128.5 223 133" />
          <path d="M181 119.5Q168 116 154 116" /><path d="M180 122Q166 122 152 125" /><path d="M181 124.5Q168 128.5 157 133" />
          <path d="M205 102Q210 98.5 215 97.5M175 102Q170 98.5 165 97.5" strokeWidth=".45" />
        </g>
        <g className="c-glint" stroke="#fff3cf" strokeWidth=".75" strokeDasharray="3 40" opacity=".95">
          <path d="M199 119.5Q212 116 226 116" /><path d="M200 122Q214 122 228 125" /><path d="M199 124.5Q212 128.5 223 133" />
          <path d="M181 119.5Q168 116 154 116" /><path d="M180 122Q166 122 152 125" /><path d="M181 124.5Q168 128.5 157 133" />
        </g>
      </g>

      {/* warm rim light on the crown and the cheek that faces the lamp */}
      <path d="M176 99Q182 94 190 94Q201 94 209 99M209.5 108Q212 116 207 125" fill="none" stroke={`url(#${u}-rim)`} strokeWidth="1.5" strokeLinecap="round" filter={lite ? undefined : `url(#${u}-bl1)`} />
    </g>
  );
}

/** a standing leg: pivots at the shoulder / hip, long enough that most of it shows below the belly */
function StandLeg({ x, top = 118, shade, u, paw, cls, ed }: { x: number; top?: number; shade?: boolean; u: string; paw: string; cls: string; ed?: string }) {
  return (
    <g className={cls} filter={ed}>
      <path d={`M${x - 5.8} ${top}C${x - 5.4} ${top + 16} ${x - 3.8} ${top + 30} ${x - 3.8} ${top + 42}L${x - 4} ${top + 46.5}L${x + 4.4} ${top + 46.5}L${x + 3.8} ${top + 42}C${x + 3.8} ${top + 30} ${x + 5.4} ${top + 16} ${x + 5.8} ${top}Z`} fill={`url(#${u}-fur)`} />
      <ellipse cx={x + 0.8} cy={top + 46.5} rx="6.2" ry="3.3" fill={paw} />
      {shade && <path d={`M${x - 6} ${top}h12V${top + 50}h-12Z`} fill="#0b0604" opacity=".34" />}
    </g>
  );
}

function Leg({ x, top, shade, u, c, paw, cls, ed }: { x: number; top: number; shade?: boolean; u: string; c: CoatDef; paw: string; cls?: string; ed?: string }) {
  return (
    <g className={cls} filter={ed}>
      <path d={`M${x - 8} ${top}C${x - 7} ${top + 22} ${x - 5} ${top + 40} ${x - 6} ${top + 56}C${x - 9} ${top + 60} ${x - 9} ${top + 68} ${x} ${top + 68}C${x + 9} ${top + 68} ${x + 11} ${top + 61} ${x + 6} ${top + 56}C${x + 5} ${top + 40} ${x + 7} ${top + 22} ${x + 8} ${top}Z`} fill={`url(#${u}-fur)`} />
      <path d={`M${x - 6} ${top + 56}C${x - 9} ${top + 60} ${x - 9} ${top + 68} ${x} ${top + 68}C${x + 9} ${top + 68} ${x + 11} ${top + 61} ${x + 6} ${top + 56}Z`} fill={paw} />
      <path d={`M${x - 2.5} ${top + 63}v4M${x + 2.5} ${top + 63}v4`} stroke={c.dark} strokeWidth=".6" opacity=".4" />
      {shade && <path d={`M${x - 8} ${top}h16V${top + 68}h-16Z`} fill="#0b0604" opacity=".38" />}
    </g>
  );
}

const CatRig = forwardRef<SVGSVGElement, { className?: string; label?: string; pose?: "sit" | "sleep" | "loaf"; coat?: Coat; lite?: boolean; hangTail?: boolean }>(function CatRig({ className = "", label, pose, coat = "cream", lite = false, hangTail = false }, ref) {
  const u = "c" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = COATS[coat];
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  const ed = lite ? undefined : `url(#${u}-ed)`;
  const tail = c.rings ? { lie: TAIL_LIE, sit: TAIL_SIT } : { lie: PLUME_LIE, sit: PLUME_SIT };
  if (hangTail) tail.sit = TAIL_HANG;
  const seed = 37;
  const sp = strandPaths(c, seed);
  const paw = c.bibOn.paws ? c.bib : c.fur[1];
  const stripes = c.stripeOp > 0;
  const lieStripes = stripeRow(seed, 62, 156, 104, 38, 6.2, 9.5, 3);
  const sitStripes = stripeRow(seed + 1, 98, 150, 80, 40, 6, 9, 3);
  const [f0, f1, f2] = c.fur;
  return (
    <svg ref={ref} viewBox="0 0 260 180" className={`cat-rig ${className}`} data-pose={pose} {...a11y}>
      <defs>
        <linearGradient id={`${u}-fur`} gradientUnits="userSpaceOnUse" x1="0" y1="98" x2="0" y2="172"><stop offset="0" stopColor={f0} /><stop offset=".5" stopColor={f1} /><stop offset="1" stopColor={f2} /></linearGradient>
        <linearGradient id={`${u}-furH`} gradientUnits="userSpaceOnUse" x1="0" y1="92" x2="0" y2="134"><stop offset="0" stopColor={f0} /><stop offset=".55" stopColor={f1} /><stop offset="1" stopColor={f2} /></linearGradient>
        <linearGradient id={`${u}-rim`} gradientUnits="userSpaceOnUse" x1="250" y1="60" x2="100" y2="170"><stop offset="0" stopColor="#ffe2a8" stopOpacity="1" /><stop offset=".55" stopColor="#f2b45a" stopOpacity=".45" /><stop offset="1" stopColor="#f2b45a" stopOpacity="0" /></linearGradient>
        <linearGradient id={`${u}-ao`} gradientUnits="userSpaceOnUse" x1="0" y1="140" x2="0" y2="170"><stop offset="0" stopColor="#0a0503" stopOpacity="0" /><stop offset="1" stopColor="#0a0503" stopOpacity=".62" /></linearGradient>
        <radialGradient id={`${u}-lit`} gradientUnits="userSpaceOnUse" cx="160" cy="112" r="78"><stop offset="0" stopColor="#ffdca0" stopOpacity=".34" /><stop offset="1" stopColor="#ffdca0" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${u}-thigh`} gradientUnits="userSpaceOnUse" cx="76" cy="124" r="34"><stop offset="0" stopColor={f0} stopOpacity=".7" /><stop offset="1" stopColor={f2} stopOpacity=".25" /></radialGradient>
        <radialGradient id={`${u}-iris`}><stop offset="0" stopColor={c.iris[0]} /><stop offset=".55" stopColor={c.iris[1]} /><stop offset="1" stopColor={c.iris[2]} /></radialGradient>
        <radialGradient id={`${u}-gnd`}><stop offset="0" stopColor="#050302" stopOpacity=".75" /><stop offset="1" stopColor="#050302" stopOpacity="0" /></radialGradient>
        <pattern id={`${u}-strands`} width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(78)">
          <path d={sp.lo} stroke={c.dark} strokeWidth=".45" strokeLinecap="round" fill="none" opacity=".42" />
          <path d={sp.hi} stroke={c.light} strokeWidth=".45" strokeLinecap="round" fill="none" opacity=".4" />
        </pattern>
        <path id={`${u}-lieP`} d={LIE} />
        <path id={`${u}-sitP`} d={SIT} />
        <path id={`${u}-standP`} d={STAND} />
        <clipPath id={`${u}-standC`}><use href={`#${u}-standP`} /></clipPath>
        <clipPath id={`${u}-tstC`}><path d={TAIL_STAND.d} /></clipPath>
        <clipPath id={`${u}-lieC`}><use href={`#${u}-lieP`} /></clipPath>
        <clipPath id={`${u}-sitC`}><use href={`#${u}-sitP`} /></clipPath>
        <clipPath id={`${u}-tlC`}><path d={tail.lie.d} /></clipPath>
        <clipPath id={`${u}-tsC`}><path d={tail.sit.d} /></clipPath>
        {!lite && (<>
          <filter id={`${u}-ed`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="320" height="240"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="5" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={c.fluff} xChannelSelector="R" yChannelSelector="G" /></filter>
          <filter id={`${u}-bl1`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".8" /></filter>
          <filter id={`${u}-bl3`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.8" /></filter>
          <filter id={`${u}-bl2`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2" /></filter>
        </>)}
      </defs>

      {/* contact shadow: a wide soft penumbra and a tight dark core under the paws */}
      <ellipse cx="128" cy="170" rx="98" ry="9" fill={`url(#${u}-gnd)`} />
      <ellipse cx="122" cy="168.6" rx="64" ry="3.4" fill="#050302" opacity=".8" filter={lite ? undefined : `url(#${u}-bl1)`} />

      {/* ───── lie silhouette: loaf / sleep / stand / walk / stretch / knead ───── */}
      <g className="c-lie">
        <g className="c-tailA"><g className="c-mic c-mic-t" filter={ed}>
          <path d={tail.lie.d} fill={`url(#${u}-fur)`} />
          <g clipPath={`url(#${u}-tlC)`}>
            {c.rings && <path d={tail.lie.rings} fill={c.stripe} opacity={c.stripeOp} />}
            <rect x="0" y="80" width="80" height="80" fill={`url(#${u}-strands)`} />
            <path d={tail.lie.d} fill="none" stroke={`url(#${u}-rim)`} strokeWidth="2" />
          </g>
          <circle cx={c.rings ? 20 : 18} cy={c.rings ? 94 : 92} r="5.4" fill={c.rings ? c.stripe : f0} opacity={c.rings ? c.stripeOp : 1} />
        </g></g>
        <g className="c-body">
          <g className="c-hindleg swing-b">
            <path d="M74 146C70 166 76 184 80 192C77 196 80 200 90 200C99 200 101 194 97 190C96 176 98 160 98 146Z" fill={`url(#${u}-fur)`} filter={ed} />
            <path d="M80 192C77 196 80 200 90 200C99 200 101 194 97 190Z" fill={paw} />
          </g>
          <Leg x={152} top={128} shade u={u} c={c} paw={paw} cls="c-farleg swing-b" ed={ed} />
          <g className="c-breath">
            <g filter={ed}>
              <use href={`#${u}-lieP`} fill={`url(#${u}-fur)`} />
              <g clipPath={`url(#${u}-lieC)`}>
                <rect x="40" y="95" width="150" height="80" fill={`url(#${u}-lit)`} />
                {stripes && <g opacity={c.stripeOp} filter={lite ? undefined : `url(#${u}-bl1)`}><path d={lieStripes} fill={c.stripe} /><path d="M60 128Q74 118 92 124M58 140Q74 130 96 138M62 152Q78 144 98 152" fill="none" stroke={c.stripe} strokeWidth="2.6" strokeLinecap="round" /></g>}
                {/* haunch and shoulder: the forms that make it a body, not a bean */}
                <ellipse cx="82" cy="140" rx="27" ry="27" fill={`url(#${u}-thigh)`} />
                <path d="M104 126C111 140 108 154 98 166" fill="none" stroke="#0a0503" strokeWidth="3" opacity=".3" filter={lite ? undefined : `url(#${u}-bl2)`} />
                <path d="M126 107C138 102 154 110 156 124C146 130 132 126 126 107Z" fill={f0} opacity=".5" filter={lite ? undefined : `url(#${u}-bl1)`} />
                <path d="M130 128C140 136 152 136 162 130" fill="none" stroke="#0a0503" strokeWidth="2.6" opacity=".3" filter={lite ? undefined : `url(#${u}-bl2)`} />
                {c.bibOn.chest && <path d="M162 120C172 124 178 138 176 152C170 162 158 163 152 156C155 144 157 132 162 120Z" fill={c.bib} filter={lite ? undefined : `url(#${u}-bl3)`} />}
                <rect x="40" y="95" width="150" height="80" fill={`url(#${u}-strands)`} />
                <rect x="40" y="140" width="150" height="34" fill={`url(#${u}-ao)`} />
              </g>
              <path d="M168 116C162 108 148 105 134 107C116 109 98 106 80 106C62 106 52 118 50.5 134" fill="none" stroke={`url(#${u}-rim)`} strokeWidth="2" strokeLinecap="round" />
              <path d="M168 116C172 122 176 132 175 145" fill="none" stroke="#ffd89a" strokeWidth="1.4" strokeLinecap="round" opacity=".55" strokeDasharray="1.6 1.2 3 1.4" />
            </g>
          </g>
          <Leg x={166} top={128} u={u} c={c} paw={paw} cls="c-nearleg swing-a" ed={ed} />
          <g className="c-tuck">
            <g className="c-tuck-a"><ellipse cx="180" cy="164" rx="14" ry="6.4" fill={paw} filter={ed} /><path d="M174 166v-3M180 166.6v-3.4M186 166v-3" stroke={c.dark} strokeWidth=".6" opacity=".4" /></g>
            <g className="c-tuck-b"><ellipse cx="163" cy="166" rx="13" ry="5.8" fill={paw} filter={ed} /><path d="M157 167.6v-3M163 168.2v-3.4M169 167.6v-3" stroke={c.dark} strokeWidth=".6" opacity=".4" /></g>
          </g>
          <Head c={c} u={u} k="a" lite={lite} />
        </g>
      </g>

      {/* ───── sit silhouette: sit / groom / lick / yawn / bat ───── */}
      <g className="c-sit">
        <g className="c-tailB"><g className="c-mic c-mic-t" filter={ed}>
          <path d={tail.sit.d} fill={`url(#${u}-fur)`} />
          <g clipPath={`url(#${u}-tsC)`}>
            {c.rings && <path d={tail.sit.rings} fill={c.stripe} opacity={c.stripeOp} />}
            <rect x="0" y="100" width="110" height="130" fill={`url(#${u}-strands)`} />
            <path d={tail.sit.d} fill="none" stroke={`url(#${u}-rim)`} strokeWidth="2" />
          </g>
          <circle cx={hangTail ? 76 : 40} cy={hangTail ? 204 : 122} r="5.4" fill={c.rings ? c.stripe : f0} opacity={c.rings ? c.stripeOp : 1} />
        </g></g>
        <g className="c-sitfar"><Leg x={144} top={100} shade u={u} c={c} paw={paw} ed={ed} /></g>
        <g transform="rotate(-8 128 112)" className="c-breath-g"><g className="c-breath">
          <g filter={ed}>
            <use href={`#${u}-sitP`} fill={`url(#${u}-fur)`} />
            <g clipPath={`url(#${u}-sitC)`}>
              <rect x="80" y="70" width="100" height="110" fill={`url(#${u}-lit)`} />
              {stripes && <g opacity={c.stripeOp} filter={lite ? undefined : `url(#${u}-bl1)`}><path d={sitStripes} fill={c.stripe} /><path d="M96 140Q108 130 124 136M98 152Q110 144 126 150" fill="none" stroke={c.stripe} strokeWidth="2.6" strokeLinecap="round" /></g>}
              <ellipse cx="112" cy="146" rx="26" ry="22" fill={`url(#${u}-thigh)`} />
              <path d="M130 130C136 144 134 156 128 166" fill="none" stroke="#0a0503" strokeWidth="3" opacity=".3" filter={lite ? undefined : `url(#${u}-bl2)`} />
              {c.bibOn.chest && <path d="M146 80C158 84 164 104 162 130C158 144 146 146 142 134C146 118 146 98 146 80Z" fill={c.bib} filter={lite ? undefined : `url(#${u}-bl3)`} />}
              <rect x="80" y="70" width="100" height="110" fill={`url(#${u}-strands)`} />
              <rect x="80" y="140" width="100" height="34" fill={`url(#${u}-ao)`} />
            </g>
            <path d="M138 78C120 84 102 104 95 128" fill="none" stroke={`url(#${u}-rim)`} strokeWidth="2" strokeLinecap="round" />
            <path d="M144 77C152 80 158 88 160 100C164 124 160 148 156 168" fill="none" stroke="#ffd89a" strokeWidth="1.4" strokeLinecap="round" opacity=".55" strokeDasharray="1.6 1.2 3 1.4" />
          </g>
          <g filter={ed}><ellipse cx="132" cy="166" rx="15" ry="5.6" fill={paw} /></g>
        </g></g>
        <g className="c-sitnear"><Leg x={154} top={100} u={u} c={c} paw={paw} ed={ed} /></g>
        <g className="c-headsit"><Head c={c} u={u} k="b" lite={lite} /></g>
      </g>
      {/* ───── stand silhouette: the walking cat. Torso, tail and head are one group; legs pivot at hip and shoulder ───── */}
      <g className="c-stand">
        <g className="c-st-tail"><g className="c-mic c-mic-t" filter={ed}>
          <path d={TAIL_STAND.d} fill={`url(#${u}-fur)`} />
          <g clipPath={`url(#${u}-tstC)`}>
            <rect x="0" y="40" width="80" height="80" fill={`url(#${u}-strands)`} />
            <path d={TAIL_STAND.d} fill="none" stroke={`url(#${u}-rim)`} strokeWidth="2" />
          </g>
        </g></g>
        <g className="c-st-body">
          <StandLeg x={98} u={u} paw={paw} cls="c-st-leg c-st-fh c-st-a" ed={ed} shade />
          <StandLeg x={136} u={u} paw={paw} cls="c-st-leg c-st-ff c-st-b" ed={ed} shade />
          <g className="c-breath">
            <g filter={ed}>
              <use href={`#${u}-standP`} fill={`url(#${u}-fur)`} />
              <g clipPath={`url(#${u}-standC)`}>
                <rect x="40" y="70" width="140" height="70" fill={`url(#${u}-lit)`} />
                <ellipse cx="84" cy="108" rx="24" ry="22" fill={`url(#${u}-thigh)`} />
                {c.bibOn.chest && <path d="M150 88C162 94 168 108 163 120C157 128 146 126 142 116C146 106 148 96 150 88Z" fill={c.bib} filter={lite ? undefined : `url(#${u}-bl3)`} />}
                <rect x="40" y="70" width="140" height="70" fill={`url(#${u}-strands)`} />
                <path d="M58 118C80 132 140 134 162 116L162 130L58 130Z" fill="#0a0503" opacity=".22" />
              </g>
              <path d="M62 90C72 78 96 75 120 76C140 77 154 82 160 90" fill="none" stroke={`url(#${u}-rim)`} strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>
          <StandLeg x={84} u={u} paw={paw} cls="c-st-leg c-st-nh c-st-b" ed={ed} />
          <StandLeg x={150} u={u} paw={paw} cls="c-st-leg c-st-nf c-st-a" ed={ed} />
          <g transform="translate(-12 -28)"><Head c={c} u={u} k="c" lite={lite} /></g>
        </g>
      </g>
      <circle className="c-mote" cx="196" cy="70" r="2.4" fill="#ffd89a" />
    </svg>
  );
});

export default CatRig;
