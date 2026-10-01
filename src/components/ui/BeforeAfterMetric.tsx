"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { NumberTicker } from "@/components/ui/NumberTicker";

export function BeforeAfterMetric({
  before,
  after,
  deltaValue,
  deltaPrefix = "-",
  deltaSuffix = "%",
}: {
  before: string;
  after: string;
  deltaValue: number;
  deltaPrefix?: string;
  deltaSuffix?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref}>
      <div className="relative h-9 overflow-hidden">
        <motion.p
          initial={{ opacity: 1, y: 0 }}
          animate={inView ? { opacity: 0, y: -16 } : {}}
          transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 text-2xl font-semibold tracking-tight text-muted line-through decoration-signal/50"
        >
          {before}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 text-3xl font-semibold tracking-tight text-ink"
        >
          {after}
        </motion.p>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 1.1, duration: 0.3 }}
        className="mt-1 font-mono text-[12px] text-modus"
      >
        {inView && (
          <NumberTicker value={deltaValue} prefix={deltaPrefix} suffix={deltaSuffix} />
        )}
      </motion.p>
    </div>
  );
}
