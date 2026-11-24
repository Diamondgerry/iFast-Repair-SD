import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, CircleDollarSign, RefreshCcw } from "lucide-react";
import PageHero from "@/components/PageHero";
import SellForm from "@/components/SellForm";
import CtaStrip from "@/components/CtaStrip";

const POINTS = [
  {
    icon: BadgeCheck,
    title: "Any condition",
    desc: "Cracked, slow, water-damaged or dead — we still buy it.",
  },
  {
    icon: CircleDollarSign,
    title: "Fair cash offers",
    desc: "Straight offers by text, paid on the spot in the shop.",
  },
  {
    icon: RefreshCcw,
    title: "Trade it in",
    desc: "Put the value toward a repair or your next device.",
  },
];

const EASE = [0.16, 1, 0.3, 1];

export default function SellPage() {
  const reduce = useReducedMotion();
  const fade = (delay) => ({
    initial: reduce ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <>
      <PageHero
        eyebrow="Sell your phone"
        title="Turn your phone into"
        accent="cash."
        sub="Tell us what you've got — model, storage, condition — and we'll text you a cash offer. No listings, no shipping, no waiting."
      />
      <section className="pb-24 md:pb-32" data-testid="sell-section">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <motion.h2
              {...fade(0)}
              className="font-display text-2xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-4xl"
              data-testid="sell-how-title"
            >
              How it <span className="text-brand-yellow">works.</span>
            </motion.h2>
            <div className="mt-10 border-t border-white/10">
              {POINTS.map((p, i) => (
                <motion.div
                  key={p.title}
                  {...fade(0.08 + i * 0.08)}
                  className="flex gap-6 border-b border-white/10 py-6"
                  data-testid={`sell-point-${i}`}
                >
                  <p.icon className="h-6 w-6 shrink-0 text-brand-yellow" />
                  <div>
                    <h3 className="font-sans text-base font-extrabold uppercase tracking-wide text-white">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/50 md:text-sm">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <SellForm />
        </div>
      </section>
      <CtaStrip />
    </>
  );
}
