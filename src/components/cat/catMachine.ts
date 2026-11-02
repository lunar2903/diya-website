/**
 * THE CAT'S BRAIN — a weighted finite-state machine. No React, no DOM: edit this file to tune behaviour.
 *
 * How it fits together
 *  - STATES   what the cat can be doing, how long (seconds, min–max) and what it tends to do next.
 *  - POSES    the body positions (CSS custom properties consumed by CatRig + globals.css). Several states share a pose.
 *  - pickNext() chooses the next state from the current state's `next` weights, then adjusts them:
 *       * never the same state twice in a row
 *       * states seen in the last 3 picks are down-weighted (x0.25), the very last one even more
 *       * a pair (A -> B) that already happened in the last 6 transitions is down-weighted (x0.2)
 *       * context: a nearby cursor makes watchingCursor likelier; mobile / reduced motion never walk
 *  - makeRng() is a seeded PRNG. CatCompanion seeds it from crypto per visit, so no two visits play out alike.
 *
 * Always-on micro-motions (blinks, ear flicks, tail-tip twitches, breathing) are NOT states: they run on their own
 * randomised timers in CatCompanion and layer on top of whatever state is active (their ranges are in MICRO below).
 *
 * To tweak: change `duration` ranges, the `next` weight tables, WALK, MICRO or SCROLL_WAKE_CHANCE. Weights are
 * relative, they do not need to sum to anything.
 */

export type CatState =
  | "sleeping" | "loafing" | "sitting" | "grooming" | "licking" | "stretching" | "yawning" | "slowBlinking"
  | "lookingAround" | "watchingCursor" | "tailSwish" | "earTwitch" | "kneading" | "walking" | "batting";

export type PoseName = "sit" | "loaf" | "sleep" | "stand" | "stretch" | "yawn" | "groom" | "lick" | "knead" | "bat";

type Weights = Partial<Record<CatState, number>>;

export type StateDef = {
  pose: PoseName;
  /** seconds [min, max]; walking ignores this and lasts as long as the walk takes */
  duration: [number, number];
  /** relative likelihood of each follow-up state */
  next: Weights;
};

export const STATES: Record<CatState, StateDef> = {
  sleeping:       { pose: "sleep",   duration: [20, 90], next: { yawning: 6, stretching: 1.5, loafing: 2 } },
  loafing:        { pose: "loaf",    duration: [10, 40], next: { sleeping: 4, kneading: 2, lookingAround: 2, slowBlinking: 2, sitting: 2, earTwitch: 1.5, watchingCursor: 1.5 } },
  sitting:        { pose: "sit",     duration: [8, 25],  next: { grooming: 3, lookingAround: 3, tailSwish: 2, loafing: 2.5, watchingCursor: 2, slowBlinking: 1.5, licking: 1.5, batting: 1.2, walking: 1.5, yawning: 1 } },
  grooming:       { pose: "groom",   duration: [4, 12],  next: { licking: 3, sitting: 3, loafing: 1.5, yawning: 1 } },
  licking:        { pose: "lick",    duration: [4, 9],   next: { grooming: 2.5, sitting: 3, loafing: 2 } },
  stretching:     { pose: "stretch", duration: [3, 5],   next: { sitting: 4, loafing: 3, grooming: 2, walking: 3 } },
  yawning:        { pose: "yawn",    duration: [2, 3.5], next: { stretching: 8, sitting: 2, loafing: 1 } },
  slowBlinking:   { pose: "sit",     duration: [2, 3],   next: { sitting: 2, loafing: 2, sleeping: 2, lookingAround: 1.5 } },
  lookingAround:  { pose: "sit",     duration: [4, 8],   next: { sitting: 2, tailSwish: 2, walking: 2, grooming: 1.5, watchingCursor: 1.5, batting: 1 } },
  watchingCursor: { pose: "sit",     duration: [5, 12],  next: { slowBlinking: 3, sitting: 2, loafing: 2, lookingAround: 1.5, batting: 1 } },
  tailSwish:      { pose: "sit",     duration: [3, 6],   next: { sitting: 2.5, grooming: 2, lookingAround: 2, loafing: 1.5 } },
  earTwitch:      { pose: "loaf",    duration: [2, 4],   next: { loafing: 2, sleeping: 3, slowBlinking: 2, kneading: 1 } },
  kneading:       { pose: "knead",   duration: [6, 14],  next: { loafing: 3, sleeping: 5, slowBlinking: 1.5 } },
  walking:        { pose: "stand",   duration: [5, 9],   next: { sitting: 4, loafing: 3, sleeping: 2, stretching: 1, lookingAround: 2 } },
  batting:        { pose: "bat",     duration: [3, 6],   next: { sitting: 3, grooming: 1.5, lookingAround: 2, tailSwish: 1.5 } },
};

/** CSS custom properties for each pose; anything omitted falls back to the neutral value in DEFAULT_POSE */
export const DEFAULT_POSE: Record<string, string> = {
  "--lieO": "1", "--sitO": "0", "--standO": "0", "--by": "0px", "--br": "0deg", "--legO": "0", "--tuckO": "0",
  "--hx": "0px", "--hy": "0px", "--hr": "0deg", "--nfl": "0deg", "--ffl": "0deg", "--sfl": "0deg",
  "--closed": "0", "--jaw": "0px", "--tailA": "0deg", "--tailB": "0deg", "--earN": "0deg", "--earF": "0deg",
  "--breath": "3.4s", "--mote": "0", "--mouthO": "0", "--bob": "0px", "--bobr": "0deg",
};

export const POSES: Record<PoseName, Record<string, string>> = {
  sit:     { "--lieO": "0", "--sitO": "1" },
  loaf:    { "--tuckO": "1", "--hy": "8px" },
  sleep:   { "--tuckO": "1", "--hx": "-30px", "--hy": "26px", "--hr": "38deg", "--closed": "1", "--earN": "-24deg", "--earF": "-24deg", "--tailA": "34deg", "--breath": "4.8s" },
  stand:   { "--lieO": "0", "--standO": "1" },
  stretch: { "--by": "-12px", "--br": "9deg", "--legO": "1", "--nfl": "-74deg", "--ffl": "-80deg", "--hx": "16px", "--hy": "34px", "--hr": "24deg", "--tailA": "-34deg", "--closed": ".7" },
  yawn:    { "--lieO": "0", "--sitO": "1", "--hr": "-16deg", "--jaw": "7px", "--mouthO": "1", "--closed": "1", "--earN": "-14deg", "--earF": "-14deg" },
  groom:   { "--lieO": "0", "--sitO": "1", "--hr": "14deg", "--hx": "4px", "--hy": "6px", "--sfl": "-148deg", "--closed": ".65" },
  lick:    { "--lieO": "0", "--sitO": "1", "--hr": "26deg", "--hx": "6px", "--hy": "14px", "--closed": ".8" },
  knead:   { "--tuckO": "1", "--hy": "4px", "--closed": ".55" },
  bat:     { "--lieO": "0", "--sitO": "1", "--hr": "-10deg", "--mote": "1" },
};

/** where the cat can perch: x is a fraction of the viewport width, lift is px above the bottom edge */
export type PerchName = "ledge" | "beanbag" | "books" | "rug";
export const PERCHES: Record<PerchName, { x: number; lift: number }> = {
  ledge:   { x: 0.9,  lift: 10 },
  beanbag: { x: 0.1,  lift: 18 },
  books:   { x: 0.64, lift: 33 },
  rug:     { x: 0.36, lift: 4 },
};

/** walking speed, in px of travel per second */
export const WALK = { pxPerSecond: 90 };
/** chance that reaching a new screenful of the page wakes the cat and sends it to a new perch */
export const SCROLL_WAKE_CHANCE = 0.45;
/** randomised always-on micro-motions: [min, max] seconds between occurrences */
export const MICRO = {
  blink: [2, 8] as [number, number], doubleBlinkChance: 0.22,
  earFlick: [4, 12] as [number, number],
  tailTip: [5, 14] as [number, number],
};
/** interaction tuning */
export const INTERACT = {
  trackRadius: 460,        // px: cursor closer than this is tracked by eyes and head
  fastCursor: 2.2,         // px per ms: faster movement perks the ears
  hoverBlinkMs: 1800,      // hovering this long earns a slow blink
  clickPurr: 0.35, clickGlance: 0.25, // remaining clicks do nothing, like a real cat
};

/* ───────────────────────────── machinery ───────────────────────────── */

export type Rng = () => number;
/** mulberry32 */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const between = (rng: Rng, [lo, hi]: [number, number]) => lo + rng() * (hi - lo);

export type Ctx = { cursorNear: boolean; canWalk: boolean; /** if set, the only states this cat may choose (gives each cat its own temperament) */ allow?: CatState[] };

export function pickNext(current: CatState, history: CatState[], rng: Rng, ctx: Ctx): CatState {
  const weights: Weights = { ...STATES[current].next };
  const recent = history.slice(-3);
  const last = history[history.length - 1];
  const pairs = new Set<string>();
  for (let i = Math.max(1, history.length - 6); i < history.length; i++) pairs.add(`${history[i - 1]}>${history[i]}`);

  let total = 0;
  const entries = (Object.keys(weights) as CatState[]).map((s) => {
    let w = weights[s] ?? 0;
    if (s === current) w = 0;
    if (s === last) w *= 0.1;
    else if (recent.includes(s)) w *= 0.25;
    if (pairs.has(`${current}>${s}`)) w *= 0.2;
    if (s === "walking" && !ctx.canWalk) w = 0;
    if (ctx.allow && !ctx.allow.includes(s)) w = 0;
    if (s === "watchingCursor") w *= ctx.cursorNear ? 3 : 0.2;
    total += w;
    return [s, w] as const;
  });
  if (total <= 0) return ctx.allow?.find((s) => s !== current) ?? (current === "sitting" ? "loafing" : "sitting");
  let roll = rng() * total;
  for (const [s, w] of entries) { roll -= w; if (roll <= 0 && w > 0) return s; }
  return entries[entries.length - 1][0];
}
