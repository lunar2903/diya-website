import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Reveal } from "./Motion";
import { HighlightVideo, Reel as ReelCard, Still } from "./CampaignMedia";
import PhotoCarousel from "./PhotoCarousel";
import type { Block, Project, Reel } from "@/data/projects";

function ReelGrid({ items }: { items: Reel[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => <li key={a.label}><ReelCard src={a.src} label={a.label} /></li>)}
    </ul>
  );
}

/** *text* marks italics (named content IPs) */
const withItalics = (t: string) => t.split("*").map((s, i) => (i % 2 ? <em key={i}>{s}</em> : s));

function TileGrid({ b }: { b: Block }) {
  const cols = b.cols === 1 ? "max-w-md" : b.cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <ul className={`grid gap-6 items-start ${cols}`}>
      {b.tiles!.map((t) => (
        <li key={t.src}>
          {t.kind === "video" ? <ReelCard src={t.src} label={t.label} ratio={`${t.w} / ${t.h}`} /> : <Still src={t.src} label={t.label} ratio={`${t.w} / ${t.h}`} />}
        </li>
      ))}
    </ul>
  );
}

function Section({ n, title, children, big = false }: { n: string; title: string; children: React.ReactNode; big?: boolean }) {
  return (
    <Reveal className="grid gap-4 md:grid-cols-[12rem_1fr] py-12 rule">
      <div><p className="folio">{n}</p><h2 className={`display mt-2 ${big ? "text-4xl" : "text-3xl"}`}>{title}</h2></div>
      <div>{children}</div>
    </Reveal>
  );
}

export default function CampaignProject({ p }: { p: Project }) {
  const c = p.campaign!;
  const ci = c.aftershots?.findIndex((a) => a.type === "carousel") ?? -1;
  const feature = c.aftershots?.[ci];
  const reels = (c.aftershots ?? []).flatMap((a) => (a.type === "reel" ? [{ src: a.src, label: a.label }] : [])); // data order, carousel excluded
  let n = 0;
  const num = () => String(++n).padStart(2, "0");
  return (
    <article className="wrap">
      <Link href="/work" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink py-2"><ArrowLeft className="size-4" aria-hidden />Back to the library</Link>

      {c.hero && <div className="mt-6"><Still src={c.hero.src} label={c.hero.label} ratio={`${c.hero.w} / ${c.hero.h}`} /></div>}

      <header className="mt-6 pb-12 max-w-3xl">
        {c.campaignTitle && <p className="folio">{c.eyebrow ?? p.title}</p>}
        <h1 className={`display mt-4 ${c.campaignTitle ? "text-[clamp(3rem,8vw,6.5rem)]" : "text-[clamp(2.5rem,6vw,5rem)] !leading-[1]"}`}>{c.campaignTitle ?? p.title}</h1>
        {c.intro ? c.intro.map((t) => <p key={t} className="mt-8 text-lg leading-relaxed">{t}</p>) : p.description && <p className="mt-8 text-lg leading-relaxed">{p.description}</p>}
      </header>

      {c.blocks?.map((b) => (
        <Section key={b.title} n={num()} title={b.title} big={b.prominent}>
          {b.description && <p className="text-lg leading-relaxed max-w-2xl mb-8">{withItalics(b.description)}</p>}
          {b.tiles && <TileGrid b={b} />}
          {b.carousels && (
            <div className={b.tiles ? "mt-16 space-y-16" : "space-y-16"}>
              {b.carousels.map((k, i) => (
                <div key={k.label} className={b.tiles || i ? "pt-12 rule" : ""}>
                  {k.title && <h3 className="display text-3xl mb-1">{k.title}</h3>}
                  <p className="folio">Photo carousel · {k.photos.length} photographs</p>
                  <div className="mt-4 border border-[var(--line)] bg-paper2 px-5 py-8 sm:px-10 sm:py-12">
                    <PhotoCarousel photos={k.photos} label={k.label} ratio={k.ratio} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      ))}

      {c.featuredVideo && (
        <Section n={num()} title="Highlight">
          <HighlightVideo src={c.featuredVideo} />
        </Section>
      )}

      {c.fullVideo && (
        <Section n={num()} title="The Campaign in Full">
          <div className="aspect-video border border-[var(--line)] bg-paper2">
            <iframe
              className="size-full"
              src={`https://www.youtube-nocookie.com/embed/${c.fullVideo.youtubeId}`}
              title="Four More Shots Please! — ONE LAST SHOT! campaign film"
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <a href={c.fullVideo.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-muted hover:text-ink underline underline-offset-4">
            Watch the full film on YouTube<ExternalLink className="size-4" aria-hidden />
          </a>
        </Section>
      )}

      {c.aftershots && (
        <Section n={num()} title="The Aftershots">
          <ReelGrid items={reels} />
          {feature?.type === "carousel" && (
            <div className="mt-20 pt-12 rule">
              <p className="folio">Photo carousel · {feature.photos.length} photographs</p>
              <h3 className="display text-3xl mt-2 mb-8">The Carousel</h3>
              <div className="border border-[var(--line)] bg-paper2 px-5 py-8 sm:px-10 sm:py-12">
                <PhotoCarousel photos={feature.photos} label={feature.label} />
              </div>
            </div>
          )}
        </Section>
      )}

      {c.reels && (
        <Section n={num()} title={c.reelsTitle ?? "Films"}>
          <ReelGrid items={c.reels} />
        </Section>
      )}

      {c.carousels && (
        <Section n={num()} title={c.carouselsTitle ?? "Photos"}>
          <div className="space-y-16">
            {c.carousels.map((k, i) => (
              <div key={k.label} className={i ? "pt-12 rule" : ""}>
                <p className="folio">Post {String(i + 1).padStart(2, "0")} · {k.photos.length} photographs</p>
                <div className="mt-4 border border-[var(--line)] bg-paper2 px-5 py-8 sm:px-10 sm:py-12">
                  <PhotoCarousel photos={k.photos} label={k.label} ratio={k.ratio} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}
