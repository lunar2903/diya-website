import type { Metadata } from "next";
import { Cormorant_Garamond, Playfair_Display, EB_Garamond, DM_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Motion";
import ScrollAudio from "@/components/ScrollAudio";
import { Bulbs, Dust } from "@/components/Ambience";
import AnimatedFavicon from "@/components/AnimatedFavicon";
import CatLayer from "@/components/cat/CatLayer";
import LibrarySceneLayer from "@/components/library/LibrarySceneLayer";
import { site } from "@/data/site";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-playfair", display: "swap" });
const body = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-body", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${site.name} — Between the Pages`, template: `%s — ${site.name}` },
  description: site.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${playfair.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-paper focus:p-3">Skip to content</a>
          <ScrollAudio />
          <LibrarySceneLayer />
          <Bulbs />
          <Dust />
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <CatLayer />
          <AnimatedFavicon />
        </Providers>
      </body>
    </html>
  );
}
