"use client";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Photo = { src: string; alt: string };

/** Instagram-style post: one slide in view, drag/swipe or arrows to move, no autoplay. */
export default function PhotoCarousel({ photos, label, ratio = "1440 / 1920" }: { photos: Photo[]; label: string; ratio?: string }) {
  const [i, setI] = useState(0);
  const [dx, setDx] = useState(0); // live drag offset in px
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const last = photos.length - 1;
  const go = (n: number) => setI(Math.min(last, Math.max(0, n)));

  // Landscape posts may use the wider frame; portrait posts keep a narrower one.
  const [rw, rh] = ratio.split("/").map(Number);
  const r = rw / rh;
  const maxWidth = r > 1.2 ? "min(100%, 40rem)" : r >= 0.95 ? "min(100%, 32rem)" : "min(100%, 26rem)";

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, id: e.pointerId };
    setDragging(true);
  };
  const onMove = (e: PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    if (!e.currentTarget.hasPointerCapture(e.pointerId) && Math.abs(e.clientX - drag.current.x) > 6) e.currentTarget.setPointerCapture(e.pointerId);
    let d = e.clientX - drag.current.x;
    if ((i === 0 && d > 0) || (i === last && d < 0)) d /= 3; // resist at the ends
    setDx(d);
  };
  const onUp = (e: PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const w = frame.current?.clientWidth ?? 1;
    const moved = e.clientX - drag.current.x;
    drag.current = null;
    setDragging(false);
    setDx(0);
    if (Math.abs(moved) > Math.min(60, w * 0.15)) go(i + (moved < 0 ? 1 : -1));
  };

  const btn = "grid size-11 place-items-center border border-[var(--line)] bg-paper/80 text-ink transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-[var(--line)]";

  return (
    <div role="group" aria-roledescription="carousel" aria-label={label} onKeyDown={onKey}>
      <div
        ref={frame}
        tabIndex={0}
        aria-label={`${label}, use left and right arrow keys to browse`}
        className="relative mx-auto overflow-hidden bg-paper select-none cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ maxWidth, aspectRatio: ratio }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      >
        <div
          className="flex h-full"
          style={{ transform: `translateX(calc(${-i * 100}% + ${dx}px))`, transition: dragging ? "none" : "transform 300ms cubic-bezier(0.22, 0.8, 0.28, 1)" }}
        >
          {photos.map((p, k) => (
            <div key={p.src} className="h-full w-full shrink-0" role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${photos.length}`} aria-hidden={k !== i}>
              {/* only the current and neighbouring slides are mounted, so long posts do not download everything */}
              {Math.abs(k - i) <= 1 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.src} alt={p.alt} decoding="async" draggable={false} className="block size-full object-contain pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-3 flex items-center justify-between" style={{ maxWidth }}>
        <button type="button" className={btn} onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous photo"><ChevronLeft className="size-5" aria-hidden /></button>
        <p className="folio" role="status" aria-live="polite" aria-atomic="true">{i + 1} / {photos.length}</p>
        <button type="button" className={btn} onClick={() => go(i + 1)} disabled={i === last} aria-label="Next photo"><ChevronRight className="size-5" aria-hidden /></button>
      </div>
    </div>
  );
}
