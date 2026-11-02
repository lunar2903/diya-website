"use client";
import dynamic from "next/dynamic";

/** the living cat is loaded lazily, after the page itself */
const CatCompanion = dynamic(() => import("./CatCompanion"), { ssr: false });

/** the site has one cat, the cream fluffy one, so the companion matches every other cat on the page */
export default function CatLayer() {
  return <CatCompanion coat="cream" />;
}
