"use client";
import { useEffect, useRef, useState } from "react";

/** Edison bulbs on a string across the top of every page. Each flickers slowly and a little differently (never in sync). */
export function Bulbs() {
  const [bulbs, setBulbs] = useState<{ x: number; drop: number; dur: number; delay: number; amp: number; hide: boolean }[]>([]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBulbs([{ x: 34, drop: 56, dur: 0, delay: 0, amp: 0, hide: false }, { x: 46, drop: 74, dur: 0, delay: 0, amp: 0, hide: false }, { x: 58, drop: 52, dur: 0, delay: 0, amp: 0, hide: true }]);
      return;
    }
    const r = (a: number, b: number) => a + Math.random() * (b - a);
    setBulbs([34, 43, 52, 61].map((x, i) => ({ x: x + r(-1.5, 1.5), drop: r(48, 82), dur: r(4.5, 9.5), delay: -r(0, 9), amp: r(0.02, 0.04), hide: i === 3 })));
  }, []);
  return (
    <div aria-hidden className="bulbs">
      <svg className="bulb-string" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M26 0 Q44 7 70 0" fill="none" stroke="rgba(184,166,138,.45)" strokeWidth=".25" vectorEffect="non-scaling-stroke" /></svg>
      {bulbs.map((b, i) => (
        <div key={i} className={`bulb ${b.hide ? "hidden sm:block" : ""}`} style={{ left: `${b.x}%`, ["--drop" as string]: `${b.drop}px`, ["--dur" as string]: `${b.dur}s`, ["--delay" as string]: `${b.delay}s`, ["--amp" as string]: b.amp, animationPlayState: b.dur ? "running" : "paused" }}>
          <span className="bulb-cord" />
          <span className="bulb-glow" />
          <svg className="bulb-glass" viewBox="0 0 24 34"><path d="M9 0h6v7H9z" fill="#6b4a2a" /><path d="M12 7C5 7 2 13 4 19c1 3 3 4 3 8h10c0-4 2-5 3-8 2-6-1-12-8-12z" fill="rgba(255,216,154,.22)" stroke="rgba(255,216,154,.55)" strokeWidth=".8" /><path d="M9 26c0-5 2-8 3-8s3 3 3 8" fill="none" stroke="#ffd89a" strokeWidth="1" /></svg>
        </div>
      ))}
    </div>
  );
}

/** Slow dust motes drifting up through the glow. Canvas, ~45 particles (18 on phones), paused when the tab is hidden. */
export function Dust() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = ref.current!, g = c.getContext("2d")!;
    const small = matchMedia("(max-width: 640px)").matches;
    const n = small ? 18 : 45;
    let w = 0, h = 0, raf = 0, t = 0;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); w = c.clientWidth; h = c.clientHeight; c.width = w * d; c.height = h * d; g.setTransform(d, 0, 0, d, 0, 0); };
    size();
    // motes gather around the light sources (fractions of the viewport)
    const lights = [[0.44, 0.05], [0.12, 0.9], [0.88, 0.75]];
    const spawn = (anywhere: boolean) => {
      const [lx, ly] = lights[Math.floor(Math.random() * lights.length)];
      return { x: (lx + (Math.random() - 0.5) * 0.5) * w, y: anywhere ? Math.random() * h : h + 10, r: 0.6 + Math.random() * 1.4, a: 0.1 + Math.random() * 0.25, s: 4 + Math.random() * 9, ph: Math.random() * 6.28 };
    };
    const ps = Array.from({ length: n }, () => spawn(true));
    let prev = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now; t += dt;
      g.clearRect(0, 0, w, h);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.y -= p.s * dt; p.x += Math.sin(t * 0.4 + p.ph) * 6 * dt;
        if (p.y < -10) ps[i] = spawn(false);
        const fade = Math.min(1, p.y / 80, (h - p.y) / 80);
        g.beginPath(); g.fillStyle = `rgba(255,216,154,${(p.a * Math.max(0, fade)).toFixed(3)})`; g.arc(p.x, p.y, p.r, 0, 6.283); g.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => { cancelAnimationFrame(raf); prev = performance.now(); raf = requestAnimationFrame(frame); };
    const vis = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener("visibilitychange", vis); addEventListener("resize", size);
    start();
    return () => { cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", vis); removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} aria-hidden className="dust" />;
}

/** thin ornamental divider */
export function Flourish({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flourish ${className}`}>
      <svg viewBox="0 0 320 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><path d="M0 12h118M202 12h118" opacity=".5" /><path d="M118 12c10-9 16 5 26-2 6-4 8-8 16-8s10 4 16 8c10 7 16-7 26 2" /><circle cx="160" cy="12" r="2.4" fill="currentColor" /><path d="M146 18l14 5 14-5" opacity=".6" /></svg>
    </div>
  );
}
