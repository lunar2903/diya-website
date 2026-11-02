"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/data/site";

export default function Nav() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href) || (href === "/work" && path.startsWith("/projects")));
  return (
    <header className="relative z-40">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5">
        <Link href="/" className="display text-2xl">{site.name}</Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-5 sm:gap-8 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined}
                  className={`py-2 border-b transition-colors duration-200 ${active(n.href) ? "border-ink" : "border-transparent text-muted hover:text-ink"}`}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
