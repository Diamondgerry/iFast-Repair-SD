import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BatteryCharging,
  PlugZap,
  Droplets,
  Tablet,
  Laptop,
  Cpu,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const Reveal = ({ children, delay = 0, className }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

const QuoteLink = () => (
  <Link
    to="/#quote"
    data-testid="service-quote-link"
    className="mt-6 inline-flex items-center gap-2 font-sans text-xs font-extrabold uppercase tracking-[0.2em] text-brand-yellow"
  >
    Get a quote
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  </Link>
);

const IconCard = ({ icon: Icon, title, desc, className }) => (
  <div
    className={`group border border-white/10 bg-brand-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/40 md:p-10 ${className || ""}`}
  >
    <Icon className="h-7 w-7 text-brand-yellow" />
    <h3 className="mt-8 font-display text-lg font-bold uppercase leading-tight tracking-tight text-white">
      {title}
    </h3>
    <p className="mt-3 text-xs leading-relaxed text-white/50 md:text-sm">{desc}</p>
    <QuoteLink />
  </div>
);

export default function Services() {
  return (
    <section id="services" className="scroll-mt-24 py-24 md:py-32" data-testid="services-section">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal>
          <p className="eyebrow" data-testid="services-eyebrow">
            Popular repair services
          </p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-2xl font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-5xl">
              If it has a board, <span className="text-brand-yellow">we fix it.</span>
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/50">
              Diagnostics quoted up front, honest pricing and same-day service on most repairs —
              walk-ins welcome.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12">
          <Reveal className="md:col-span-7 md:row-span-2" delay={0.05}>
            <div className="group relative h-full min-h-[340px] overflow-hidden border border-white/10 md:min-h-[460px]">
              <img
                src="https://images.pexels.com/photos/288479/pexels-photo-288479.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Phone screen repair"
                className="absolute inset-0 h-full w-full object-cover contrast-125 grayscale transition duration-700 group-hover:grayscale-0"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
                <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-white md:text-3xl">
                  Phone screen repair
                </h3>
                <p className="mt-3 max-w-md text-xs leading-relaxed text-white/60 md:text-sm">
                  Cracked glass, dead pixels, touch issues — premium and aftermarket options for
                  iPhone &amp; Samsung, installed same day.
                </p>
                <QuoteLink />
              </div>
            </div>
          </Reveal>

          <Reveal className="md:col-span-5" delay={0.1}>
            <IconCard
              icon={BatteryCharging}
              title="Battery Replacement"
              desc="True battery health restored — iPhone, Samsung, iPad & MacBook batteries swapped in under an hour."
              className="h-full"
            />
          </Reveal>

          <Reveal className="md:col-span-5" delay={0.15}>
            <IconCard
              icon={PlugZap}
              title="Charging Ports"
              desc="No charge? Loose fit? We clean, repair or replace USB-C, Lightning & micro-USB ports."
              className="h-full"
            />
          </Reveal>

          <Reveal className="md:col-span-4" delay={0.05}>
            <IconCard
              icon={Droplets}
              title="Water Damage"
              desc="Dunked? Power it off and bring it straight in — ultrasonic cleaning and board-level rescue."
              className="h-full"
            />
          </Reveal>

          <Reveal className="md:col-span-4" delay={0.1}>
            <IconCard
              icon={Tablet}
              title="Tablets & iPads"
              desc="Screens, batteries and ports for iPad, Galaxy Tab, Kindle and more."
              className="h-full"
            />
          </Reveal>

          <Reveal className="md:col-span-4" delay={0.15}>
            <IconCard
              icon={Laptop}
              title="MacBooks & Laptops"
              desc="Displays, batteries, keyboards and liquid damage for Apple and PC laptops."
              className="h-full"
            />
          </Reveal>

          <Reveal className="md:col-span-12" delay={0.05}>
            <div className="group relative min-h-[300px] overflow-hidden border border-white/10">
              <img
                src="https://images.pexels.com/photos/6755075/pexels-photo-6755075.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Technician performing board-level repair"
                className="absolute inset-0 h-full w-full object-cover contrast-125 grayscale transition duration-700 group-hover:grayscale-0"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="relative flex h-full min-h-[300px] max-w-xl flex-col justify-end p-8 md:p-10">
                <Cpu className="h-7 w-7 text-brand-yellow" />
                <h3 className="mt-6 font-display text-2xl font-black uppercase leading-tight tracking-tight text-white">
                  Board-level &amp; data recovery
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-white/60 md:text-sm">
                  Microsoldering, motherboard diagnostics and data recovery when it matters most.
                </p>
                <QuoteLink />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
