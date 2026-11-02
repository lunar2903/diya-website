"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const overlayBtn = "absolute grid size-10 place-items-center bg-paper/75 text-ink border border-[var(--line)] backdrop-blur-sm transition-colors hover:border-ink";

/** Large wide-frame highlight: one audible autoplay attempt, muted fallback, sound-on control. */
export function HighlightVideo({ src, ratio = "9 / 16", rotate = false }: { src: string; ratio?: string; rotate?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || reducedMotion()) return;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {}); // blocked entirely: native controls remain
    });
  }, []);

  const soundOn = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    if (v.paused) v.play().catch(() => {});
  };

  const [playing, setPlaying] = useState(true);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };

  if (rotate) {
    // Portrait source turned 90° counter-clockwise into a landscape frame: the whole picture stays visible.
    // The frame is the source ratio flipped; the video is laid out portrait inside it, then rotated.
    const [rw, rh] = ratio.split("/").map(Number);
    return (
      <div className="relative mx-auto w-full" style={{ maxWidth: `min(100%, calc(80vh * ${rh} / ${rw}))` }}>
        <div className="relative w-full overflow-hidden bg-paper2 border border-[var(--line)]" style={{ aspectRatio: `${rh} / ${rw}`, containerType: "size" }}>
          <video
            ref={ref} className="absolute left-1/2 top-1/2 max-w-none cursor-pointer"
            style={{ width: "100cqh", height: "100cqw", transform: "translate(-50%, -50%) rotate(-90deg)" }}
            playsInline preload="metadata" aria-label="Campaign highlight video (rotated to landscape)" onClick={toggle}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          >
            <source src={`${src}#t=0.1`} type="video/mp4" />
          </video>
        </div>
        <button type="button" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className={`${overlayBtn} left-4 bottom-4`}>
          {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
        </button>
        {muted && (
          <button type="button" onClick={soundOn} className="absolute left-4 top-4 inline-flex items-center gap-2 bg-paper/80 border border-[var(--line)] px-4 py-2 text-sm text-ink backdrop-blur-sm hover:border-ink transition-colors">
            <VolumeX className="size-4" aria-hidden />Sound on
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* aspect-ratio reserves the frame before metadata loads, so nothing shifts */}
      <video
        ref={ref}
        className="w-full max-h-[80vh] bg-paper2 border border-[var(--line)]"
        style={{ aspectRatio: ratio }}
        controls playsInline preload="metadata" aria-label="Campaign highlight video"
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
      >
        <source src={`${src}#t=0.1`} type="video/mp4" />
        <a href={src}>Open the highlight video</a>
      </video>
      {muted && (
        <button type="button" onClick={soundOn} className="absolute left-4 top-4 inline-flex items-center gap-2 bg-paper/80 border border-[var(--line)] px-4 py-2 text-sm text-ink backdrop-blur-sm hover:border-ink transition-colors">
          <VolumeX className="size-4" aria-hidden />Sound on
        </button>
      )}
    </div>
  );
}

/** Portrait reel: first frame as preview, muted looped playback only while in view. */
export function Reel({ src, label, ratio = "9 / 16" }: { src: string; label: string; ratio?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const manual = useRef(false); // user paused: do not auto-restart

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!manual.current && !reducedMotion()) v.play().catch(() => {});
      } else v.pause();
    }, { threshold: 0.5 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { manual.current = false; v.play().catch(() => {}); } else { manual.current = true; v.pause(); }
  };

  return (
    <div className="group relative border border-[var(--line)] bg-paper2 transition-colors duration-300 hover:border-ochre/70">
      <video
        ref={ref} src={`${src}#t=0.1`} muted={muted} loop playsInline preload="metadata"
        className="block w-full object-cover" style={{ aspectRatio: ratio }} aria-label={label}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      />
      <button type="button" onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} ${label}`}
        className={`${overlayBtn} left-3 bottom-3 transition-opacity ${playing ? "opacity-0 group-hover:opacity-100 focus-visible:opacity-100" : ""}`}>
        {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
      </button>
      <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? `Unmute ${label}` : `Mute ${label}`} aria-pressed={!muted}
        className={`${overlayBtn} right-3 bottom-3`}>
        {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

/** Still image at its source aspect ratio, in the same bordered frame as Reel. */
export function Still({ src, label, ratio }: { src: string; label: string; ratio: string }) {
  return (
    <div className="border border-[var(--line)] bg-paper2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} loading="lazy" decoding="async" className="block w-full object-cover" style={{ aspectRatio: ratio }} />
    </div>
  );
}
