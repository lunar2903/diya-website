"use client";
import { useEffect, type RefObject } from "react";
import {
  DEFAULT_POSE, INTERACT, MICRO, PERCHES, POSES, SCROLL_WAKE_CHANCE, STATES, WALK,
  between, makeRng, pickNext, type CatState, type PerchName,
} from "./catMachine";

/**
 * The cat's behaviour as a hook, so any cat on the site can have the same brain (catMachine.ts holds the tuning).
 * Everything is written straight to CSS custom properties on the rig's <svg>: no React re-renders while it plays.
 *
 *  - `roam: true`  is the page-wide companion: it walks between perches (needs `wrap`, the fixed box it lives in).
 *  - `roam: false` is a cat that stays where it was put (the hero, the shelf): same states, no walking.
 *
 * It pauses when the tab is hidden or the cat is off-screen, and stays a calm loaf under prefers-reduced-motion.
 */
export type BrainOptions = {
  roam: boolean;
  wrap?: RefObject<HTMLElement | null>;
  onProp?: (p: PerchName | null) => void;
  /** which way an in-place cat faces (-1 = mirrored, so pupils and head tracking stay correct) */
  face?: 1 | -1;
  /** states it may begin in, e.g. ["sitting"] */
  start?: CatState[];
  /** 0 = dim corner (wide pupils), 1 = beside a lamp (narrow pupils, bright eye-glow) */
  light?: number;
  /** restricts which states the cat may pick, so each cat behaves differently */
  allow?: CatState[];
};

/** pupils widen in the dark and narrow beside a bulb; the eye-glow does the opposite */
const pupil = (light: number) => ({ "--pw": (1.1 - 0.55 * light).toFixed(2), "--glow": (0.25 + 0.45 * light).toFixed(2) });
/** the bulbs hang around x = 47% of the width, so a cat that is nearer the middle sits in more light */
const lightAt = (x: number) => Math.max(0, 1 - Math.abs(x - 0.47) * 1.7);

export function useCatBrain(rig: RefObject<SVGSVGElement | null>, opts: BrainOptions) {
  const { roam, wrap, onProp, start, allow } = opts;
  useEffect(() => {
    const el = rig.current, box = wrap?.current ?? null;
    if (!el || (roam && !box)) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = matchMedia("(max-width: 640px)").matches;
    const rng = makeRng(crypto.getRandomValues(new Uint32Array(1))[0]); // fresh seed every visit

    let extra: Record<string, string> = {};
    const apply = (name: string) => {
      const vars = { ...DEFAULT_POSE, ...POSES[name as keyof typeof POSES], ...extra };
      for (const k in vars) el.style.setProperty(k, vars[k]);
    };
    const set = (k: string, v: string) => el.style.setProperty(k, v);
    let baseLight = opts.light ?? 0.6;
    const setLight = (l: number) => { baseLight = l; const p = pupil(l); for (const k in p) set(k, p[k as keyof typeof p]); };
    const faceOf = () => (box ? Number(box.style.getPropertyValue("--face") || -1) : opts.face ?? 1);

    let perch: PerchName = "ledge";
    const placeAt = (p: PerchName) => {
      if (!box) return;
      box.style.setProperty("--perch-x", String(PERCHES[p].x));
      box.style.setProperty("--lift", `${PERCHES[p].lift}px`);
      box.style.setProperty("--face", PERCHES[p].x > 0.5 ? "-1" : "1");
      setLight(lightAt(PERCHES[p].x));
    };
    if (roam) placeAt(perch); else setLight(baseLight);

    if (reduce) { apply("sit"); return; } // a still sitting cat, breathing only (CSS)

    /* ───────── timers ───────── */
    let timer = 0, tick = 0, alive = true, paused = false;
    const micro: number[] = [];
    const later = (fn: () => void, ms: number) => window.setTimeout(() => alive && !paused && fn(), ms);
    const loop = (fn: () => void, range: [number, number]) => {
      const go = () => { micro.push(window.setTimeout(() => { if (!alive) return; if (!paused) fn(); go(); }, between(rng, range) * 1000)); };
      go();
    };

    /* ───────── state machine driver ───────── */
    let state: CatState = "sitting";
    const history: CatState[] = [];
    const queue: CatState[] = [];
    let cursorNear = false;
    const canWalk = roam && !mobile;

    const enter = (s: CatState) => {
      state = s;
      history.push(s); if (history.length > 10) history.shift();
      extra = {}; clearInterval(tick);
      el.classList.remove("walking", "kneading", "batting", "grooming");
      set("--dur", ".9s"); set("--lidDur", ".14s");
      apply(STATES[s].pose);
      set("--pw", String(pupil(baseLight)["--pw"]));
      let ms = between(rng, STATES[s].duration) * 1000;

      switch (s) {
        case "slowBlinking": set("--lidDur", ".9s"); later(() => set("--closed", "1"), 500); later(() => set("--closed", "0"), 1500); break;
        case "lookingAround": tick = window.setInterval(() => { set("--hr", `${(rng() * 30 - 14).toFixed(1)}deg`); set("--hx", `${(rng() * 10 - 4).toFixed(1)}px`); }, between(rng, [1400, 2800])); break;
        case "tailSwish": { let flip = 1; tick = window.setInterval(() => { flip = -flip; set("--tailB", `${flip * 22}deg`); }, 800); break; }
        case "earTwitch": { let on = false; tick = window.setInterval(() => { on = !on; set("--earN", on ? "-16deg" : "0deg"); set("--earF", on ? "8deg" : "0deg"); }, 700); break; }
        case "grooming": case "licking": { el.classList.add("grooming"); let up = false; tick = window.setInterval(() => { up = !up; set("--bob", up ? "3px" : "0px"); set("--bobr", up ? "-5deg" : "3deg"); }, 650); break; }
        case "kneading": el.classList.add("kneading"); break;
        case "batting": el.classList.add("batting"); set("--pw", String(Math.min(1.25, Number(pupil(baseLight)["--pw"]) + 0.3))); break; // excited: pupils blow wide
        case "walking": ms = startWalk(); break;
      }
      timer = window.setTimeout(advance, ms);
    };
    const advance = () => enter(queue.shift() ?? pickNext(state, history, rng, { cursorNear, canWalk, allow }));

    const startWalk = () => {
      if (!box) return 3000;
      const options = (Object.keys(PERCHES) as PerchName[]).filter((p) => p !== perch);
      const target = options[Math.floor(rng() * options.length)];
      const dx = (PERCHES[target].x - PERCHES[perch].x) * innerWidth;
      const travel = Math.max(1200, (Math.abs(dx) / WALK.pxPerSecond) * 1000);
      set("--bob", "0px");
      onProp?.(null);
      box.style.setProperty("--lift", "0px");
      box.style.setProperty("--face", dx > 0 ? "1" : "-1");
      el.classList.add("walking");
      box.style.setProperty("--walk-ms", `${travel}ms`);
      later(() => box.style.setProperty("--perch-x", String(PERCHES[target].x)), 450); // turn first, then go
      later(() => { perch = target; placeAt(target); box.style.setProperty("--walk-ms", "0ms"); onProp?.(target); }, travel + 500);
      return travel + 900;
    };

    /* ───────── always-on micro-motions (independent of state) ───────── */
    loop(() => {
      if (state === "sleeping") return;
      set("--blink", "1"); later(() => set("--blink", "0"), 140);
      if (rng() < MICRO.doubleBlinkChance) { later(() => set("--blink", "1"), 300); later(() => set("--blink", "0"), 440); }
    }, MICRO.blink);
    loop(() => {
      const near = rng() < 0.6, k = near ? "--earMicN" : "--earMicF";
      set(k, `${(-6 - rng() * 8).toFixed(1)}deg`); later(() => set(k, "0deg"), 170);
    }, MICRO.earFlick);
    loop(() => {
      set("--tailMic", "9deg"); later(() => set("--tailMic", "-6deg"), 220); later(() => set("--tailMic", "0deg"), 480);
    }, MICRO.tailTip);

    /* ───────── cursor: eyes and head follow it, a sudden dash perks the ears ───────── */
    let raf = 0, last = { x: 0, y: 0, t: 0 }, perkTimer = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const speed = last.t ? Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(1, now - last.t) : 0;
      last = { x: e.clientX, y: e.clientY, t: now };
      if (speed > INTERACT.fastCursor && state !== "sleeping") {
        set("--perk", "1"); clearTimeout(perkTimer); perkTimer = window.setTimeout(() => set("--perk", "0"), 1300);
      }
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const face = faceOf();
        const dx = e.clientX - (r.left + r.width * (face < 0 ? 0.25 : 0.75)), dy = e.clientY - (r.top + r.height * 0.55);
        cursorNear = Math.hypot(dx, dy) < INTERACT.trackRadius;
        if (!cursorNear || state === "sleeping" || state === "walking") { set("--px", "0px"); set("--py", "0px"); set("--htrk", "0deg"); return; }
        set("--px", `${Math.max(-3, Math.min(3, (dx / INTERACT.trackRadius) * 6 * face))}px`);
        set("--py", `${Math.max(-2, Math.min(3, (dy / INTERACT.trackRadius) * 5))}px`);
        set("--htrk", `${state === "watchingCursor" ? Math.max(-10, Math.min(12, (dy / INTERACT.trackRadius) * 20)) : 0}deg`);
      });
    };
    addEventListener("pointermove", onMove, { passive: true });

    /* ───────── touching the cat ───────── */
    let hover = 0;
    const slow = () => { set("--lidDur", ".9s"); set("--blink", "1"); later(() => { set("--blink", "0"); set("--lidDur", ".14s"); }, 1100); };
    const onEnter = () => { hover = window.setTimeout(slow, INTERACT.hoverBlinkMs); };
    const onLeave = () => clearTimeout(hover);
    const onClick = () => {
      const roll = rng();
      if (roll < INTERACT.clickPurr) { el.classList.add("purr"); later(() => el.classList.remove("purr"), 3200); }
      else if (roll < INTERACT.clickPurr + INTERACT.clickGlance) { slow(); extra = { "--hr": "-8deg" }; apply(STATES[state].pose); later(() => { extra = {}; apply(STATES[state].pose); }, 1800); }
    };
    // the roaming companion never captures the pointer (it would block links under it): hit-test the cat's box instead
    const INTERACTIVE = "a,button,input,textarea,select,label,summary,[role=button]";
    const inside = (e: MouseEvent) => { const r = el.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom && !(e.target as Element | null)?.closest?.(INTERACTIVE); };
    let over = false;
    const onWinMove = (e: PointerEvent) => { const i = inside(e); if (i && !over) onEnter(); else if (!i && over) onLeave(); over = i; };
    const onWinClick = (e: MouseEvent) => { if (inside(e)) onClick(); };
    if (roam) { addEventListener("pointermove", onWinMove, { passive: true }); addEventListener("click", onWinClick); }
    else { el.addEventListener("pointerenter", onEnter); el.addEventListener("pointerleave", onLeave); el.addEventListener("click", onClick); }

    /* ───────── keep clear of content: the companion fades out while it would sit on text, buttons or links ───────── */
    let coverTimer = 0;
    const checkCover = () => {
      if (!roam || !box) return;
      const r = el.getBoundingClientRect();
      const pts = [[0.3, 0.35], [0.7, 0.35], [0.5, 0.6], [0.3, 0.85], [0.7, 0.85]];
      const hit = pts.some(([px, py]) => document.elementsFromPoint(r.left + r.width * px, r.top + r.height * py).some((n) => !box.contains(n) && n.closest("main, footer") && n.matches("a,button,input,textarea,h1,h2,h3,h4,p,li,label,figcaption,dd,dt,summary")));
      box.dataset.cover = hit ? "1" : "0";
    };
    if (roam) { coverTimer = window.setInterval(checkCover, 700); addEventListener("scroll", checkCover, { passive: true }); addEventListener("resize", checkCover); setTimeout(checkCover, 400); }

    /* ───────── scroll awareness: a new screenful may wake the roaming cat and send it to another perch ───────── */
    let screenNo = Math.floor(scrollY / (innerHeight * 0.9));
    const onScroll = () => {
      const n = Math.floor(scrollY / (innerHeight * 0.9));
      if (n === screenNo) return;
      screenNo = n;
      if (!canWalk || state === "walking" || queue.length || rng() > SCROLL_WAKE_CHANCE) return;
      queue.push(...(state === "sleeping" ? ["yawning", "stretching", "walking"] as CatState[] : ["walking" as CatState]));
      clearTimeout(timer); advance();
    };
    if (roam) addEventListener("scroll", onScroll, { passive: true });

    /* ───────── pause when hidden or off-screen ───────── */
    const pause = () => { paused = true; clearTimeout(timer); clearInterval(tick); };
    const resume = () => { if (!paused) return; paused = false; timer = window.setTimeout(advance, 1500); };
    const onVis = () => (document.hidden ? pause() : resume());
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? resume() : pause()));
    io.observe(box ?? el);

    const startRoll = rng();
    const first = start && start.length ? start[Math.floor(rng() * start.length)] : startRoll < 0.3 ? "sleeping" : startRoll < 0.6 ? "loafing" : "sitting";
    enter(first);

    return () => {
      alive = false; pause(); micro.forEach(clearTimeout); cancelAnimationFrame(raf); clearTimeout(hover); clearTimeout(perkTimer);
      removeEventListener("pointermove", onMove); removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis); io.disconnect();
      el.removeEventListener("pointerenter", onEnter); el.removeEventListener("pointerleave", onLeave); el.removeEventListener("click", onClick);
      removeEventListener("pointermove", onWinMove); removeEventListener("click", onWinClick);
      clearInterval(coverTimer); removeEventListener("scroll", checkCover); removeEventListener("resize", checkCover);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
