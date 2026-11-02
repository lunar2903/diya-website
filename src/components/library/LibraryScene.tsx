"use client";
import { useEffect, useMemo, useRef } from "react";
import { Architecture, FarShelves, SCONCES, StainedWindow } from "./scene";

/**
 * A dim, layered library behind every page: far shelves (blurred), a stained-glass window with light shafts,
 * architecture and furniture in front. Everything is slow, randomised and out of sync:
 *  - dust motes drift inside the light shafts (canvas)
 *  - candle flames flicker and their glow pulses; shafts breathe like clouds passing the window
 *  - layers parallax on scroll (different speeds) and nudge 2-6px with the mouse
 *  - rare events every 20-60s: a far book slides out and back, a page drifts down, a candle gutters
 * Under prefers-reduced-motion it is a still picture; it pauses entirely when the tab is hidden.
 * Tuning knobs are in TUNE below; the look (opacities, blur, darkness) is in globals.css under "library scene".
 */
const TUNE = {
  parallaxScroll: [14, 36, 70], // px each layer travels over a full page scroll (far -> near)
  parallaxMouse: [2, 4, 6],     // px each layer follows the mouse
  events: [20, 60],             // seconds between rare ambient events
  motes: [34, 14],              // desktop, phone
};

/** light shafts as [top-left, top-right, bottom-right, bottom-left] in % of the stage */
const BEAMS = [
  [[69, 18], [77, 18], [50, 100], [27, 100]],
  [[72, 34], [82, 34], [72, 100], [47, 100]],
  [[68, 52], [74, 52], [26, 100], [9, 100]],
] as const;

export default function LibraryScene() {
  const root = useRef<HTMLDivElement>(null);
  const motes = useRef<HTMLCanvasElement>(null);
  const timing = useMemo(() => BEAMS.map(() => ({ dur: 11 + Math.random() * 14, delay: -Math.random() * 20, lo: 0.35 + Math.random() * 0.15, hi: 0.8 + Math.random() * 0.2 })), []);

  useEffect(() => {
    const el = root.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layers = [...el.querySelectorAll<HTMLElement>(".lib-layer")];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    // flames and glows never flicker in step
    el.querySelectorAll<HTMLElement | SVGElement>(".lib-flame, .lib-glow").forEach((n) => {
      n.style.animationDuration = `${rnd(1.3, 3.4).toFixed(2)}s`;
      n.style.animationDelay = `${(-rnd(0, 4)).toFixed(2)}s`;
    });
    if (reduce) { el.classList.add("lib-still"); return; }

    let alive = true, raf = 0, hidden = document.hidden;
    const timers: number[] = [];

    /* ───── parallax: scroll depth + mouse, eased ───── */
    let tx = 0, ty = 0, mx = 0, my = 0, prog = 0;
    const readScroll = () => { const max = Math.max(1, document.documentElement.scrollHeight - innerHeight); prog = Math.min(1, Math.max(0, scrollY / max)); };
    const step = () => {
      raf = 0;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      layers.forEach((l, i) => {
        const y = -prog * TUNE.parallaxScroll[i] - my * TUNE.parallaxMouse[i], x = -mx * TUNE.parallaxMouse[i];
        l.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      });
      if (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) raf = requestAnimationFrame(step);
    };
    const kick = () => { if (!raf && !hidden) raf = requestAnimationFrame(step); };
    const onMove = (e: PointerEvent) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; kick(); };
    const onScroll = () => { readScroll(); kick(); };
    addEventListener("pointermove", onMove, { passive: true }); addEventListener("scroll", onScroll, { passive: true });
    readScroll(); kick();

    /* ───── dust motes drifting inside the shafts ───── */
    const cv = motes.current!, g = cv.getContext("2d")!;
    const small = matchMedia("(max-width: 640px)").matches;
    const n = TUNE.motes[small ? 1 : 0];
    let cw = 0, ch = 0, t = 0, last = performance.now(), mraf = 0, flip = false;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); cw = cv.clientWidth; ch = cv.clientHeight; cv.width = cw * d; cv.height = ch * d; g.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener("resize", size);
    const ms = Array.from({ length: n }, () => ({ b: Math.floor(Math.random() * BEAMS.length), s: Math.random(), t: Math.random(), vs: rnd(-0.004, 0.004), vt: rnd(-0.006, 0.01), r: rnd(0.7, 1.8), a: rnd(0.25, 0.7), ph: rnd(0, 6.28), sp: rnd(0.3, 0.9) }));
    const at = (b: number, s: number, tt: number): [number, number] => {
      const q = BEAMS[b], lerp = (a: number, c: number, k: number) => a + (c - a) * k;
      const lx = lerp(q[0][0], q[3][0], tt), rx = lerp(q[1][0], q[2][0], tt), y = lerp(q[0][1], q[3][1], tt);
      return [(lerp(lx, rx, s) / 100) * cw, (y / 100) * ch];
    };
    const frame = (now: number) => {
      mraf = requestAnimationFrame(frame);
      flip = !flip; if (flip) return; // ~30fps is plenty for slow motes
      const dt = Math.min(0.1, (now - last) / 1000); last = now; t += dt;
      g.clearRect(0, 0, cw, ch);
      for (const m of ms) {
        m.s += (m.vs + Math.sin(t * m.sp + m.ph) * 0.003) * dt * 20; m.t += (m.vt + Math.cos(t * m.sp * 0.7 + m.ph) * 0.004) * dt * 12;
        if (m.s < 0 || m.s > 1) { m.vs = -m.vs; m.s = Math.min(1, Math.max(0, m.s)); }
        if (m.t > 1) { m.t = 0; m.s = Math.random(); m.b = Math.floor(Math.random() * BEAMS.length); }
        if (m.t < 0) m.t = 0.001;
        const [x, y] = at(m.b, m.s, m.t), edge = Math.min(1, m.t * 6, (1 - m.t) * 4), tw = 0.6 + 0.4 * Math.sin(t * 1.3 + m.ph);
        g.beginPath(); g.fillStyle = `rgba(255,228,170,${(m.a * edge * tw).toFixed(3)})`; g.arc(x, y, m.r, 0, 6.283); g.fill();
      }
    };
    const startMotes = () => { cancelAnimationFrame(mraf); last = performance.now(); mraf = requestAnimationFrame(frame); };
    startMotes();

    /* ───── rare ambient events ───── */
    const movers = [...el.querySelectorAll<SVGElement>(".lib-mover")];
    const flames = [...el.querySelectorAll<SVGElement>(".lib-flame")];
    const glows = [...el.querySelectorAll<HTMLElement>(".lib-glow")];
    const page = el.querySelector<HTMLElement>(".lib-page")!;
    const events = {
      book() { const b = movers[Math.floor(Math.random() * movers.length)]; if (!b) return; b.classList.add("lib-slide"); timers.push(window.setTimeout(() => b.classList.remove("lib-slide"), 5200)); },
      page() {
        page.style.left = `${rnd(36, 70)}%`; page.style.top = `${rnd(8, 20)}%`;
        const drift = rnd(-60, 60), fall = rnd(34, 52);
        page.animate([
          { opacity: 0, transform: "translate(0,0) rotate(-12deg)" },
          { opacity: 0.5, transform: `translate(${drift * 0.3}px, ${fall * 0.25}vh) rotate(18deg)`, offset: 0.2 },
          { opacity: 0.45, transform: `translate(${-drift * 0.2}px, ${fall * 0.6}vh) rotate(-22deg)`, offset: 0.6 },
          { opacity: 0, transform: `translate(${drift * 0.1}px, ${fall}vh) rotate(8deg)` },
        ], { duration: rnd(10000, 14000), easing: "ease-in-out" });
      },
      candle() { const i = Math.floor(Math.random() * flames.length); [flames[i], glows[i]].forEach((x) => { if (!x) return; x.classList.add("lib-gutter"); timers.push(window.setTimeout(() => x.classList.remove("lib-gutter"), 2800)); }); },
    };
    const names = Object.keys(events) as (keyof typeof events)[];
    let evTimer = 0;
    const schedule = () => { evTimer = window.setTimeout(() => { if (!alive || hidden) return; events[names[Math.floor(Math.random() * names.length)]](); schedule(); }, rnd(TUNE.events[0], TUNE.events[1]) * 1000); };
    schedule();
    const onEvent = (e: Event) => { const k = (e as CustomEvent<keyof typeof events>).detail; if (k in events) events[k](); }; // lets you trigger one on demand
    el.addEventListener("library:event", onEvent);

    /* ───── pause when the tab is hidden ───── */
    const onVis = () => {
      hidden = document.hidden; el.classList.toggle("lib-paused", hidden);
      if (hidden) { cancelAnimationFrame(raf); raf = 0; cancelAnimationFrame(mraf); clearTimeout(evTimer); } else { kick(); startMotes(); schedule(); }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false; cancelAnimationFrame(raf); cancelAnimationFrame(mraf); clearTimeout(evTimer); timers.forEach(clearTimeout);
      removeEventListener("pointermove", onMove); removeEventListener("scroll", onScroll); removeEventListener("resize", size);
      document.removeEventListener("visibilitychange", onVis); el.removeEventListener("library:event", onEvent);
    };
  }, []);

  return (
    <div ref={root} className="lib-scene" aria-hidden>
      <div className="lib-layer lib-l1"><div className="lib-stage"><FarShelves /></div></div>
      <div className="lib-layer lib-l2">
        <div className="lib-stage">
          <div className="lib-window"><StainedWindow /></div>
          {BEAMS.map((b, i) => (
            <div key={i} className="lib-beam" style={{ clipPath: `polygon(${b.map(([x, y]) => `${x}% ${y}%`).join(",")})`, ["--dur" as string]: `${timing[i].dur}s`, ["--delay" as string]: `${timing[i].delay}s`, ["--lo" as string]: timing[i].lo, ["--hi" as string]: timing[i].hi }} />
          ))}
          <canvas ref={motes} className="lib-motes" />
        </div>
      </div>
      <div className="lib-layer lib-l3">
        <div className="lib-stage">
          <Architecture />
          {SCONCES.map((s, i) => <div key={i} className="lib-glow" style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }} />)}
          <div className="lib-page" />
        </div>
      </div>
      <div className="lib-dark" />
    </div>
  );
}
