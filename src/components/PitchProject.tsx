import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Cover } from "./Art";
import PitchViewer from "./PitchViewer";
import { Reveal } from "./Motion";
import type { Project } from "@/data/projects";

export default function PitchProject({ p, num }: { p: Project; num: string }) {
  const { pdf, link } = p.pitch ?? {};
  return (
    <article className="wrap">
      <Link href="/work" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink py-2"><ArrowLeft className="size-4" aria-hidden />Back to the library</Link>
      <header className="mt-6 grid gap-8 md:grid-cols-[1fr_16rem] items-start pb-12">
        <div className="max-w-3xl">
          <p className="folio">Chapter {num} · {p.category}</p>
          <h1 className="display mt-4 text-[clamp(2.8rem,7vw,6rem)] !leading-[1]">{p.title}</h1>
          <p className="mt-8 text-lg leading-relaxed max-w-2xl">{p.description}</p>
          {link && (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 border border-[var(--line)] px-5 py-3 hover:bg-paper2 transition-colors">
              {link.label}<ExternalLink className="size-4" aria-hidden />
            </a>
          )}
        </div>
        <div className="w-40 md:w-full" style={{ aspectRatio: `${p.size.w} / ${p.size.h}` }}>
          <Cover p={p} alt={`${p.title} book cover`} />
        </div>
      </header>
      {pdf && (
        <Reveal className="pb-4 rule pt-10">
          <p className="folio mb-4">The presentation</p>
          <PitchViewer src={pdf} title={p.title} />
        </Reveal>
      )}
    </article>
  );
}
