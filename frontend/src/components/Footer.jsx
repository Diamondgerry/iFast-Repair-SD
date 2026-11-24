import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=3689+University+Ave+San+Diego+CA+92104";

export default function Footer() {
  const reduce = useReducedMotion();
  const fade = (delay) => ({
    initial: reduce ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <footer id="visit" className="scroll-mt-24 border-t border-brand-yellow/20 bg-brand-deep" data-testid="footer">
      <div className="mx-auto max-w-[1440px] px-5 pt-20 md:px-10 md:pt-28">
        <motion.div {...fade(0)} data-testid="footer-cta">
          <h2 className="font-display text-[clamp(2.4rem,7vw,5.75rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            Device down?
            <br />
            <span className="text-brand-yellow">Let's fix it.</span>
          </h2>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/#quote" data-testid="footer-quote-button" className="btn-primary group">
              Get a free quote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/book" data-testid="footer-book-button" className="btn-ghost">
              Book an appointment
            </Link>
            <Link to="/sell" data-testid="footer-sell-button" className="btn-ghost">
              Sell your phone
            </Link>
            <Link to="/pay" data-testid="footer-pay-button" className="btn-ghost">
              Make a payment
            </Link>
          </div>
        </motion.div>

        <motion.div {...fade(0.1)} className="mt-20 grid grid-cols-1 gap-10 border-t border-white/10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-xs leading-relaxed text-white/45">
              San Diego's fast lane for phone, tablet, computer and console repair — done right,
              done today.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/reviews" data-testid="footer-reviews-link" className="text-xs text-white/50 transition-colors hover:text-brand-yellow">Customer reviews</Link>
              <Link to="/social" data-testid="footer-social-link" className="text-xs text-white/50 transition-colors hover:text-brand-yellow">Social media</Link>
              <Link to="/visit#why" data-testid="footer-why-link" className="text-xs text-white/50 transition-colors hover:text-brand-yellow">Why us</Link>
              <Link to="/visit#faq" data-testid="footer-faq-link" className="text-xs text-white/50 transition-colors hover:text-brand-yellow">FAQ</Link>
            </div>
          </div>
          <div data-testid="footer-visit">
            <h3 className="font-sans text-xs font-extrabold uppercase tracking-[0.25em] text-brand-yellow">Visit</h3>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-address-link"
              className="mt-5 block text-sm leading-relaxed text-white/60 transition-colors hover:text-brand-yellow"
            >
              3689 University Ave
              <br />
              San Diego, CA 92104
              <br />
              <span className="mt-1 inline-block text-xs text-white/40">Get directions →</span>
            </a>
          </div>
          <div data-testid="footer-hours">
            <h3 className="font-sans text-xs font-extrabold uppercase tracking-[0.25em] text-brand-yellow">Hours</h3>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              Mon – Fri: 8:00 AM – 5:00 PM
              <br />
              Saturday: 9:00 AM – 3:00 PM
              <br />
              Sunday: Closed
            </p>
          </div>
          <div data-testid="footer-contact">
            <h3 className="font-sans text-xs font-extrabold uppercase tracking-[0.25em] text-brand-yellow">Contact</h3>
            <a
              href="tel:6196211111"
              data-testid="footer-call-link"
              className="mt-5 block font-mono text-sm text-white/60 transition-colors hover:text-brand-yellow"
            >
              (619) 621-1111
            </a>
            <a
              href="mailto:primephoneparts619@gmail.com"
              data-testid="footer-email-link"
              className="mt-3 block break-all font-mono text-sm text-white/60 transition-colors hover:text-brand-yellow"
            >
              primephoneparts619@gmail.com
            </a>
            <p className="mt-3 text-xs text-white/40">Closed Sundays. Walk-ins welcome.</p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 font-mono text-[11px] uppercase tracking-[0.15em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span data-testid="footer-copyright">© {new Date().getFullYear()} iFast Repair+ • San Diego, CA</span>
          <span>3689 University Ave, San Diego, CA 92104</span>
        </div>
      </div>
    </footer>
  );
}
