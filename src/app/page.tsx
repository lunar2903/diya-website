import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/Hero";
import { Flourish } from "@/components/Ambience";
import Cat from "@/components/Cat";
import { Reveal } from "@/components/Motion";

// the author photo is dropped into /public as diya-photo-1.(jpg|jpeg|png|webp)
const photo = ["jpg", "jpeg", "png", "webp"].map((e) => `/diya-photo-1.${e}`).find((p) => fs.existsSync(path.join(process.cwd(), "public", p)));

export default function Home() {
  return (
    <>
      <Hero photo={photo} />

      <Flourish />
      <section className="wrap pt-2 pb-8">
        <Reveal className="relative bg-paper2 px-6 py-16 md:py-24 text-center overflow-hidden">
          <p className="folio">Closing note</p>
          <h2 className="display text-5xl md:text-7xl mt-4 max-w-3xl mx-auto">Take a book off the shelf.</h2>
          <p className="mt-5 text-muted">Every page here is an invitation to look a little closer.</p>
          <Link href="/work" className="mt-8 inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 text-sm tracking-[0.12em] transition-transform hover:-translate-y-0.5">EXPLORE THE LIBRARY <ArrowRight className="size-4" aria-hidden /></Link>
          <div className="mx-auto mt-10 w-40"><Cat variant="sitting" coat="cream" live allow={["sitting", "stretching", "yawning", "slowBlinking", "grooming", "walking"]} start={["sitting", "stretching"]} title="A cream cat stretching and settling by the closing note" /></div>
        </Reveal>
      </section>
    </>
  );
}
