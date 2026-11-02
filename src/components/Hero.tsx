"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Cat from "./Cat";
import { site } from "@/data/site";

const ease = [0.22, 0.8, 0.28, 1] as const;

const contents = [
  { label: "Prime Video", href: "/projects/prime-video-presents" },
  { label: "Google Gemini", href: "/projects/king-google-gemini" },
  { label: "Bajaj Chetak", href: "/projects/chetak" },
  { label: "Kotak811", href: "/projects/kotak811" },
  { label: "ITC", href: "/work" },
  { label: "Broadway", href: "/projects/broadway" },
  { label: "Fevicryl", href: "/projects/fevicyrl" },
  { label: "ZEE5 Global", href: "/projects/zee5-global" },
  { label: "Pitches I’m Proud Of", href: "/work" },
];

export default function Hero({ photo }: { photo?: string }) {
  const [skipped, setSkipped] = useState(false);
  // Any click, key press or touch finishes the short entrance immediately. Navigation is never blocked.
  useEffect(() => {
    const skip = () => setSkipped(true);
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => { window.removeEventListener("pointerdown", skip); window.removeEventListener("keydown", skip); };
  }, []);

  const t = (delay: number, duration = 0.6) => ({ duration, delay, ease });
  const init = skipped ? false : undefined;

  return (
    <section key={skipped ? "skipped" : "play"} className="relative overflow-x-clip">
      <div className="wrap relative grid gap-10 lg:grid-cols-[1.05fr_1fr] items-center pt-6 pb-16 lg:pt-[6.25rem]">
        <div className="relative z-10">
          <motion.p initial={init ?? { opacity: 0 }} animate={{ opacity: 1 }} transition={t(0.2, 0.4)} className="folio flex gap-4">
            <span>Issue No. 01</span><span>Vol. I · Portfolio</span>
          </motion.p>
          <h1 className="display mt-5 text-[clamp(4.2rem,13vw,10rem)]" style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 400 }} aria-label={site.name}>
            {["Diya", "Shah"].map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.08em]">
                <motion.span className="block" initial={init ?? { y: "105%" }} animate={{ y: 0 }} transition={t(0.25 + i * 0.12, 0.7)}>
                  {i === 1 ? <em className="not-italic md:italic pl-[0.4em]">{w}</em> : w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={init ?? { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={t(0.7, 0.5)}
            className="mt-6 max-w-md text-lg leading-relaxed">{site.tagline}</motion.p>
          <motion.div initial={init ?? { opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={t(0.9, 0.55)} className="mt-8 flex items-start gap-6">
            <Link href="/work" className="group relative flex flex-col items-center justify-between bg-rose text-ink px-5 pt-4 pb-9 w-44 transition-transform duration-200 hover:-translate-y-1 active:translate-y-0"
              style={{ clipPath: "polygon(0 0,100% 0,100% 100%,50% 86%,0 100%)" }}>
              <span className="folio !text-ink/70">Bookmark</span>
              <span className="flex items-center gap-2 text-sm font-medium tracking-[0.12em] mt-3">OPEN THE LIBRARY <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden /></span>
            </Link>
          
          </motion.div>
        </div>

        {/* open book */}
        <motion.div initial={init ?? { opacity: 0, y: 50, rotateX: 18 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={t(0.3, 0.8)}
          className="relative z-10 mx-auto w-full max-w-[40rem]" style={{ perspective: 1400 }}>
          <div className="relative min-h-[31rem] sm:min-h-0 sm:aspect-[1.05/1]">
            <div aria-hidden className="absolute inset-x-[2%] -bottom-3 h-6 rounded-[50%] bg-[var(--pit)]/70 blur-xl" />
            {/* page stack under the spread */}
            <div aria-hidden className="absolute inset-0 translate-y-2 bg-paper2 border border-[var(--line)]" />
            <div aria-hidden className="absolute inset-0 translate-y-1 bg-paper2 border border-[var(--line)]" />
            <div className="absolute inset-0 grid grid-cols-2 bg-paper border border-[var(--line)] shadow-[0_30px_50px_-30px_rgba(63,48,41,.5)]">
              <div className="relative p-[7%] pb-[13%] border-r border-[var(--line)]" style={{ background: "linear-gradient(90deg,transparent 80%,rgba(63,48,41,.09))" }}>
                <p className="folio">Table of Contents</p>
                <ol className="mt-3 space-y-[0.55rem] sm:space-y-[0.4rem] md:space-y-[0.7rem]">
                  {contents.map((c, i) => (
                    <li key={c.label}>
                      <Link href={c.href} className="group flex items-baseline gap-2 hover:text-[var(--amber-glow)] transition-colors">
                        <span className="display text-[clamp(1rem,2.4vw,1.3rem)] leading-tight">{c.label}</span>
                        <span className="flex-1 border-b border-dotted border-ink/30" />
                        <span className="folio">{String(i + 1).padStart(2, "0")}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
                <p className="folio absolute bottom-[5%] left-[7%]">— 2 —</p>
              </div>
              <div className="relative p-[7%] pb-[13%] flex flex-col" style={{ background: "linear-gradient(270deg,transparent 80%,rgba(63,48,41,.09))" }}>
                <p className="folio mb-3">The Author</p>
                <div className="min-h-0 flex-1 flex items-center justify-center">
                  {photo
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={photo} alt="Portrait of Diya Shah" className="block max-h-full max-w-full h-auto w-auto object-contain border border-[var(--line)]" />
                    : <div className="aspect-[4/5] h-full max-w-full border border-[var(--line)] bg-paper2 grid place-items-center folio">Portrait</div>}
                </div>
                <p className="folio mt-3">Bio</p>
                <p className="display italic text-[clamp(0.8rem,1.7vw,1.05rem)] leading-snug mt-1">“A little lost in language, a little found in stories, and always making room for one more book.”</p>
                <p className="folio absolute bottom-[5%] right-[7%]">— 3 —</p>
              </div>
            </div>
            <div aria-hidden className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-gradient-to-r from-transparent via-ink/15 to-transparent" />
            {/* ribbon */}
            <div aria-hidden className="absolute left-[56%] -bottom-6 h-12 w-3 bg-rose" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,50% 70%,0 100%)" }} />
            <motion.div initial={init ?? { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={t(1.0, 0.6)} className="absolute bottom-full right-[6%] w-[24%] [translate:0_5%]">
              <Cat variant="sitting" coat="cream" live flip hangTail start={["sitting"]} allow={["sitting", "tailSwish", "lookingAround", "watchingCursor", "slowBlinking", "yawning", "grooming"]} title="A cream cat sitting on the top edge of the open book" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
