import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Phone, ShieldCheck } from "lucide-react";
import { Bolt } from "@/components/Logo";

const EASE = [0.16, 1, 0.3, 1];

const Line = ({ children, delay, reduce }) => (
  <span className="block overflow-hidden">
    <motion.span
      className="block"
      initial={reduce ? { y: 0 } : { y: "110%" }}
      animate={reduce ? { y: 0 } : { y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  </span>
);

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const rxv = useMotionValue(0);
  const ryv = useMotionValue(0);
  const rx = useSpring(rxv, { stiffness: 120, damping: 16 });
  const ry = useSpring(ryv, { stiffness: 120, damping: 16 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const badgeY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rxv.set(-py * 8);
    ryv.set(px * 10);
  };
  const onLeave = () => {
    rxv.set(0);
    ryv.set(0);
  };

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-44">
      <div
        aria-hidden="true"
        className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-yellow/10 blur-[140px]"
      />
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-14 px-5 md:px-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
            className="eyebrow"
            data-testid="hero-eyebrow"
          >
            3689 University Ave — San Diego, CA
          </motion.p>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,7.5vw,6.5rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            <Line delay={0.1} reduce={reduce}>
              Broken today.
            </Line>
            <Line delay={0.24} reduce={reduce}>
              Fixed in <span className="text-brand-yellow">minutes.</span>
            </Line>
          </h1>
          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
            className="mt-8 max-w-xl text-sm leading-relaxed text-white/60 md:text-base"
            data-testid="hero-subline"
          >
            iPhone, Samsung, iPad, MacBook &amp; more — screens, batteries, charging ports, water
            damage and board-level repair. Walk in with a problem, walk out with a fix.
          </motion.p>
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.58, ease: EASE }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a href="#quote" data-testid="hero-cta-button" className="btn-primary group">
              Get a free quote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="tel:6196211111" data-testid="hero-call-link" className="btn-ghost">
              <Phone className="h-4 w-4" />
              (619) 621-1111
            </a>
          </motion.div>
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50"
            data-testid="hero-trust-chips"
          >
            <span className="flex items-center gap-2">
              <Bolt className="h-3 w-3" fill="#FFDE00" /> Walk-ins welcome
            </span>
            <span className="flex items-center gap-2">
              <Bolt className="h-3 w-3" fill="#FFDE00" /> Same-day repairs
            </span>
            <span className="flex items-center gap-2">
              <Bolt className="h-3 w-3" fill="#FFDE00" /> Warranty-backed parts
            </span>
          </motion.div>
        </div>

        <div className="lg:col-span-5">
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="relative mx-auto max-w-md lg:max-w-none"
            data-testid="hero-visual"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-4 translate-y-4 border-2 border-brand-yellow/50"
            />
            <motion.div
              style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformPerspective: 1000 }}
              className="relative border border-white/10 bg-brand-surface"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <motion.img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Macro view of a circuit board being repaired"
                  style={{ y: imgY, scale: 1.15 }}
                  className="h-full w-full object-cover contrast-125 grayscale"
                  data-testid="hero-image"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              </div>
              <div aria-hidden="true" className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-brand-yellow" />
              <div aria-hidden="true" className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-brand-yellow" />
            </motion.div>
            <motion.div
              style={{ y: badgeY }}
              className="absolute -right-3 -top-5 rotate-3 bg-brand-yellow px-4 py-3 text-black md:-right-6"
              data-testid="hero-badge-sameday"
            >
              <p className="font-display text-sm font-black uppercase leading-none">Same-day</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em]">most repairs</p>
            </motion.div>
            <div
              className="absolute -bottom-5 -left-3 flex items-center gap-3 border border-white/10 bg-black/85 px-4 py-3 backdrop-blur md:-left-6"
              data-testid="hero-badge-warranty"
            >
              <ShieldCheck className="h-5 w-5 text-brand-yellow" />
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white">Lifetime warranty</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">on screen repairs</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
