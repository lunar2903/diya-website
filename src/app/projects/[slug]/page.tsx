import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Library } from "lucide-react";
import Art, { Cover } from "@/components/Art";
import Cat from "@/components/Cat";
import CampaignProject from "@/components/CampaignProject";
import MontraProject from "@/components/MontraProject";
import { BroadwayProject, FevicyrlProject, ChetakProject, FmsProject, KotakProject, PvpProject } from "@/components/CaseStudies";
import PitchProject from "@/components/PitchProject";
import Zee5Project from "@/components/Zee5Project";
import { Reveal } from "@/components/Motion";
import { getNeighbours, getProject, projects } from "@/data/projects";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.filter((p) => !p.route).map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title, description: p.description } : {};
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal className="grid gap-4 md:grid-cols-[12rem_1fr] py-12 rule">
      <div><p className="folio">{n}</p><h2 className="display text-3xl mt-2">{title}</h2></div>
      <div>{children}</div>
    </Reveal>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const idx = projects.indexOf(p);
  const { prev, next } = getNeighbours(slug);
  const nav = (
    <nav aria-label="Project navigation" className="wrap relative mt-16 mb-16 grid gap-px bg-[var(--line)] border border-[var(--line)] sm:grid-cols-3">
      <Link href={`/projects/${prev.slug}`} className="bg-paper p-6 hover:bg-paper2 transition-colors"><span className="folio flex items-center gap-2"><ArrowLeft className="size-3" aria-hidden />Previous</span><span className="display text-2xl block mt-2">{prev.title}</span></Link>
      <Link href="/work" className="bg-paper p-6 hover:bg-paper2 transition-colors text-center"><span className="folio flex items-center justify-center gap-2"><Library className="size-3" aria-hidden />Return</span><span className="display text-2xl block mt-2">To the library</span></Link>
      <Link href={`/projects/${next.slug}`} className="bg-paper p-6 hover:bg-paper2 transition-colors sm:text-right"><span className="folio flex items-center gap-2 sm:justify-end">Next<ArrowRight className="size-3" aria-hidden /></span><span className="display text-2xl block mt-2">{next.title}</span></Link>
      <div aria-hidden className="pointer-events-none absolute right-[calc(var(--gutter)+2rem)] -top-[2.6rem] hidden w-20 sm:block"><Cat variant="peeking" /></div>
    </nav>
  );
  if (p.category === "Pitches" && p.pitch) return <><PitchProject p={p} num={String(idx + 1).padStart(2, "0")} />{nav}</>;
  const Case = { fms: FmsProject, pvp: PvpProject, kotak: KotakProject, broadway: BroadwayProject, fevicyrl: FevicyrlProject, chetak: ChetakProject }[p.campaign?.layout as string];
  if (Case) return <><Case p={p} />{nav}</>;
  if (p.campaign?.layout === "zee5") return <><Zee5Project p={p} />{nav}</>;
  if (p.campaign?.layout === "montra") return <><MontraProject p={p} />{nav}</>;
  if (p.campaign) return <><CampaignProject p={p} />{nav}</>;
  const pitch = p.category === "Pitches";
  const num = String(idx + 1).padStart(2, "0");
  const process = p.processImages ?? [];
  const finals = p.finalImages ?? [];
  let n = 0;
  const label = () => String(++n).padStart(2, "0");

  return (
    <article>
      {/* open-book spread (stacks vertically on mobile) */}
      <section className="wrap">
        <Link href="/work" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink py-2"><ArrowLeft className="size-4" aria-hidden />Back to the library</Link>
        <div className="relative mt-3 grid md:grid-cols-2 bg-paper border border-[var(--line)] shadow-[0_30px_60px_-35px_rgba(63,48,41,.55)]">
          <div className="relative p-6 sm:p-10 lg:p-14 flex flex-col order-2 md:order-1" style={{ background: "linear-gradient(90deg,transparent 85%,rgba(63,48,41,.08))" }}>
            <p className="folio">Chapter {num} · {p.category}</p>
            <h1 className="display text-[clamp(2.8rem,6vw,5.5rem)] mt-4">{p.title}</h1>
            <p className="mt-5 text-lg leading-relaxed max-w-md dropcap">{p.description}</p>
            <dl className="mt-8 grid grid-cols-2 gap-y-4 gap-x-6 text-sm max-w-md">
              {p.year && <div><dt className="folio">Year</dt><dd>{p.year}</dd></div>}
              <div><dt className="folio">Category</dt><dd>{p.category}</dd></div>
              {p.tools && <div className="col-span-2"><dt className="folio">Tools</dt><dd>{p.tools.join(" · ")}</dd></div>}
            </dl>
            {!pitch && <div className="mt-8 flex items-center gap-4 rule pt-5 max-w-md">
              <div className="w-16 shrink-0"><Cat variant="sleeping" title="A sleeping cat" tint={p.coverColor} /></div>
              <p className="text-sm text-muted italic">Process note: placeholder — replace with Diya&apos;s own notes on how this project came together.</p>
            </div>}
            <p className="folio mt-auto pt-8">— {idx * 2 + 2} —</p>
          </div>
          <div className="relative p-5 sm:p-8 lg:p-12 order-1 md:order-2" style={{ background: "linear-gradient(270deg,transparent 85%,rgba(63,48,41,.08))" }}>
            <div className="aspect-[4/5] overflow-hidden shadow-[0_20px_30px_-22px_rgba(63,48,41,.6)]" style={{ background: p.coverColor }}>
              <Cover p={p} alt={pitch ? `${p.title} cover` : `${p.title} cover artwork (placeholder)`} />
            </div>
            <p className="folio mt-3 text-right">— {idx * 2 + 3} —</p>
          </div>
          <div aria-hidden className="hidden md:block absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-ink/15 to-transparent" />
        </div>
      </section>

      <div className="wrap mt-16">
        {p.overview && <Section n={label()} title="Overview"><p className="text-xl leading-relaxed max-w-2xl">{p.overview}</p></Section>}
        {p.brief && <Section n={label()} title="The brief"><p className="text-lg leading-relaxed max-w-2xl">{p.brief}</p></Section>}
        {p.concept && <Section n={label()} title="Concept & inspiration"><p className="display text-3xl md:text-4xl !leading-tight max-w-2xl">{p.concept}</p></Section>}

        {process.length > 0 && (
          <Section n={label()} title="Sketches & experiments">
            <div className="grid gap-6 sm:grid-cols-[3fr_2fr] items-start">
              {process.map((s, i) => (
                <figure key={s.src} className={i % 2 ? "sm:mt-16" : ""}>
                  <div className={`overflow-hidden border border-[var(--line)] ${i % 2 ? "aspect-square" : "aspect-[4/3]"}`}><Art src={s.src} alt={s.caption ?? "Process sketch"} /></div>
                  {s.caption && <figcaption className="folio mt-2 flex items-center gap-2">{i === 0 && <span className="w-8 inline-block"><Cat variant="peeking" /></span>}{s.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </Section>
        )}

        {finals.length > 0 && (
          <Section n={label()} title="Final designs">
            <div className="grid gap-6 md:grid-cols-[2fr_1fr] items-end">
              {finals.map((s, i) => (
                <figure key={s.src}>
                  <div className={`overflow-hidden ${i === 0 ? "aspect-[4/3]" : "aspect-[3/4]"}`} style={{ background: p.coverColor }}><Art src={s.src} alt={s.caption ?? "Final design"} /></div>
                  {s.caption && <figcaption className="folio mt-2">{s.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </Section>
        )}

        {(p.tools || p.credits) && (
          <Section n={label()} title="Tools & credits">
            <div className="grid gap-8 sm:grid-cols-2 text-sm">
              {p.tools && <div><p className="folio mb-2">Tools</p><ul className="space-y-1">{p.tools.map((t) => <li key={t}>{t}</li>)}</ul></div>}
              {p.credits && <div><p className="folio mb-2">Credits</p><ul className="space-y-1">{p.credits.map((c) => <li key={c}>{c}</li>)}</ul></div>}
            </div>
          </Section>
        )}
        {!pitch && <p className="folio rule pt-4">This is a fictional sample project, not commissioned work.</p>}
      </div>

      {nav}
    </article>
  );
}
