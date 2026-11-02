import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Drift, Reveal, Wipe } from "./Motion";
import { HighlightVideo, Reel, Still } from "./CampaignMedia";
import PhotoCarousel from "./PhotoCarousel";
import type { Block, PostCarousel, Project, Tile } from "@/data/projects";

/* Shared editorial vocabulary for the case-study pages: bleed bands, ghost numerals, asymmetric 12-column
   collages and snap strips. Each project below composes these differently. */

const bleed = "relative w-screen ml-[calc(50%-50vw)]";
const m9 = (i: number) => (i % 2 ? "col-span-9 col-start-4" : "col-span-9"); // staggered widths on phones
const pops = ["var(--color-taupe)", "var(--color-mocha)", "var(--color-blush)", "var(--color-smoky)"];
const italics = (t: string) => t.split("*").map((s, i) => (i % 2 ? <em key={i}>{s}</em> : s));

const media = (t: Tile) =>
  t.kind === "video" ? <Reel src={t.src} label={t.label} ratio={`${t.w} / ${t.h}`} /> : <Still src={t.src} label={t.label} ratio={`${t.w} / ${t.h}`} />;

function Back() {
  return <Link href="/work" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink py-2"><ArrowLeft className="size-4" aria-hidden />Back to the library</Link>;
}

function Chapter({ n, title, right = false, size = "text-[clamp(2.5rem,6vw,5rem)]" }: { n: string; title: string; right?: boolean; size?: string }) {
  return (
    <Reveal className={`flex items-baseline gap-5 ${right ? "md:justify-end" : ""}`}>
      <span aria-hidden className="display text-[clamp(3.5rem,9vw,7.5rem)] text-ochre leading-none">{n}</span>
      <h2 className={`display ${size}`}>{title}</h2>
    </Reveal>
  );
}

function Lead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <Reveal delay={0.15} className={className}><p className="text-lg md:text-xl leading-relaxed max-w-xl">{children}</p></Reveal>;
}

function Band({ children, on = true, className = "" }: { children: React.ReactNode; on?: boolean; className?: string }) {
  return on ? <div className={`${bleed} bg-paper2 py-16 md:py-28 ${className}`}><div className="wrap">{children}</div></div> : <div className={className}>{children}</div>;
}

/** Asymmetric collage: `pos` places each tile (in media order) on the 12-column grid from md up. */
function Collage({ tiles, pos, pop = false, captions = false, className = "mt-10" }: { tiles: Tile[]; pos: string[]; pop?: boolean; captions?: boolean; className?: string }) {
  return (
    <ul className={`grid grid-cols-12 gap-x-4 gap-y-8 md:gap-x-6 items-start ${className}`}>
      {tiles.map((t, i) => (
        <li key={t.src} className={`${m9(i)} ${pos[i]}`}>
          <Wipe delay={0.05}>
            <div style={pop ? { boxShadow: `10px 10px 0 ${pops[i % 4]}` } : undefined}>{media(t)}</div>
            {captions && <p className="folio mt-3">{t.label}</p>}
          </Wipe>
        </li>
      ))}
    </ul>
  );
}

/** Horizontal snap strip: every item stays in order, one swipe away. */
function Strip({ tiles, label, pop = false }: { tiles: Tile[]; label: string; pop?: boolean }) {
  return (
    <ul className="mt-10 flex gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-8 pr-2" tabIndex={0} aria-label={`${label} — scroll sideways`}>
      {tiles.map((t, i) => (
        <li key={t.src} className={`snap-start shrink-0 w-[62%] sm:w-[16rem] md:w-[19rem] ${i % 2 ? "md:mt-12" : ""}`}>
          <div style={pop ? { boxShadow: `8px 8px 0 ${pops[i % 4]}` } : undefined}>{media(t)}</div>
        </li>
      ))}
    </ul>
  );
}

function CarouselFrame({ k, heading, className = "" }: { k: PostCarousel; heading: string; className?: string }) {
  return (
    <Reveal className={className}>
      {k.title && <h3 className="display text-3xl mb-1">{k.title}</h3>}
      <p className="folio">{heading} · {k.photos.length} photographs</p>
      <div className="mt-4 border border-[var(--line)] bg-paper px-5 py-8 sm:px-10 sm:py-12"><PhotoCarousel photos={k.photos} label={k.label} ratio={k.ratio} /></div>
    </Reveal>
  );
}

/* ───────────── Four More Shots Please! — cinematic entertainment editorial ───────────── */

export function FmsProject({ p }: { p: Project }) {
  const c = p.campaign!;
  const reels = (c.aftershots ?? []).flatMap((a) => (a.type === "reel" ? [{ src: a.src, label: a.label }] : []));
  const carousel = c.aftershots?.find((a) => a.type === "carousel");
  const off = ["", "md:mt-16", "md:mt-6", "md:mt-24"];
  return (
    <article className="wrap">
      <Back />
      <header className="mt-10 pb-6">
        <Reveal><p className="folio">{p.title}</p></Reveal>
        <Drift><h1 className="display mt-4 text-[clamp(3.5rem,13vw,12rem)] !leading-[0.85]">{c.campaignTitle}</h1></Drift>
        <div className="mt-10 grid md:grid-cols-12">
          <Lead className="md:col-span-6 md:col-start-7 pt-6 border-t border-[var(--line)]">{p.description}</Lead>
        </div>
      </header>

      {c.featuredVideo && (
        <section className="mt-24 md:mt-36 grid md:grid-cols-12 gap-8 items-end" aria-label="Highlight">
          <Wipe className="md:col-span-5 md:col-start-2"><HighlightVideo src={c.featuredVideo} /></Wipe>
          <Reveal className="md:col-span-4 md:col-start-8"><span aria-hidden className="display block text-[clamp(5rem,14vw,11rem)] text-ochre leading-none">01</span><p className="folio mt-2">Highlight</p></Reveal>
        </section>
      )}

      {c.fullVideo && (
        <section className={`${bleed} mt-24 md:mt-36 bg-pit text-ink py-16 md:py-28`} aria-label="The Campaign in Full">
          <div className="wrap">
            <Reveal className="flex items-baseline gap-5"><span aria-hidden className="display text-[clamp(3.5rem,9vw,7.5rem)] text-ochre leading-none">02</span><h2 className="display text-[clamp(2.5rem,6vw,5rem)]">The Campaign in Full</h2></Reveal>
            <Wipe className="mt-10"><div className="aspect-video border border-ink/30">
              <iframe className="size-full" src={`https://www.youtube-nocookie.com/embed/${c.fullVideo.youtubeId}`} title="Four More Shots Please! — ONE LAST SHOT! campaign film" loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            </div></Wipe>
            <a href={c.fullVideo.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm underline underline-offset-4">Watch the full film on YouTube<ExternalLink className="size-4" aria-hidden /></a>
          </div>
        </section>
      )}

      {c.aftershots && (
        <section className="mt-24 md:mt-40" aria-label="The Aftershots">
          <Chapter n="03" title="The Aftershots" right />
          <ul className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 items-start">
            {reels.map((r, i) => <li key={r.label} className={off[i % 4]}><Wipe delay={0.05}><Reel src={r.src} label={r.label} /></Wipe></li>)}
          </ul>
          {carousel?.type === "carousel" && (
            <div className="mt-28 md:mt-40 grid md:grid-cols-12 gap-8 items-start">
              <Reveal className="md:col-span-4 md:sticky md:top-24"><p className="folio">Photo carousel · {carousel.photos.length} photographs</p><h3 className="display text-[clamp(2.5rem,5vw,4rem)] mt-2">The Carousel</h3></Reveal>
              <Wipe className="md:col-span-7 md:col-start-6"><div className="border border-[var(--line)] bg-paper2 px-5 py-8 sm:px-10 sm:py-12"><PhotoCarousel photos={carousel.photos} label={carousel.label} /></div></Wipe>
            </div>
          )}
        </section>
      )}
    </article>
  );
}

/* ───────────── Prime Video Presents — premium campaign showcase ───────────── */

export function PvpProject({ p }: { p: Project }) {
  const c = p.campaign!;
  const [lead, sub] = p.title.split(": ");
  const pos = [
    "md:col-span-5", "md:col-span-3 md:col-start-7 md:mt-20", "md:col-span-3 md:col-start-10",
    "md:col-span-3 md:col-start-2 md:mt-8", "md:col-span-3 md:col-start-6 md:mt-24", "md:col-span-3 md:col-start-10 md:mt-4",
    "md:col-span-4", "md:col-span-4 md:col-start-6 md:mt-16", "md:col-span-3 md:col-start-10",
  ];
  const films: Tile[] = (c.reels ?? []).map((r) => ({ kind: "video", src: r.src, label: r.label, w: 9, h: 16 }));
  const widths = ["md:w-[72%]", "md:w-[88%] md:ml-auto", "md:w-[76%]"];
  return (
    <article className="wrap">
      <Back />
      <header className="mt-10 pb-6">
        <Drift by={30}>
          <h1 className="display text-[clamp(3rem,10vw,9rem)] !leading-[0.9]">
            <span className="block">{lead}:</span>
            <span className="block italic text-[0.42em] !leading-[1.1] mt-4 md:ml-[18%]">{sub}</span>
          </h1>
        </Drift>
        <div className="mt-10 grid md:grid-cols-12"><Lead className="md:col-span-6 md:col-start-2 pt-6 border-t border-[var(--line)]">{p.description}</Lead></div>
      </header>

      <section className="mt-24 md:mt-40" aria-label={c.reelsTitle}>
        <Chapter n="01" title={c.reelsTitle ?? "Films"} />
        <Collage tiles={films} pos={pos} className="mt-12" />
      </section>

      <Band className="mt-28 md:mt-44">
        <Chapter n="02" title={c.carouselsTitle ?? "Photos"} right />
        <div className="mt-14 space-y-24 md:space-y-32">
          {c.carousels!.map((k, i) => <CarouselFrame key={k.label} k={k} heading={`Post ${String(i + 1).padStart(2, "0")}`} className={widths[i % 3]} />)}
        </div>
      </Band>
    </article>
  );
}

/* ───────────── Kotak811 — structured digital banking editorial ───────────── */

const kotakPos: string[][] = [
  ["md:col-span-8", "md:col-span-4 md:mt-24"],
  ["md:col-span-8", "md:col-span-8 md:col-start-5 md:mt-8"],
  ["md:col-span-7", "md:col-span-4 md:col-start-9 md:mt-16", "md:col-span-3 md:col-start-2", "md:col-span-4 md:col-start-6 md:mt-12", "md:col-span-3 md:col-start-10 md:mt-4"],
  ["md:col-span-7", "md:col-span-5 md:mt-20", "md:col-span-5 md:col-start-2", "md:col-span-6 md:col-start-7 md:mt-12"],
  ["md:col-span-4", "md:col-span-3 md:col-start-6 md:mt-12", "md:col-span-3 md:col-start-10", "md:col-span-3 md:col-start-2 md:mt-6", "md:col-span-4 md:col-start-6 md:mt-16"],
  ["md:col-span-3", "md:col-span-4 md:col-start-5 md:mt-16", "md:col-span-3 md:col-start-10", "md:col-span-3 md:col-start-2 md:mt-4", "md:col-span-3 md:col-start-6 md:mt-20", "md:col-span-3 md:col-start-10"],
];

export function KotakProject({ p }: { p: Project }) {
  const blocks = p.campaign!.blocks!;
  const widths = ["md:w-[70%]", "md:w-[85%] md:ml-auto", "md:w-[70%]"];
  return (
    <article className="wrap">
      <Back />
      <header className="mt-10 grid md:grid-cols-12 gap-10 md:items-end">
        <Drift by={30} className="md:col-span-7"><h1 className="display text-[clamp(3.5rem,12vw,10.5rem)] !leading-[0.88]">{p.title}</h1></Drift>
        <Reveal delay={0.2} className="md:col-span-4 md:col-start-9">
          <nav aria-label="Campaigns on this page">
            <ol className="border-t border-[var(--line)]">
              {blocks.map((b, i) => (
                <li key={b.title}><a href={`#chapter-${i + 1}`} className="flex items-baseline gap-4 border-b border-[var(--line)] py-3 text-sm hover:bg-paper2 transition-colors"><span className="folio">{String(i + 1).padStart(2, "0")}</span>{b.title}</a></li>
              ))}
            </ol>
          </nav>
        </Reveal>
      </header>

      {blocks.map((b: Block, i) => (
        <section key={b.title} id={`chapter-${i + 1}`} className="mt-24 md:mt-40 scroll-mt-20" aria-label={b.title}>
          <Band on={i % 2 === 1}>
            <Chapter n={String(i + 1).padStart(2, "0")} title={b.title} right={i % 2 === 1} size="text-[clamp(2rem,5vw,4.25rem)]" />
            {b.description && <Lead className={`mt-6 ${i % 2 === 1 ? "md:ml-auto" : ""}`}>{b.description}</Lead>}
            {b.tiles && <Collage tiles={b.tiles} pos={kotakPos[i]} className="mt-12" />}
            {b.carousels && (
              <div className={`${b.tiles ? "mt-24" : "mt-12"} space-y-24`}>
                {b.carousels.map((k, j) => <CarouselFrame key={k.label} k={k} heading="Photo carousel" className={widths[j % 3]} />)}
              </div>
            )}
          </Band>
        </section>
      ))}
    </article>
  );
}

/* ───────────── Broadway — urban lifestyle and outdoor advertising case study ───────────── */

const broadwayPos: (string[] | null)[] = [
  ["md:col-span-3", "md:col-span-3 md:mt-20", "md:col-span-3 md:mt-8", "md:col-span-3 md:mt-28"],
  ["md:col-span-4", "md:col-span-4 md:mt-20", "md:col-span-4 md:mt-8", "md:col-span-4 md:mt-12", "md:col-span-4", "md:col-span-4 md:mt-24"],
  ["md:col-span-7", "md:col-span-5 md:mt-12", "md:col-span-3 md:col-start-2", "md:col-span-3 md:col-start-6 md:-mt-8", "md:col-span-9 md:col-start-3"],
  null,
];

export function BroadwayProject({ p }: { p: Project }) {
  const c = p.campaign!;
  const blocks = c.blocks!;
  return (
    <article className="wrap">
      <Back />
      {c.hero && <Wipe className={`${bleed} mt-6`}><Still src={c.hero.src} label={c.hero.label} ratio={`${c.hero.w} / ${c.hero.h}`} /></Wipe>}
      <header className="mt-14 pb-6">
        <Reveal><p className="folio">{c.eyebrow}</p></Reveal>
        <Drift by={50}><h1 className="display mt-4 text-[clamp(3.5rem,14vw,13rem)] !leading-[0.84]">{c.campaignTitle}</h1></Drift>
        <div className="mt-12 grid md:grid-cols-12">
          <Reveal delay={0.2} className="md:col-span-9 md:col-start-4 pt-6 border-t border-[var(--line)] md:columns-2 md:gap-12">
            {c.intro!.map((t) => <p key={t} className="text-lg leading-relaxed mb-6 break-inside-avoid">{t}</p>)}
          </Reveal>
        </div>
      </header>

      {blocks.map((b, i) => {
        const pos = broadwayPos[i];
        const n = String(i + 1).padStart(2, "0");
        return (
          <section key={b.title} className="mt-24 md:mt-40" aria-label={b.title}>
            <Band on={i === 2}>
              <Chapter n={n} title={b.title} right={i % 2 === 1} />
              {pos ? <Collage tiles={b.tiles!} pos={pos} captions={i === 2} className="mt-12" /> : <Strip tiles={b.tiles!} label={b.title} />}
            </Band>
          </section>
        );
      })}
    </article>
  );
}

/* ───────────── Fevicyrl — colourful, expressive campaign showcase ───────────── */

export function FevicyrlProject({ p }: { p: Project }) {
  const [masaba, diwali, tie, art, influencer] = p.campaign!.blocks!;
  const heading = "text-[clamp(2rem,5vw,4.25rem)] max-w-4xl !leading-[1.02]";
  return (
    <article className="wrap">
      <Back />
      <header className="mt-10 pb-6">
        <Drift by={60}><h1 className="display text-[clamp(4.5rem,18vw,16rem)] !leading-[0.82]">{p.title}</h1></Drift>
        <div aria-hidden className="mt-6 flex h-3 w-full">{pops.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</div>
      </header>
      {p.campaign!.hero && <Wipe className={`mt-8`}><Still src={p.campaign!.hero.src} label={p.campaign!.hero.label} ratio={`${p.campaign!.hero.w} / ${p.campaign!.hero.h}`} /></Wipe>}

      <section className="mt-24 md:mt-36" aria-label="Masaba">
        <Chapter n="01" title={masaba.title} size={heading} />
        <Lead className="mt-6">{masaba.description}</Lead>
        <Collage tiles={masaba.tiles!} pos={["md:col-span-4 md:col-start-2", "md:col-span-4 md:col-start-7 md:mt-24"]} pop className="mt-14" />
      </section>

      <section className="mt-28 md:mt-44" aria-label={diwali.title}>
        <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-8 items-start">
          <div className="col-span-12 md:col-span-4 md:row-span-2 md:sticky md:top-24">
            <Chapter n="02" title={diwali.title} size="text-[clamp(2.5rem,5vw,4rem)]" />
            <Lead className="mt-6">{italics(diwali.description!)}</Lead>
          </div>
          {diwali.tiles!.map((t, i) => (
            <div key={t.src} className={`${m9(i)} ${["md:col-span-7 md:col-start-6", "md:col-span-4 md:col-start-7 md:mt-4"][i]}`}>
              <Wipe delay={0.05}><div style={{ boxShadow: `10px 10px 0 ${pops[i * 2]}` }}>{media(t)}</div></Wipe>
            </div>
          ))}
        </div>
      </section>

      <Band className="mt-28 md:mt-44">
        <Chapter n="03" title={tie.title} right />
        <Collage
          tiles={tie.tiles!} pop className="mt-14"
          pos={[
            "md:col-span-3 md:col-start-1 md:-rotate-2", "md:col-span-4 md:col-start-5 md:mt-12 md:rotate-1", "md:col-span-3 md:col-start-10 md:-rotate-1",
            "md:col-span-3 md:col-start-2 md:mt-12", "md:col-span-4 md:col-start-6", "md:col-span-3 md:col-start-10 md:mt-16",
          ]}
        />
      </Band>

      <section className="mt-28 md:mt-44" aria-label={art.title}>
        <Chapter n="04" title={art.title} size="text-[clamp(2rem,5vw,4.25rem)]" />
        <Lead className="mt-6">{art.description}</Lead>
        <Strip tiles={art.tiles!} label={art.title} pop />
      </section>

      <section className="mt-28 md:mt-44" aria-label={influencer.title}>
        <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-start">
          <div className="col-span-12 md:col-span-4 md:sticky md:top-24">
            <Chapter n="05" title={influencer.title} size="text-[clamp(2.25rem,4.5vw,3.5rem)] !leading-[1]" />
            <Lead className="mt-6">{influencer.description}</Lead>
          </div>
          {influencer.tiles!.map((t, i) => (
            <div key={t.src} className={`${m9(i)} ${["md:col-span-4 md:col-start-5", "md:col-span-4 md:col-start-9 md:mt-20"][i]}`}>
              <Wipe delay={0.05}><div style={{ boxShadow: `10px 10px 0 ${pops[i * 2 + 1]}` }}>{media(t)}</div></Wipe>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

/* ───────────── Chetak — campaign chapters, in the Montra / ZEE5 editorial vocabulary ───────────── */

const chetakPos = (n: number): string[] => {
  if (n === 1) return ["md:col-span-4 md:col-start-5"];
  if (n === 2) return ["md:col-span-4 md:col-start-2", "md:col-span-4 md:col-start-7 md:mt-20"];
  if (n === 4) return ["md:col-span-3", "md:col-span-3 md:mt-16", "md:col-span-3 md:mt-6", "md:col-span-3 md:mt-20"];
  return Array.from({ length: n }, (_, i) => `md:col-span-4 ${["", "md:mt-16", "md:mt-6"][i % 3]}`);
};

export function ChetakProject({ p }: { p: Project }) {
  const c = p.campaign!;
  const widths = ["md:w-[72%]", "md:w-[88%] md:ml-auto", "md:w-[76%]"];
  return (
    <article className="wrap">
      <Back />
      <header className="mt-10 pb-6">
        <Drift by={40}><h1 className="display text-[clamp(4.5rem,18vw,16rem)] !leading-[0.82]">{p.title}</h1></Drift>
        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6 md:col-start-2 pt-6 border-t border-[var(--line)] space-y-5">
            {c.intro!.map((t) => <Reveal key={t} delay={0.1}><p className={`text-lg md:text-xl leading-relaxed ${t === c.intro![0] ? "dropcap" : ""}`}>{t}</p></Reveal>)}
          </div>
          {c.stat && (
            <Reveal delay={0.2} className="md:col-span-4 md:col-start-9 pt-6 border-t border-[var(--line)]">
              <p className="folio">{c.stat.label} · {c.stat.period}</p>
              <p className="display mt-3 flex flex-wrap items-baseline gap-x-3 text-[clamp(3.5rem,8vw,6.5rem)] !leading-[0.95]">
                <span className="text-muted">{c.stat.from}</span><span aria-hidden className="text-ochre text-[0.6em]">→</span><span>{c.stat.to}</span>
              </p>
              <p className="sr-only">Grew from {c.stat.from} to {c.stat.to} followers</p>
            </Reveal>
          )}
        </div>
      </header>

      {/* 01 — brand film: the source is portrait, so it is rotated 90° counter-clockwise into a landscape frame, uncropped */}
      <section className={`${bleed} mt-24 md:mt-36 bg-pit text-ink py-16 md:py-28`} aria-label="Brand film">
        <div className="wrap">
          <Reveal className="flex items-baseline gap-5"><span aria-hidden className="display text-[clamp(3.5rem,9vw,7.5rem)] text-ochre leading-none">01</span><p className="folio !text-ink/70">Brand film</p></Reveal>
          <div className="mt-6 grid gap-8 md:grid-cols-12 md:items-end">
            <Reveal delay={0.1} className="md:col-span-7"><h2 className="display text-[clamp(2.5rem,6vw,5rem)] !leading-[0.98]">{c.featuredTitle}</h2></Reveal>
            <Reveal delay={0.2} className="md:col-span-5"><p className="text-lg leading-relaxed text-ink/85">{c.featuredText}</p></Reveal>
          </div>
          <Wipe className="mt-12"><HighlightVideo src={c.featuredVideo!} ratio="9 / 16" rotate /></Wipe>
        </div>
      </section>

      {c.blocks!.map((b: Block, i) => {
        const right = i % 2 === 1;
        return (
          <section key={b.title} className="mt-28 md:mt-44" aria-label={b.title}>
            <Band on={right}>
              <Chapter n={String(i + 2).padStart(2, "0")} title={b.title} right={right} />
              {b.description && <Lead className={`mt-6 ${right ? "md:ml-auto" : ""}`}>{b.description}</Lead>}
              {b.tiles && <Collage tiles={b.tiles} pos={chetakPos(b.tiles.length)} className="mt-12" />}
              {b.strip && <Strip tiles={b.strip} label={b.title} />}
              {b.carousels && (
                <div className="mt-24 space-y-24">
                  {b.carousels.map((k, j) => <CarouselFrame key={k.label} k={k} heading="Photo carousel" className={widths[j % 3]} />)}
                </div>
              )}
            </Band>
          </section>
        );
      })}
      <p className="folio mt-28 pt-6 rule text-center">End of volume · {p.title}</p>
    </article>
  );
}
