"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/** the library scene loads after the page is interactive (idle time), so it never competes with first paint */
const LibraryScene = dynamic(() => import("./LibraryScene"), { ssr: false });

export default function LibrarySceneLayer() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const go = () => setOn(true);
    if (typeof window.requestIdleCallback === "function") { const id = window.requestIdleCallback(go, { timeout: 1500 }); return () => window.cancelIdleCallback(id); }
    const id = window.setTimeout(go, 300);
    return () => clearTimeout(id);
  }, []);
  return on ? <LibraryScene /> : null;
}
