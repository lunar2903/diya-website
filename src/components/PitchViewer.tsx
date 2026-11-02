"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

const pad = (n: number, total: number) => String(n).padStart(Math.max(2, String(total).length), "0");

/** Custom slide viewer: renders one PDF page at a time (and warms the next) onto a canvas. */
export default function PitchViewer({ src, title }: { src: string; title: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const doc = useRef<PDFDocumentProxy | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ratio, setRatio] = useState(16 / 9);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState(true);
  const [full, setFull] = useState(false);
  const [size, setSize] = useState("");
  const touch = useRef<number | null>(null);

  useEffect(() => {
    let dead = false;
    let task: { destroy: () => Promise<void> } | undefined;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const t = pdfjs.getDocument({ url: src, disableAutoFetch: true });
        task = t;
        const d = await t.promise;
        if (dead) { d.destroy(); return; }
        doc.current = d;
        setTotal(d.numPages);
        setStatus("ready");
      } catch { if (!dead) setStatus("error"); }
    })();
    return () => { dead = true; doc.current = null; task?.destroy().catch(() => {}); };
  }, [src]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize(`${el.clientWidth}x${el.clientHeight}`));
    ro.observe(el);
    return () => ro.disconnect();
  }, [status]);

  useEffect(() => {
    const d = doc.current, c = canvas.current, el = stage.current;
    if (status !== "ready" || !d || !c || !el) return;
    let dead = false;
    let render: { cancel: () => void } | undefined;
    setBusy(true);
    (async () => {
      try {
        const pg = await d.getPage(page);
        if (dead) return;
        const base = pg.getViewport({ scale: 1 });
        setRatio(base.width / base.height);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const scale = Math.min(el.clientWidth / base.width, el.clientHeight / base.height) * dpr;
        const vp = pg.getViewport({ scale });
        const off = document.createElement("canvas");
        off.width = Math.floor(vp.width); off.height = Math.floor(vp.height);
        const r = pg.render({ canvasContext: off.getContext("2d")!, viewport: vp });
        render = r;
        await r.promise;
        if (dead) return;
        c.width = off.width; c.height = off.height;
        c.getContext("2d")!.drawImage(off, 0, 0);
        setBusy(false);
        if (page < d.numPages) d.getPage(page + 1).catch(() => {});
      } catch (e) {
        if ((e as Error)?.name !== "RenderingCancelledException" && !dead) setStatus("error");
      }
    })();
    return () => { dead = true; render?.cancel(); };
  }, [page, status, size, full]);

  const go = useCallback((n: number) => setPage(Math.min(Math.max(n, 1), total || 1)), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(page + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(page - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, page]);

  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === wrap.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrap.current?.requestFullscreen?.().catch(() => {});
  };

  if (status === "error") {
    return (
      <div className="border border-[var(--line)] bg-paper2 p-8 text-center">
        <p className="folio">Presentation unavailable</p>
        <a href={src} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block underline underline-offset-4">Open the PDF directly</a>
      </div>
    );
  }

  const btn = "inline-flex size-11 items-center justify-center border border-[var(--line)] text-ink transition-colors hover:bg-paper2 disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-[var(--candle)]";
  return (
    <div ref={wrap} role="region" aria-roledescription="presentation" aria-label={`${title} presentation`} className={`flex flex-col bg-paper ${full ? "h-screen p-4 sm:p-8" : ""}`}>
      <div
        ref={stage}
        className={`relative flex items-center justify-center overflow-hidden border border-[var(--line)] bg-pit ${full ? "flex-1 min-h-0" : "w-full"}`}
        style={full ? undefined : { aspectRatio: `${ratio}`, maxHeight: "80vh", marginInline: "auto" }}
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 50) go(page + (dx < 0 ? 1 : -1));
        }}
      >
        <canvas ref={canvas} aria-label={`Slide ${page} of ${total}`} className="block max-h-full max-w-full object-contain transition-opacity duration-300" style={{ opacity: busy ? 0.15 : 1 }} />
        {status === "loading" && <span className="folio absolute inset-0 grid place-items-center pointer-events-none">Opening the presentation…</span>}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" className={btn} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous slide"><ChevronLeft className="size-5" aria-hidden /></button>
          <button type="button" className={btn} onClick={() => go(page + 1)} disabled={page >= total} aria-label="Next slide"><ChevronRight className="size-5" aria-hidden /></button>
        </div>
        <p className="folio tabular-nums" aria-live="polite">{total ? `${pad(page, total)} / ${total}` : "— / —"}</p>
        <button type="button" className={btn} onClick={toggleFull} aria-label={full ? "Exit fullscreen" : "Enter fullscreen"}>{full ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}</button>
      </div>
    </div>
  );
}
