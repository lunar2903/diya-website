import type { Metadata } from "next";
import { Flourish } from "@/components/Ambience";
import Bookshelf from "@/components/Bookshelf";

export const metadata: Metadata = { title: "The Library", description: "Browse Diya Shah's projects as a shelf of art books." };

export default function WorkPage() {
  return (
    <>
      <section className="wrap pt-6 pb-10 relative">
        <p className="folio">Chapter II · The library</p>
        <h1 className="display text-[clamp(3.2rem,9vw,7.5rem)] mt-3">Between the pages</h1>
        <p className="mt-5 max-w-xl text-muted">A shelf of art books, one per project. Pick one up to open it. Two books are real work; the other four are fictional placeholders.</p>
      </section>
      <Flourish />
      <Bookshelf />
    </>
  );
}
