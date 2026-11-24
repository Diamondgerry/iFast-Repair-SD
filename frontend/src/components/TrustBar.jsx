import { motion, useReducedMotion } from "framer-motion";
import { CircleDollarSign, Wrench, Zap, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: CircleDollarSign, title: "Competitive Pricing", desc: "Fair rates, quoted up front." },
  { icon: Wrench, title: "Expert Technicians", desc: "iPhone, Samsung, iPad, MacBook & more." },
  { icon: Zap, title: "Same-Day Repairs", desc: "Most fixes done while you wait." },
  { icon: ShieldCheck, title: "Lifetime Warranty", desc: "On screens. 30 days on batteries." },
];

const Reveal = ({ children, delay }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default function TrustBar() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10" data-testid="trust-bar">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.08}>
            <div
              className="group h-full border border-white/10 bg-brand-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/40"
              data-testid={`trust-card-${i}`}
            >
              <div className="flex items-center justify-between">
                <item.icon className="h-6 w-6 text-brand-yellow" />
                <span className="font-mono text-xs text-white/30">0{i + 1}</span>
              </div>
              <h3 className="mt-8 font-display text-base font-bold uppercase tracking-tight text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-white/50">{item.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
