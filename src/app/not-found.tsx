import Link from "next/link";
import Cat from "@/components/Cat";

export default function NotFound() {
  return (
    <section className="wrap py-24 text-center">
      <div className="mx-auto w-32"><Cat variant="sitting" title="A confused cat" /></div>
      <h1 className="display text-6xl mt-6">This page is missing.</h1>
      <p className="text-muted mt-3">The book you wanted isn&apos;t on this shelf.</p>
      <Link href="/work" className="inline-block mt-8 bg-ink text-paper px-6 py-3 text-sm">Back to the library</Link>
    </section>
  );
}
