import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal, Wipe } from "./Motion";
import { Still } from "./CampaignMedia";
import type { Block, Project } from "@/data/projects";

/** bleeds out of the centred wrap to the full viewport width */
const bleed = "relative w-screen ml-[calc(50%-50vw)]";

// Desktop placements on a 12-column grid, in media order. Each group count has two or more compositions.
const layouts: Record<number, string[][]> = {
  4: [
    ["md:col-span-5", "md:col-span-4 md:col-start-7 md:mt-24", "md:col-span-4 md:col-start-2 md:-mt-10", "md:col-span-5 md:col-start-7 md:mt-6"],
    ["md:col-span-4 md:col-start-2", "md:col-span-5 md:col-start-7", "md:col-span-5 md:col-start-1 md:mt-8", "md:col-span-4 md:col-start-7 md:mt-20"],
  ],
  3: [
    ["md:col-span-6", "md:col-span-3 md:col-start-8 md:mt-16", "md:col-span-4 md:col-start-4 md:-mt-4"],
    ["md:col-span-3 md:col-start-1 md:mt-16", "md:col-span-6 md:col-start-5", "md:col-span-4 md:col-start-2"],
  ],
  2: [
    ["md:col-span-5 md:col-start-2", "md:col-span-5 md:col-start-7 md:mt-16"],
    ["md:col-span-4 md:col-start-3", "md:col-span-4 md:col-start-8 md:mt-24"],
  ],
  5: [
    ["md:col-span-2 md:col-start-2", "md:col-span-2 md:mt-16", "md:col-span-2 md:mt-6", "md:col-span-2 md:mt-20", "md:col-span-2 md:mt-10"],
    ["md:col-span-3", "md:col-span-3 md:col-start-5 md:mt-16", "md:col-span-3 md:col-start-9", "md:col-span-3 md:col-start-3 md:mt-4", "md:col-span-3 md:col-start-7 md:mt-20"],
  ],
};
const mobile = (i: number) => (i % 2 ? "col-span-9 col-start-4" : "col-span-9");

function Heading({ n, title, right }: { n: string; title: string; right?: boolean }) {
  return (
    <Reveal className={`flex items-baseline gap-5 ${right ? "md:justify-end" : ""}`}>
      <span className="display text-[clamp(3.5rem,9vw,7.5rem)] text-ochre leading-none" aria-hidden>{n}</span>
      <h2 className="folio !text-ink">{title}</h2>
    </Reveal>
  );
}

function Group({ b, i }: { b: Block; i: number }) {
  const tiles = b.tiles!;
  const n = String(i + 1).padStart(2, "0");
  const right = i % 2 === 1;
  // Group 12 reads as a horizontal strip of screens; every other group is a grid composition.
  const strip = i === 11;
  const set = layouts[tiles.length][i % 2];
  return (
    <section className="mt-24 md:mt-40" aria-label={b.title}>
      <Heading n={n} title={b.title} right={right} />
      {strip ? (
        <ul className="mt-10 flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4" tabIndex={0} aria-label={`${b.title} — scroll sideways`}>
          {tiles.map((t) => (
            <li key={t.src} className="snap-start shrink-0 w-[62%] sm:w-[16rem] md:w-[19rem]"><Still src={t.src} label={t.label} ratio={`${t.w} / ${t.h}`} /></li>
          ))}
        </ul>
      ) : (
        <ul className="mt-10 grid grid-cols-12 gap-x-4 gap-y-8 md:gap-x-6 items-start">
          {tiles.map((t, k) => (
            <li key={t.src} className={`${mobile(k)} ${set[k]}`}><Wipe delay={0.05}><Still src={t.src} label={t.label} ratio={`${t.w} / ${t.h}`} /></Wipe></li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Zee5Project({ p }: { p: Project }) {
  const blocks = p.campaign!.blocks!;
  const groups = blocks.slice(0, 12);
  const posts = blocks[12];
  const stagger = ["", "md:mt-12", "md:mt-4", "md:mt-16"];
  return (
    <article className="wrap">
      <Link href="/work" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink py-2"><ArrowLeft className="size-4" aria-hidden />Back to the library</Link>

      <header className="mt-10 pb-6">
        <Reveal><h1 className="display text-[clamp(4rem,15vw,13rem)] !leading-[0.88]">{p.title}</h1></Reveal>
        <div className="mt-10 grid md:grid-cols-12">
          <Reveal delay={0.25} className="md:col-span-5 md:col-start-7 pt-6 border-t border-[var(--line)]">
            <p className="text-xl md:text-2xl leading-relaxed">{p.description}</p>
          </Reveal>
        </div>
      </header>

      {groups.map((b, i) => <Group key={b.title} b={b} i={i} />)}

      <section className={`${bleed} mt-28 md:mt-44 bg-paper2 py-16 md:py-28`} aria-label={posts.title}>
        <div className="wrap">
          <Reveal className="flex items-baseline gap-5"><span className="display text-[clamp(3.5rem,9vw,7.5rem)] text-ochre leading-none" aria-hidden>+</span><h2 className="folio !text-ink">{posts.title}</h2></Reveal>
          <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 items-start">
            {posts.tiles!.map((t, i) => (
              <li key={t.src} className={stagger[i % 4]}><Wipe delay={0.05}><Still src={t.src} label={t.label} ratio={`${t.w} / ${t.h}`} /></Wipe></li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
