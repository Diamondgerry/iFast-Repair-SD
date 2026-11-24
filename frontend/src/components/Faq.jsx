import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What devices do you repair?",
    a: "iFast Repair+ works on iPhones, Samsung Galaxy phones, Google Pixels, Motorolas, iPads, tablets, MacBooks, laptops, Apple Watches and select game consoles. Not sure about your model? Send a quote request or just walk in.",
  },
  {
    q: "What types of repairs do you offer?",
    a: "Cracked displays, battery replacements, charging ports, cameras, speakers, back glass, water damage and board-level diagnostics. If a device won't power on, keeps restarting or won't charge, bring it in — we'll run a diagnostic, explain the problem and quote the repair before any work starts.",
  },
  {
    q: "Do you offer warranties?",
    a: "Yes. Screens carry a lifetime warranty covering manufacturer defects (excluding physical or liquid damage). Batteries and other parts carry a 30-day warranty.",
  },
  {
    q: "Do I need an appointment for a repair?",
    a: "Walk-ins are always welcome at 3689 University Ave. Want a guaranteed slot? Use the Book an Appointment form on our Book page — we'll confirm by text or call. On a tight schedule, call ahead for wait times and parts availability.",
  },
  {
    q: "My device has multiple issues. Any discounts?",
    a: "Yes — we offer discounts for multiple repairs on the same device. Ask for a combined quote and we'll make it worth your while.",
  },
  {
    q: "Where are you located?",
    a: "iFast Repair+ is at 3689 University Ave, San Diego, CA 92104 — in University Heights, minutes from North Park, Hillcrest, Mission Hills, La Mesa and greater San Diego.",
  },
];

const EASE = [0.16, 1, 0.3, 1];

export default function Faq() {
  const [open, setOpen] = useState(0);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="scroll-mt-24 py-24 md:py-32" data-testid="faq-section">
      <div className="mx-auto max-w-3xl px-5 md:px-10">
        <motion.p
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="eyebrow"
          data-testid="faq-eyebrow"
        >
          FAQ
        </motion.p>
        <motion.h2
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
          className="mt-6 font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-5xl"
        >
          Questions, <span className="text-brand-yellow">answered.</span>
        </motion.h2>

        <div className="mt-12 border-t border-white/10">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-white/10" data-testid={`faq-item-${i}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  data-testid={`faq-toggle-${i}`}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className={`font-sans text-sm font-extrabold uppercase tracking-wide transition-colors md:text-base ${
                      isOpen ? "text-brand-yellow" : "text-white"
                    }`}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-brand-yellow" : "text-white/40"
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 text-xs leading-relaxed text-white/55 md:text-sm">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
