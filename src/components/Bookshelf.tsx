"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type MouseEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LayoutGrid, Library, Search, X } from "lucide-react";
import { categories, projects as allProjects, type Category, type Project } from "@/data/projects";

const projects = allProjects.filter((p) => !p.hidden);
import { Cover } from "./Art";
import LeatherSpine, { spineVariation } from "./LeatherSpine";
import { site } from "@/data/site";
import Cat from "./Cat";

type Filter = Category;
const href = (p: Project) => p.route ?? `/projects/${p.slug}`;
const ease = [0.22, 0.8, 0.28, 1] as const;
const REST = 58; // resting Y rotation (deg)

function Book({ p, i, hovered, opening, onHover, onOpen, reduce }: {
  p: Project; i: number; hovered: number | null; opening: string | null; reduce: boolean | null;
  onHover: (i: number | null) => void; onOpen: (e: MouseEvent, p: Project) => void;
}) {
  const v = spineVariation(p.slug);
  const { w } = p.size;
  const h = Math.round(p.size.h * v.height), t = Math.round(p.size.t * v.thick); // heights vary +-8%, widths a little too
  const isHover = hovered === i;
  const isOpening = opening === p.slug;
  const visualW = Math.round(t * 0.85 + w * 0.53);
  const shift = hovered === null || isHover ? 0 : i < hovered ? -12 : 12;
  const state = isOpening ? "open" : isHover ? "hover" : "rest";
  const flat = !!reduce;
  const order = projects.indexOf(p); // the book's place on the whole shelf: neighbours never share leather or ornaments

  return (
    <motion.li
      className="relative shrink-0 snap-center"
      style={{ width: visualW, height: h, zIndex: isHover || isOpening ? 10 : 1, perspective: 1000 }}
      animate={{ x: shift, opacity: opening && !isOpening ? 0.35 : 1 }}
      transition={{ duration: 0.22, ease }}
    >
      <Link
        href={href(p)}
        onClick={(e) => onOpen(e, p)}
        onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(i)} onBlur={() => onHover(null)}
        aria-label={`${p.title}, ${p.category}${p.year ? `, ${p.year}` : ""}. Open project`}
        className="group absolute inset-0 block rounded-sm"
      >
        <motion.div
          className="book3d absolute"
          style={{ width: w, height: h, left: t * 0.43, transformOrigin: "0% 50%" }}
          initial={false}
          animate={state}
          variants={{
            rest: { rotateY: flat ? 0 : REST, rotateZ: v.tilt, z: v.pull, y: 0, scale: 1 },
            hover: { rotateY: flat ? 0 : 44, rotateZ: v.tilt * 0.3, z: v.pull + 12, y: -6, scale: 1 }, // slides out ~12px
            open: { rotateY: flat ? 0 : 6, rotateZ: 0, z: 0, y: -18, scale: 1.12, x: 20 },
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: isOpening ? 0.55 : 0.24, ease }}
        >
          {/* spine: a gilt-tooled leather binding, see LeatherSpine.tsx */}
          <div className="spine-face overflow-hidden" style={{ width: t, height: h, left: -t / 2, background: "#18130f", transform: "rotateY(-90deg)" }}>
            <LeatherSpine seed={p.slug} index={order} title={p.spineTitle ?? p.title} author={site.name} w={t} h={h} />
          </div>
          {/* page block */}
          <div style={{ width: w - 4, height: h - 6, top: 3, left: 2, transform: `translateZ(${t / 2 - 3}px)`, background: "repeating-linear-gradient(90deg,#F1E7DD,#F1E7DD 2px,#EFD7CC 3px)" }} />
          {/* back cover */}
          <div style={{ width: w, height: h, background: p.coverColor, transform: `translateZ(${-t / 2}px)` }} />
          {/* inside page, revealed when the cover swings open */}
          <div className="flex items-center justify-center" style={{ width: w, height: h, transform: `translateZ(${t / 2 - 1}px)`, background: "var(--paper)" }}>
            <div className="w-1/2 opacity-80"><Cat variant="sitting" lite /></div>
          </div>
          {/* front cover (hinged on the spine edge) */}
          <motion.div
            style={{ width: w, height: h, transformOrigin: "0% 50%", z: t / 2, boxShadow: "6px 12px 24px -8px rgba(63,48,41,.45)" }}
            initial={false}
            animate={{ rotateY: isOpening && !flat ? -155 : 0 }}
            transition={{ duration: 0.55, ease, delay: isOpening ? 0.12 : 0 }}
          >
            <Cover p={p} />
            <span className="absolute inset-y-0 left-0 w-3" style={{ background: "linear-gradient(90deg,rgba(0,0,0,.22),transparent)" }} />
          </motion.div>
        </motion.div>
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-14 w-44 text-center text-xs leading-tight opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="display text-lg block">{p.title}</span>
          <span className="folio">{p.category}{p.year ? ` · ${p.year}` : ""}</span>
        </span>
      </Link>
    </motion.li>
  );
}

export default function Bookshelf() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>(categories[0]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"shelf" | "grid">("shelf");
  const [hovered, setHovered] = useState<number | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const busy = useRef(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => p.category === filter && (!q || p.title.toLowerCase().includes(q)));
  }, [filter, query]);

  const open = (e: MouseEvent, p: Project) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // let the browser handle new-tab clicks
    e.preventDefault();
    if (busy.current) return;
    if (reduce) { router.push(href(p)); return; }
    busy.current = true;
    setOpening(p.slug);
    window.setTimeout(() => router.push(href(p)), 620);
  };
  const reset = () => setQuery("");
  const pill = (on: boolean) => `px-4 py-2 text-sm border transition-colors duration-200 ${on ? "bg-ink text-paper border-ink" : "border-[var(--line)] hover:border-ink"}`;

  return (
    <div>
      <div className="wrap grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)} className={pill(filter === c)}>{c}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block">
            <span className="sr-only">Search project titles</span>
            <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles"
              className="w-full sm:w-56 border border-[var(--line)] bg-transparent py-2 pl-9 pr-3 text-sm placeholder:text-muted focus:border-ink outline-none" />
          </label>
          <div role="group" aria-label="View" className="flex">
            <button type="button" aria-pressed={view === "shelf"} onClick={() => setView("shelf")} className={`${pill(view === "shelf")} flex items-center gap-2`}><Library className="size-4" aria-hidden />Bookshelf</button>
            <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")} className={`${pill(view === "grid")} flex items-center gap-2 -ml-px`}><LayoutGrid className="size-4" aria-hidden />Editorial grid</button>
          </div>
        </div>
      </div>
      <p className="wrap folio mt-4" role="status" aria-live="polite">{list.length} {list.length === 1 ? "book" : "books"} · {filter}</p>

      {list.length === 0 ? (
        <div className="wrap py-24 text-center">
          <div className="mx-auto w-32"><Cat variant="sitting" title="A puzzled cat" /></div>
          <p className="display text-4xl mt-4">This shelf is empty.</p>
          <p className="text-muted mt-2">No book matches “{query}”` in ${filter}`.</p>
          <button type="button" onClick={reset} className="mt-6 inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 text-sm"><X className="size-4" aria-hidden />Reset filters</button>
        </div>
      ) : view === "shelf" ? (
        <div className="mt-24">
          <div className="wrap relative">
            <div className="absolute inset-x-[3%] bottom-full pointer-events-none z-10"><Cat variant="patrol" coat="cream" /></div>
            {/* an enclosed antique walnut cabinet: top, two sides, bottom and a back panel, with the books standing inside */}
            <div className="cabinet">
              <div aria-hidden className="cab-top" />
              <div className="flex">
                <div aria-hidden className="cab-side cab-side-l" />
                <div className="cab-inner relative min-w-0 flex-1">
                  <div aria-hidden className="shelf-back pointer-events-none absolute inset-x-0 bottom-0 h-32" />
                  <div className="shelf-scroll relative overflow-x-auto snap-x px-3 sm:px-4 pt-20 pb-0" tabIndex={-1}>
                    <ul className="mx-auto flex w-max items-end gap-3 md:gap-5" key={`${filter}|${query}`}>
                      {list.map((p, i) => (
                        <Book key={p.slug} p={p} i={i} hovered={hovered} opening={opening} reduce={reduce} onHover={setHovered} onOpen={open} />
                      ))}
                    </ul>
                  </div>
                </div>
                <div aria-hidden className="cab-side cab-side-r" />
              </div>
              <div aria-hidden className="cab-bottom" />
            </div>
            <div aria-hidden className="pointer-events-none absolute right-[calc(var(--gutter)+2rem)] top-full mt-1 hidden w-28 sm:block"><Cat variant="sleeping" coat="cream" live flip /></div>
          </div>
          <p className="wrap folio mt-6 text-center">Select a book to open it</p>
        </div>
      ) : (
        <ul className="wrap mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <motion.li key={p.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.04, ease }}>
              <Link href={href(p)} className="group block">
                <div className="aspect-[4/5] overflow-hidden" style={{ background: p.coverColor }}>
                  <div className="h-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"><Cover p={p} /></div>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="display text-3xl">{p.title}</h3>
                  <span className="folio">No. {String(projects.indexOf(p) + 1).padStart(2, "0")}</span>
                </div>
                <p className="folio mt-1">{p.category}{p.year ? ` · ${p.year}` : ""}</p>
                {p.description && <p className="text-sm text-muted mt-2 max-w-sm">{p.description}</p>}
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
