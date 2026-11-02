"use client";
import { useEffect } from "react";
import { frame, uri } from "./faviconFrames";

/**
 * Animates the tab icon by swapping SVG frames: every few seconds the cat's tail swishes, and now and then a sparkle
 * twinkles. app/icon.svg is the static icon (and the fallback); this only swaps its href, looking the <link> up each
 * time so it keeps working after Next replaces the head tags on navigation. Does nothing under prefers-reduced-motion.
 */
const links = () => Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"][type="image/svg+xml"], link[rel~="icon"]:not([sizes])'));
const show = (svg: string) => { const u = uri(svg); links().forEach((l) => { if (l.href !== u) l.href = u; }); };

const SWISH: [number, number][] = [[1, 0], [2, 0], [1, 0], [2, 0], [1, 0], [0, 0]];
const GLINT: [number, number][] = [[0, 2.2], [0, 4.2], [0, 5.4], [0, 4], [0, 2]];

export default function AnimatedFavicon() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true, t = 0;
    const play = (seq: [number, number][], ms: number, done: () => void) => {
      let i = 0;
      const step = () => {
        if (!alive) return;
        if (i >= seq.length) { show(frame(0, 0)); done(); return; }
        show(frame(...seq[i++]));
        t = window.setTimeout(step, ms);
      };
      step();
    };
    let n = 0;
    const loop = () => {
      if (!alive) return;
      t = window.setTimeout(() => {
        if (document.hidden) { loop(); return; }
        n++;
        play(n % 3 === 0 ? GLINT : SWISH, n % 3 === 0 ? 220 : 260, loop);
      }, 4500 + Math.random() * 3500);
    };
    loop();
    return () => { alive = false; clearTimeout(t); };
  }, []);
  return null;
}
