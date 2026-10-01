"use client";

import { motion, type Variants } from "motion/react";

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045 },
  },
};

const word: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: "0%",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function TextReveal({
  text,
  as = "span",
  className = "",
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  delay?: number;
}) {
  const Component = motion[as as keyof typeof motion] as typeof motion.div;
  const words = text.split(" ");

  // key={text}: when text changes (e.g. a language switch), the per-word
  // spans below get new keys and remount, but whileInView with once:true
  // has already fired and detached on the old instance, so the new word
  // spans would never receive the push to "visible" and stay hidden at
  // y:100% forever. Remounting the whole reveal on text change re-triggers
  // it properly instead.
  return (
    <Component
      key={text}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={container}
      transition={{ delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block overflow-hidden pb-[0.08em]"
        >
          <motion.span className="inline-block" variants={word}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
