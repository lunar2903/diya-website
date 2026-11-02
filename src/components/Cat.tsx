import CatRig from "./cat/CatRig";
import CatActor from "./cat/CatActor";
import CatCurled from "./cat/CatCurled";
import CatPatrol from "./cat/CatPatrol";
import CatPeek from "./cat/CatPeek";
import type { CatState } from "./cat/catMachine";
import type { Coat } from "./cat/coats";

/** "patrol" strolls along a ledge; "peek" rises from behind a stack of books. ("walking" / "peeking" are retired and render nothing.) */
export type CatVariant = "walking" | "peeking" | "sleeping" | "sitting" | "stretching" | "patrol" | "peek";

/**
 * Decorative cat used in a few fixed spots (hero, shelf, footer, contact, about). Each spot has its own coat
 * (see cat/coats.ts): ginger on the hero book, silver on the shelf, a cream Persian curled on the book stack.
 *  - `live`   gives it the full behaviour brain (same states as the companion, without walking)
 *  - `curled` draws the curled-up sleeper instead of the loaf
 *  - `lite`   drops the fur filters (tiny cats, e.g. inside book covers)
 * The roaming cat is <CatCompanion />. The old cartoon variants that need motion across the page are retired.
 */
export default function Cat({ variant = "sitting", className = "", title, coat, live = false, flip = false, curled = false, lite = false, allow, start, hangTail = false }: {
  variant?: CatVariant; className?: string; tint?: string; title?: string; coat?: Coat; live?: boolean; flip?: boolean; curled?: boolean; lite?: boolean; allow?: CatState[]; start?: CatState[]; hangTail?: boolean;
}) {
  if (variant === "patrol") return <CatPatrol coat={coat ?? "cream"} className={className} />;
  if (variant === "peek") return <CatPeek coat={coat ?? "cream"} flip={flip} className={className} />;
  if (variant !== "sitting" && variant !== "sleeping") return null;
  const sleeping = variant === "sleeping";
  const c: Coat = coat ?? "cream";
  if (curled) return <CatCurled coat={c} label={title} className={className} />;
  if (live) return <CatActor coat={c} flip={flip} label={title} className={className} start={start ?? (sleeping ? ["sleeping", "loafing"] : ["sitting", "loafing", "sitting"])} allow={allow} hangTail={hangTail} pose={sleeping ? "sleep" : "sit"} />;
  return <div style={flip ? { transform: "scaleX(-1)" } : undefined}><CatRig pose={sleeping ? "sleep" : "sit"} coat={c} lite={lite} className={className} label={title} /></div>;
}
