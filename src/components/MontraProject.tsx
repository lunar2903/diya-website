import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal, Wipe } from "./Motion";
import { HighlightVideo, Reel, Still } from "./CampaignMedia";
import type { Project, Tile } from "@/data/projects";

const media = (t: Tile) =>
  t.kind === "video" ? <Reel src={t.src} label={t.label} ratio={`${t.w} / ${t.h}`} /> : <Still src={t.src} label={t.label} ratio={`${t.w} / ${t.h}`} />;

/** bleeds out of the centred wrap to the full viewport width */
const bleed = "relative w-screen ml-[calc(50%-50vw)]";

// Placement per tile, in media order. Mobile: staggered widths in one flow; md+: asymmetric 12-column composition.
const momentsPos = [
  "col-span-9 md:col-span-7",
  "col-span-9 col-start-4 md:col-span-5 md:col-start-8 md:mt-40",
  "col-span-6 md:col-span-3 md:col-start-2 md:-mt-16",
  "col-span-10 col-start-3 md:col-span-6 md:col-start-6 md:mt-8",
];
const tropicalsPos = [
  "col-span-10 md:col-span-8",
  "col-span-5 col-start-8 md:col-span-3 md:col-start-10 md:self-end",
  "col-span-6 md:col-span-3 md:col-start-2 md:mt-10",
  "col-span-10 col-start-3 md:col-span-6 md:col-start-6",
  "col-span-8 md:col-span-5 md:col-start-1 md:-mt-20",
  "col-span-5 col-start-8 md:col-span-3 md:col-start-9 md:mt-24",
];
const bauPos = ["col-span-3", "col-span-3 mt-12 md:mt-24", "col-span-2", "col-span-2 md:mt-14", "col-span-2 md:mt-28"];

export default function MontraProject({ p }: { p: Project }) {
  const c = p.campaign!;
  const [moments, tropicals, bau] = c.blocks!;
  return (
    <article className="wrap">
      <Link href="/work" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink py-2"><ArrowLeft className="size-4" aria-hidden />Back to the library</Link>

      {/* 01 — corporate film: the opening */}
      <header className="mt-10 grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-9">
          <Reveal><p className="folio">{c.eyebrow} · 01 · Corporate Film</p></Reveal>
          <Reveal delay={0.1}><h1 className="display mt-6 text-[clamp(3rem,10vw,9rem)] !leading-[0.9]">{c.campaignTitle}</h1></Reveal>
        </div>
        <Reveal delay={0.3} className="md:col-span-3 md:pb-3"><p className="text-lg leading-relaxed">{c.intro![0]}</p></Reveal>
      </header>
      <div className={`${bleed} mt-16 md:mt-24`}>
        <Wipe><HighlightVideo src={c.featuredVideo!} ratio="16 / 9" /></Wipe>
      </div>

      {/* 02 — moments: asymmetric collage */}
      <section className="mt-28 md:mt-44" aria-labelledby="moments">
        <Reveal className="flex items-baseline gap-4"><p className="folio">02</p><h2 id="moments" className="display text-[clamp(2.5rem,6vw,5rem)]">{moments.title}</h2></Reveal>
        <ul className="mt-12 grid grid-cols-12 gap-x-4 gap-y-8 md:gap-x-6 items-start">
          {moments.tiles!.map((t, i) => <li key={t.src} className={momentsPos[i]}><Wipe delay={0.05}>{media(t)}</Wipe></li>)}
        </ul>
      </section>

      {/* 03 — tropicals: gallery on a tonal band */}
      <section className={`${bleed} mt-28 md:mt-44 bg-paper2 py-16 md:py-28`} aria-labelledby="tropicals">
        <div className="wrap">
          <Reveal className="flex items-baseline gap-4 md:justify-end"><p className="folio">03</p><h2 id="tropicals" className="display text-[clamp(2.5rem,6vw,5rem)]">{tropicals.title}</h2></Reveal>
          <ul className="mt-12 grid grid-cols-12 gap-x-4 gap-y-8 md:gap-x-6 items-start">
            {tropicals.tiles!.map((t, i) => <li key={t.src} className={tropicalsPos[i]}><Wipe delay={0.05}>{media(t)}</Wipe></li>)}
          </ul>
        </div>
      </section>

      {/* 04 — BAU: editorial intro beside a staggered reel set */}
      <section className="mt-28 md:mt-44 grid gap-10 md:grid-cols-[minmax(0,19rem)_1fr] md:gap-16" aria-labelledby="bau">
        <Reveal className="md:sticky md:top-24 md:self-start">
          <p className="folio">04</p>
          <h2 id="bau" className="display mt-2 text-[clamp(2.5rem,5vw,4rem)]">{bau.title}</h2>
          <p className="mt-6 text-lg leading-relaxed">{bau.description}</p>
        </Reveal>
        <ul className="grid grid-cols-6 gap-x-4 gap-y-8 md:gap-x-6 items-start">
          {bau.tiles!.map((t, i) => <li key={t.src} className={bauPos[i]}><Reveal delay={0.05}>{media(t)}</Reveal></li>)}
        </ul>
      </section>

      <p className="folio mt-28 pt-6 rule text-center">End of volume · {p.title}</p>
    </article>
  );
}
