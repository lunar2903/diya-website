import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Cat from "@/components/Cat";
import { Reveal } from "@/components/Motion";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with Diya Shah." };

export default function ContactPage() {
  return (
    <section className="wrap pt-6 grid gap-12 lg:grid-cols-[7fr_5fr] items-center min-h-[60vh]">
      <Reveal>
        <p className="folio">Last chapter · Contact</p>
        <h1 className="display text-[clamp(3rem,8vw,7rem)] mt-3 !leading-[1.02]">Can&apos;t wait to add your story to my shelf</h1>
        {/* plain links, no form or backend: each opens the visitor's own app */}
        <ul className="mt-10 max-w-md">
          {[
            { k: "Email", v: site.email, href: `mailto:${site.email}`, ext: false },
            { k: "Phone", v: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}`, ext: false },
            ...site.socials.map((x) => ({ k: x.label, v: x.label, href: x.href, ext: true })),
          ].map((r) => (
            <li key={r.k} className="rule">
              <a href={r.href} {...(r.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-baseline gap-4 py-4 hover:text-[var(--amber-glow)] transition-colors">
                <span className="folio w-24 shrink-0">{r.k}</span>
                <span className="display text-2xl flex-1 break-all">{r.v}</span>
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">{r.ext ? "↗" : "→"}</span>
              </a>
            </li>
          ))}
        </ul>
        <Link href="/work" className="mt-10 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" aria-hidden />Back to the library</Link>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="mx-auto max-w-sm">
          <div className="w-full"><Cat variant="sleeping" coat="cream" curled title="A cream Persian curled up asleep on a stack of books" /></div>
          <div className="-mt-2 space-y-0.5" aria-hidden>
            {[["var(--sage)", "92%"], ["var(--rose)", "100%"], ["var(--ochre)", "84%"]].map(([c, w], i) => (
              <div key={i} className="h-9 mx-auto border border-ink/60" style={{ background: c, width: w, transform: `translateX(${(i - 1) * 6}px)` }} />
            ))}
          </div>
          <div className="mx-auto w-32"><Cat variant="peek" coat="cream" flip /></div>
        </div>
      </Reveal>
    </section>
  );
}
