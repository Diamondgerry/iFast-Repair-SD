import { motion, useReducedMotion } from "framer-motion";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=3689+University+Ave+San+Diego+CA+92104";

const CARDS = [
  {
    icon: MapPin,
    title: "Address",
    lines: ["3689 University Ave", "San Diego, CA 92104"],
    link: { label: "Get directions", href: MAPS_URL, external: true },
  },
  {
    icon: Clock,
    title: "Hours",
    lines: ["Mon – Fri: 8:00 AM – 5:00 PM", "Saturday: 9:00 AM – 3:00 PM", "Sunday: Closed"],
  },
  {
    icon: Phone,
    title: "Contact",
    lines: ["(619) 621-1111", "primephoneparts619@gmail.com", "Walk-ins welcome"],
    link: { label: "Call the shop", href: "tel:6196211111" },
    email: "primephoneparts619@gmail.com",
  },
];

export default function Visit() {
  const reduce = useReducedMotion();
  const fade = (delay) => ({
    initial: reduce ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section className="py-24 md:py-32" data-testid="visit-section">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <motion.p {...fade(0)} className="eyebrow" data-testid="visit-eyebrow">
          Visit the shop
        </motion.p>
        <motion.h2
          {...fade(0.08)}
          className="mt-6 font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-5xl"
        >
          Come say <span className="text-brand-yellow">hi.</span>
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <motion.div {...fade(0.12)} className="flex flex-col gap-5">
            {CARDS.map((card, i) => (
              <div
                key={card.title}
                className="border border-white/10 bg-brand-surface p-8"
                data-testid={`visit-card-${i}`}
              >
                <div className="flex items-center gap-3">
                  <card.icon className="h-5 w-5 text-brand-yellow" />
                  <h3 className="font-sans text-xs font-extrabold uppercase tracking-[0.25em] text-brand-yellow">
                    {card.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  {card.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                {card.link && (
                  <a
                    href={card.link.href}
                    target={card.link.external ? "_blank" : undefined}
                    rel={card.link.external ? "noopener noreferrer" : undefined}
                    data-testid={`visit-link-${i}`}
                    className="mt-4 inline-block font-sans text-xs font-extrabold uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-brand-yellow"
                  >
                    {card.link.label} →
                  </a>
                )}
                {card.email && (
                  <a
                    href={`mailto:${card.email}`}
                    data-testid="visit-email-link"
                    className="ml-8 inline-block break-all font-mono text-xs text-white/60 transition-colors hover:text-brand-yellow"
                  >
                    <Mail className="mr-2 inline h-3.5 w-3.5 text-brand-yellow" />
                    {card.email}
                  </a>
                )}
              </div>
            ))}
          </motion.div>

          <motion.div
            {...fade(0.18)}
            className="relative border border-white/10 bg-brand-surface"
            data-testid="visit-map"
          >
            <iframe
              title="iFast Repair+ on the map — 3689 University Ave, San Diego, CA 92104"
              src="https://www.google.com/maps?q=3689%20University%20Ave%2C%20San%20Diego%2C%20CA%2092104&output=embed"
              className="aspect-[4/3] w-full lg:h-full lg:min-h-[480px]"
              loading="lazy"
            />
            <div aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-brand-yellow" />
            <div aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-brand-yellow" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
