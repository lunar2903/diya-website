"use client";
import { useEffect, useRef } from "react";
import CatActor from "./CatActor";
import { between, makeRng } from "./catMachine";
import type { Coat } from "./coats";

/**
 * A cat behind a little stack of books. Every so often it rises until its ears, then its whole head, show over the
 * top, watches for a while, and slips back down. The books are drawn in front of it, so nothing is ever clipped.
 */
export default function CatPeek({ coat = "cream", flip = false, className = "" }: { coat?: Coat; flip?: boolean; className?: string }) {
  const cat = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = cat.current;
    if (!el) return;
    const rng = makeRng(crypto.getRandomValues(new Uint32Array(1))[0]);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.style.setProperty("--rise", "0.7"); return; }
    let alive = true;
    let t = 0;
    const set = (v: number, ms: number) => { el.style.transitionDuration = `${ms}ms`; el.style.setProperty("--rise", String(v)); };
    const cycle = () => {
      if (!alive) return;
      if (document.hidden) { t = window.setTimeout(cycle, 4000); return; }
      const up = between(rng, [0.58, 0.72]); // how far it rises: ears only, then eyes
      set(up, between(rng, [2200, 3400]));
      t = window.setTimeout(() => {
        if (rng() < 0.5) set(Math.min(0.95, up + 0.2), 2600); // a little braver
        t = window.setTimeout(() => { set(0, between(rng, [1800, 2800])); t = window.setTimeout(cycle, between(rng, [9, 24]) * 1000); }, between(rng, [5, 11]) * 1000);
      }, between(rng, [3.5, 6]) * 1000);
    };
    t = window.setTimeout(cycle, between(rng, [2, 8]) * 1000);
    return () => { alive = false; clearTimeout(t); };
  }, []);
  return (
    <div className={`cat-peek ${className}`} aria-hidden>
      <div className="cat-peek-stage">
        <div ref={cat} className="cat-peek-cat">
          <CatActor coat={coat} flip={flip} start={["sitting"]} allow={["sitting", "slowBlinking", "lookingAround", "earTwitch", "watchingCursor"]} />
        </div>
        <div className="cat-peek-books"><i /><i /><i /></div>
      </div>
    </div>
  );
}
