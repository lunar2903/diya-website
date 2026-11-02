"use client";
import { useEffect } from "react";

/**
 * Site-wide scroll audio: a video that was audible is muted when it leaves the viewport and gets its sound
 * back when it returns. Only `muted` is touched; playback, position and controls are left alone.
 * Videos that were already muted are never unmuted, and sound is only restored after the visitor has
 * interacted with the page (browsers otherwise pause a video that is unmuted without a gesture).
 */
export default function ScrollAudio() {
  useEffect(() => {
    const silenced = new WeakSet<HTMLVideoElement>(); // videos this feature muted
    const seen = new Set<HTMLVideoElement>();
    const canUnmute = () => (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive ?? true;

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.intersectionRatio >= 0.25) {
          if (silenced.has(v) && canUnmute()) { silenced.delete(v); v.muted = false; }
        } else if (!v.muted) {
          silenced.add(v);
          v.muted = true;
        }
      }
    }, { threshold: [0, 0.25] });

    const add = (n: Node) => {
      if (!(n instanceof Element)) return;
      const vids = n instanceof HTMLVideoElement ? [n] : Array.from(n.querySelectorAll("video"));
      for (const v of vids) if (!seen.has(v)) { seen.add(v); io.observe(v); }
    };
    const drop = (n: Node) => {
      if (!(n instanceof Element)) return;
      const vids = n instanceof HTMLVideoElement ? [n] : Array.from(n.querySelectorAll("video"));
      for (const v of vids) if (!v.isConnected) { seen.delete(v); io.unobserve(v); }
    };

    add(document.body);
    const mo = new MutationObserver((list) => {
      for (const m of list) { m.addedNodes.forEach(add); m.removedNodes.forEach(drop); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { mo.disconnect(); io.disconnect(); seen.clear(); };
  }, []);
  return null;
}
