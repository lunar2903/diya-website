"use client";
import { useEffect, useRef } from "react";
import CatRig from "./CatRig";
import { DEFAULT_POSE, POSES, WALK, between, makeRng } from "./catMachine";
import type { Coat } from "./coats";

/**
 * A cat that strolls slowly along a ledge (the top of the bookshelf). It fills the width of its parent, walks to a
 * random spot, settles into a random pose for a while (sitting, loafing, grooming, dozing), then wanders on.
 * It stays inside its own box, so it can never be cut off or sit on other content.
 */
const REST_POSES = [
  { pose: "sit", seconds: [6, 16], weight: 3 },
  { pose: "loaf", seconds: [8, 22], weight: 3 },
  { pose: "groom", seconds: [4, 9], weight: 2 },
  { pose: "sleep", seconds: [14, 34], weight: 1.5 },
] as const;

export default function CatPatrol({ coat = "cream", className = "" }: { coat?: Coat; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const fig = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const rig = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const b = box.current, f = fig.current, fc = face.current, el = rig.current;
    if (!b || !f || !fc || !el) return;
    const rng = makeRng(crypto.getRandomValues(new Uint32Array(1))[0]);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const apply = (name: keyof typeof POSES) => { const v = { ...DEFAULT_POSE, ...POSES[name] }; for (const k in v) el.style.setProperty(k, v[k]); };
    const room = () => Math.max(0, b.clientWidth - f.clientWidth);
    let x = rng() * room(), alive = true, paused = false, timer = 0;
    const place = (ms: number) => { f.style.transition = ms ? `transform ${ms}ms linear` : "none"; f.style.transform = `translateX(${x}px)`; };
    place(0);
    apply("sit");
    if (reduce) return;

    const blink = () => { el.style.setProperty("--blink", "1"); setTimeout(() => el.style.setProperty("--blink", "0"), 140); };
    const blinkTimer = window.setInterval(() => { if (!paused && rng() < 0.7) blink(); }, 3200);

    const rest = () => {
      const total = REST_POSES.reduce((a, r) => a + r.weight, 0);
      let roll = rng() * total, pick: (typeof REST_POSES)[number] = REST_POSES[0];
      for (const r of REST_POSES) { roll -= r.weight; if (roll <= 0) { pick = r; break; } }
      el.classList.remove("walking");
      apply(pick.pose);
      timer = window.setTimeout(walk, between(rng, [pick.seconds[0], pick.seconds[1]]) * 1000);
    };
    const walk = () => {
      if (!alive) return;
      if (paused) { timer = window.setTimeout(walk, 2000); return; }
      const max = room();
      let target = rng() * max;
      if (Math.abs(target - x) < max * 0.25) target = x < max / 2 ? Math.min(max, x + max * 0.4) : Math.max(0, x - max * 0.4);
      const dx = target - x;
      if (Math.abs(dx) < 24) { rest(); return; }
      fc.style.transform = `scaleX(${dx > 0 ? 1 : -1})`; // turn first
      timer = window.setTimeout(() => {
        apply("stand"); el.classList.add("walking");
        const ms = (Math.abs(dx) / (WALK.pxPerSecond * 0.7)) * 1000;
        x = target; place(ms);
        timer = window.setTimeout(rest, ms + 200);
      }, 500);
    };
    timer = window.setTimeout(walk, between(rng, [2, 7]) * 1000);

    const onResize = () => { x = Math.min(x, room()); place(0); };
    addEventListener("resize", onResize);
    const onVis = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; clearTimeout(timer); clearInterval(blinkTimer); removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  return (
    <div ref={box} className={`cat-patrol ${className}`} aria-hidden>
      <div ref={fig} className="cat-patrol-fig">
        <div ref={face} className="cat-patrol-face"><CatRig ref={rig} coat={coat} /></div>
      </div>
    </div>
  );
}
