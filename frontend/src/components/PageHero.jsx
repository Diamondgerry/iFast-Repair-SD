import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export default function PageHero({ eyebrow, title, accent, sub }) {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden pb-14 pt-36 md:pb-20 md:pt-44">
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-brand-yellow/10 blur-[140px]"
      />
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <motion.p
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="eyebrow"
          data-testid="page-hero-eyebrow"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
          className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-black uppercase leading-[0.98] tracking-tight text-white"
          data-testid="page-hero-title"
        >
          {title} <span className="text-brand-yellow">{accent}</span>
        </motion.h1>
        {sub && (
          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
            className="mt-6 max-w-xl text-sm leading-relaxed text-white/55 md:text-base"
            data-testid="page-hero-sub"
          >
            {sub}
          </motion.p>
        )}
      </div>
    </section>
  );
}
