"use client";
import { useRef, useState } from "react";
import CatRig from "./CatRig";
import { useCatBrain } from "./useCatBrain";
import type { PerchName } from "./catMachine";
import type { Coat } from "./coats";

/**
 * The page-wide companion. One instance, fixed to the bottom of the viewport; it walks between perches and sits on
 * the cushion / shelf / book stack drawn under it. All behaviour lives in useCatBrain.ts + catMachine.ts.
 */
export default function CatCompanion({ coat = "cream" }: { coat?: Coat }) {
  const box = useRef<HTMLDivElement>(null);
  const rig = useRef<SVGSVGElement>(null);
  const [prop, setProp] = useState<PerchName | null>("ledge"); // the cushion / shelf drawn under the cat
  useCatBrain(rig, { roam: true, wrap: box, onProp: setProp });
  return (
    <div ref={box} className="cat-companion" aria-hidden>
      {prop && <div className={`cat-prop cat-prop-${prop}`}><i /><i /><i /></div>}
      <div className="cat-figure"><CatRig ref={rig} coat={coat} /></div>
    </div>
  );
}
