"use client";
import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay, ease: [0.22, 0.8, 0.28, 1] }}>
      {children}
    </motion.div>
  );
}

/** curtain-style reveal: the frame rises and is uncovered as it scrolls into view (never fully clipped, so lazy media still loads) */
export function Wipe({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const still = useReducedMotion();
  return (
    <motion.div className={className} initial={still ? false : { opacity: 0, clipPath: "inset(14% 0 0 0)", y: 40 }} whileInView={{ opacity: 1, clipPath: "inset(0% 0 0 0)", y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, delay, ease: [0.22, 0.8, 0.28, 1] }}>
      {children}
    </motion.div>
  );
}

/** gentle sideways drift tied to scroll position; static under reduced motion */
export function Drift({ children, by = 40, className = "" }: { children: ReactNode; by?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [by, -by]);
  return <div ref={ref} className={className}><motion.div style={still ? undefined : { x }}>{children}</motion.div></div>;
}
