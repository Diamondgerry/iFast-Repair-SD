import { motion, useReducedMotion } from "framer-motion";
import { RefreshCcw, Smartphone, Wrench } from "lucide-react";
import PageHero from "@/components/PageHero";
import BuyForm from "@/components/BuyForm";
import CtaStrip from "@/components/CtaStrip";

const POINTS = [
  {
    icon: Wrench,
    title: "Tested before sale",
    desc: "Every device is checked and fully working before it leaves the shop.",
  },
  {
    icon: Smartphone,
    title: "iPhones, Galaxies & more",
    desc: "Flagships to budget models — in stock or sourced to order.",
  },
  {
    icon: RefreshCcw,
    title: "Trade in to save",
    desc: "Bring your old phone and put its value toward the price.",
  },
];

const EASE = [0.16, 1, 0.3, 1];

export default function BuyPage() {
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
        eyebrow="Buy a phone"
        title="Tested phones,"
        accent="honest prices."
        sub="Tell us what you're after and we'll text you what's available with a straight price. No games, no haggling."
      />
      <section className="pb-24 md:pb-32" data-testid="buy-section">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <motion.h2
              {...fade(0)}
              className="font-display text-2xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-4xl"
              data-testid="buy-how-title"
            >
              Why buy <span className="text-brand-yellow">from us.</span>
            </motion.h2>
            <div className="mt-10 border-t border-white/10">
              {POINTS.map((p, i) => (
                <motion.div
                  key={p.title}
                  {...fade(0.08 + i * 0.08)}
                  className="flex gap-6 border-b border-white/10 py-6"
                  data-testid={`buy-point-${i}`}
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
          <BuyForm />
        </div>
      </section>
      <CtaStrip />
    </>
  );
}
