"use client";
import Link from "next/link";
import { useState } from "react";
import Cat from "./Cat";
import { nav, site } from "@/data/site";

export default function Footer() {
  const [purr, setPurr] = useState(false);
  return (
    <footer className="mt-24 relative">
      <div aria-hidden className="rug-strip" />
      <div className="wrap py-12 grid gap-10 md:grid-cols-[1fr_auto_1fr] items-end">
        <div>
          <p className="display text-3xl">{site.name}</p>
          <p className="folio mt-2">{site.role}</p>
        </div>
        <div className="flex flex-col items-center gap-2 order-first md:order-none">
          <button type="button" onClick={() => setPurr((v) => !v)} aria-label="Pet the cat" aria-expanded={purr} className="w-24 cursor-pointer">
            <Cat variant="sitting" title="A small ink cat sitting beside the footer" />
          </button>
          <p className="folio h-4 text-center" role="status">{purr ? "prrrr… the cat approves of this portfolio." : ""}</p>
        </div>
        <div className="md:text-right">
          <ul className="flex md:justify-end gap-5 text-sm">
            {nav.slice(1).map((n) => <li key={n.href}><Link href={n.href} className="hover:underline underline-offset-4">{n.label}</Link></li>)}
          </ul>
          <p className="folio mt-4">© {new Date().getFullYear()} {site.name} · Sample content is placeholder</p>
        </div>
      </div>
    </footer>
  );
}
