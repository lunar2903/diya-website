import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Cat from "@/components/Cat";
import { Flourish } from "@/components/Ambience";
import { Reveal } from "@/components/Motion";

export const metadata: Metadata = { title: "About", description: "An introduction to Diya Shah." };

const bio = [
  "I find finesse in the things I can’t quite put into words, and perhaps that’s where my love for writing began. Somewhere between languages, theatre, performing arts, and being a little too much of a geek, I found a way to make sense of the world.",
  "When I write, I feel like I belong in it. Not because the world suddenly makes sense, but because, for a little while, I get to make my own.",
  "I’m a curious soul, forever learning something new, collecting little obsessions, and adding books to my ever-growing library. The real one, not just the one on my work desk. I suppose I live somewhere between two bookshelves, with a head full of stories and a heart that’s always looking for another.",
  "Still learning, still writing, still finding my way. Somewhere between the pages, I’m still becoming.",
];
const skills = ["Creative Ideation", "Storytelling", "Copywriting", "Visualisation", "Content Strategy", "Campaign Planning", "Creative Research", "Communication", "Team Coordination", "Client Management", "Adaptability", "Problem Solving", "Curiosity", "Attention to Detail"];

export default function AboutPage() {
  return (
    <>
      <section className="wrap pt-6 grid gap-10 lg:grid-cols-[5fr_7fr] items-start">
        <Reveal>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/diya-photo-2.png" alt="Portrait of Diya Shah" className="block w-full h-auto border border-[var(--line)] bg-paper2" />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="folio">Chapter III · The author</p>
          <h1 className="display text-[clamp(3rem,7vw,6rem)] mt-3">About the Author</h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed max-w-xl">
            {bio.map((t, i) => <p key={i} className={i === 0 ? "dropcap" : ""}>{t}</p>)}
          </div>
          <div className="mt-10 flex flex-wrap items-end gap-x-4 gap-y-6">
            <Link href="/work" className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 text-sm">See the work <ArrowRight className="size-4" aria-hidden /></Link>
            <Link href="/contact" className="inline-flex items-center gap-2 border border-ink px-5 py-3 text-sm">Say hello</Link>
            <div className="hidden sm:block ml-auto w-32"><Cat variant="peek" coat="cream" flip /></div>
          </div>
        </Reveal>
      </section>

      <Flourish className="mt-12" />
      <section className="wrap mt-8 relative" aria-labelledby="skills">
        <div aria-hidden className="pointer-events-none absolute right-[var(--gutter)] bottom-[calc(100%-1px)] hidden w-40 md:block"><Cat variant="sleeping" curled coat="cream" /></div>
        <Reveal className="rule pt-5">
          <p className="folio">Appendix</p>
          <h2 id="skills" className="display text-4xl mt-2">Skill Set</h2>
          <ul className="mt-8 flex flex-wrap items-baseline gap-y-3 display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-tight max-w-4xl">
            {skills.map((x, i) => (
              <li key={x} className="flex items-baseline">
                {x}
                {i < skills.length - 1 && <span aria-hidden className="mx-[0.6em] text-[var(--amber-glow)] opacity-70">·</span>}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </>
  );
}
