import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BatteryCharging, Droplets, PlugZap, Smartphone } from "lucide-react";

const CARDS = [
  { icon: Smartphone, title: "Screen Repair", desc: "Cracked glass and dead pixels for iPhone & Samsung." },
  { icon: BatteryCharging, title: "Batteries", desc: "Same-day swaps for iPhone, Samsung, iPad & MacBook." },
  { icon: PlugZap, title: "Charging Ports", desc: "USB-C, Lightning and micro-USB, repaired or replaced." },
  { icon: Droplets, title: "Water Damage", desc: "Ultrasonic cleaning and board-level rescue." },
];

const EASE = [0.16, 1, 0.3, 1];

export default function ServicesPreview() {
  const reduce = useReducedMotion();
  const fade = (delay) => ({
    initial: reduce ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section className="py-24 md:py-32" data-testid="services-preview">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <motion.div {...fade(0)} className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow" data-testid="services-preview-eyebrow">
              Popular repair services
            </p>
            <h2 className="mt-6 max-w-xl font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-5xl">
              If it has a board, <span className="text-brand-yellow">we fix it.</span>
            </h2>
          </div>
          <Link
            to="/services"
            data-testid="all-services-link"
            className="group inline-flex items-center gap-2 font-sans text-xs font-extrabold uppercase tracking-[0.2em] text-brand-yellow"
          >
            All services
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              {...fade(0.05 + i * 0.06)}
              className="group border border-white/10 bg-brand-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/40"
              data-testid={`preview-card-${i}`}
            >
              <card.icon className="h-6 w-6 text-brand-yellow" />
              <h3 className="mt-7 font-display text-base font-bold uppercase tracking-tight text-white">
                {card.title}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-white/50">{card.desc}</p>
            </motion.div>
          ))}
          <motion.div {...fade(0.3)}>
            <Link
              to="/services"
              data-testid="all-services-card"
              className="group flex h-full min-h-[160px] flex-col justify-between bg-brand-yellow p-7 text-black transition-transform duration-300 hover:-translate-y-1"
            >
              <ArrowRight className="h-6 w-6 -rotate-45 transition-transform group-hover:rotate-0" />
              <p className="font-display text-lg font-black uppercase leading-tight">
                View all services
              </p>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
