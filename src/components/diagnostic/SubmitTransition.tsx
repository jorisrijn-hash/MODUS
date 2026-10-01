"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { LogoMark } from "@/components/ui/Logo";
import { useDict } from "@/lib/i18n/context";

export function SubmitTransition({ onDone }: { onDone: () => void }) {
  const dict = useDict();
  const t = dict.diagnosticSubmitTransition;
  const labels = [t.buildingProfile, t.identifyingSignals, t.profileReady];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t1 = window.setTimeout(() => setIndex(1), 450);
    const t2 = window.setTimeout(() => setIndex(2), 950);
    const t3 = window.setTimeout(onDone, 1450);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <motion.div
        animate={{ rotate: [0, 90, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <LogoMark className="h-8 w-8" />
      </motion.div>
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
      >
        {labels[index]}
      </motion.p>
    </div>
  );
}
