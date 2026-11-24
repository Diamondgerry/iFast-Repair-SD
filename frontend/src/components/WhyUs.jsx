import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const POINTS = [
  {
    n: "01",
    title: "Expert technicians",
    desc: "Trained pros on iPhone, Samsung, Google Pixel, iPad, MacBook and more.",
  },
  {
    n: "02",
    title: "Same-day service",
    desc: "Most common repairs — screens and batteries — finished while you wait.",
  },
  {
    n: "03",
    title: "Competitive pricing",
    desc: "Fair quotes up front, no surprise fees. Discounts for multiple repairs.",
  },
  {
    n: "04",
    title: "Warranty-backed parts",
    desc: "Lifetime warranty on screens; 30-day warranty on batteries and parts.",
  },
];

const EASE = [0.16, 1, 0.3, 1];

export default function WhyUs() {
  const reduce = useReducedMotion();
  return (
    <section id="why" className="scroll-mt-24 border-t border-white/10 py-24 md:py-32" data-testid="why-section">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-16 px-5 md:px-10 lg:grid-cols-2">
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
          data-testid="why-visual"
        >
          <div aria-hidden="true" className="absolute inset-0 -translate-x-4 translate-y-4 border-2 border-brand-yellow/50" />
          <div className="relative overflow-hidden border border-white/10">
            <img
              src="https://images.pexels.com/photos/6754839/pexels-photo-6754839.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Technician repairing a smartphone under a microscope"
              className="aspect-[4/5] w-full object-cover contrast-125 grayscale"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
          <div
            className="absolute -bottom-5 right-3 rotate-2 bg-brand-yellow px-4 py-3 text-black"
            data-testid="why-badge-location"
          >
            <p className="font-display text-sm font-black uppercase leading-none">University Heights</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em]">San Diego, CA</p>
          </div>
        </motion.div>

        <div>
          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="eyebrow"
            data-testid="why-eyebrow"
          >
            Why customers choose us
          </motion.p>
          <motion.h2
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            className="mt-6 font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-5xl"
          >
            The last repair shop <span className="text-brand-yellow">you'll need.</span>
          </motion.h2>

          <div className="mt-12 border-t border-white/10">
            {POINTS.map((p, i) => (
              <motion.div
                key={p.n}
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                className="flex gap-6 border-b border-white/10 py-6"
                data-testid={`why-point-${p.n}`}
              >
                <span className="font-mono text-sm text-brand-yellow">{p.n}</span>
                <div>
                  <h3 className="font-sans text-base font-extrabold uppercase tracking-wide text-white">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50 md:text-sm">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            className="mt-10"
          >
            <Link to="/#quote" data-testid="why-cta-button" className="btn-primary group">
              Get a free quote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
