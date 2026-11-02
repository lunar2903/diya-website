"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

// Re-mounts on every navigation: a short, non-blocking page-turn fade.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 0.8, 0.28, 1] }}>
      {children}
    </motion.div>
  );
}
