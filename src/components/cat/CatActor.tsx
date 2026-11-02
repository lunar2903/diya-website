"use client";
import { useRef } from "react";
import CatRig from "./CatRig";
import { useCatBrain } from "./useCatBrain";
import type { CatState } from "./catMachine";
import type { Coat } from "./coats";

/**
 * A cat that stays where it was put (on the hero book, on the shelf) but has the same living brain as the
 * companion: weighted random states, constant breathing and blinking, cursor tracking. `flip` mirrors it.
 */
export default function CatActor({ coat, flip = false, label, start, light, allow, hangTail = false, pose, className = "" }: {
  coat: Coat; flip?: boolean; label?: string; start?: CatState[]; light?: number; allow?: CatState[]; hangTail?: boolean; pose?: "sit" | "sleep" | "loaf"; className?: string;
}) {
  const rig = useRef<SVGSVGElement>(null);
  useCatBrain(rig, { roam: false, face: flip ? -1 : 1, start, light, allow });
  return (
    <div style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <CatRig ref={rig} coat={coat} label={label} className={className} hangTail={hangTail} pose={pose} />
    </div>
  );
}
