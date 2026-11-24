import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Facebook, Instagram } from "lucide-react";

const FB_URL = "https://www.facebook.com/p/IFast-S-d-100065151693460/";
const IG_URL = "https://www.instagram.com/ifastrepair1904/";
const EASE = [0.16, 1, 0.3, 1];

const CARDS = [
  {
    icon: Facebook,
    name: "Facebook",
    handle: "iFast S-d",
    desc: "Before-and-afters, repair clips and shop updates on our Facebook page.",
    href: FB_URL,
  },
  {
    icon: Instagram,
    name: "Instagram",
    handle: "@ifastrepair1904",
    desc: "New stock drops, deals and behind-the-scenes fixes on Instagram.",
    href: IG_URL,
  },
];

export default function SocialSection() {
  const reduce = useReducedMotion();
  const fade = (delay) => ({
    initial: reduce ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section
      id="social"
      className="scroll-mt-24 border-t border-white/10 py-24 md:py-32"
      data-testid="social-section"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <motion.p {...fade(0)} className="eyebrow" data-testid="social-eyebrow">
          Social media
        </motion.p>
        <motion.h2
          {...fade(0.08)}
          className="mt-6 max-w-xl font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-5xl"
        >
          Follow <span className="text-brand-yellow">the fix.</span>
        </motion.h2>
        <motion.p {...fade(0.14)} className="mt-6 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
          Repair videos, before-and-afters, deals and restocks — it all lands on our Facebook and
          Instagram first. Give us a follow.
        </motion.p>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.name}
              {...fade(0.05 + i * 0.08)}
              className="group border border-white/10 bg-brand-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/40 md:p-10"
              data-testid={`social-card-${i}`}
            >
              <div className="flex items-start justify-between">
                <card.icon className="h-8 w-8 text-brand-yellow" />
                <ArrowUpRight className="h-5 w-5 text-white/30 transition-colors group-hover:text-brand-yellow" />
              </div>
              <h3 className="mt-8 font-display text-xl font-black uppercase tracking-tight text-white md:text-2xl">
                {card.name}
              </h3>
              <p className="mt-1 font-mono text-sm text-brand-yellow">{card.handle}</p>
              <p className="mt-3 text-xs leading-relaxed text-white/50 md:text-sm">{card.desc}</p>
              <a
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`social-open-${i}`}
                className="mt-7 inline-flex items-center gap-2 border border-brand-yellow px-5 py-2.5 font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-black"
              >
                Open {card.name}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div {...fade(0.2)} className="mt-16" data-testid="facebook-feed">
          <div className="flex items-center gap-3">
            <Facebook className="h-5 w-5 text-brand-yellow" />
            <h3 className="font-sans text-xs font-extrabold uppercase tracking-[0.25em] text-brand-yellow">
              Latest from our Facebook
            </h3>
          </div>
          <div className="mx-auto mt-8 max-w-[500px] border border-white/10 bg-brand-surface p-2">
            <iframe
              title="iFast Repair+ on Facebook"
              src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(FB_URL)}&tabs=timeline&width=500&height=720&small_header=false&adapt_container_width=true&hide_cover=false&theme=dark`}
              width="500"
              height="720"
              style={{ border: "none", overflow: "hidden", width: "100%" }}
              loading="lazy"
              allow="encrypted-media"
              data-testid="facebook-embed"
            />
          </div>
        </motion.div>

        <motion.div {...fade(0.25)} className="mt-16" data-testid="instagram-block">
          <div className="flex items-center gap-3">
            <Instagram className="h-5 w-5 text-brand-yellow" />
            <h3 className="font-sans text-xs font-extrabold uppercase tracking-[0.25em] text-brand-yellow">
              On Instagram
            </h3>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border border-white/10 bg-brand-surface p-8 md:p-10">
            <div>
              <p className="font-display text-xl font-black uppercase text-white">@ifastrepair1904</p>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-white/50 md:text-sm">
                Fresh restocks, price drops and repair videos — follow us so you don't miss a deal.
              </p>
            </div>
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="instagram-open-button"
              className="btn-primary"
            >
              Open Instagram
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
