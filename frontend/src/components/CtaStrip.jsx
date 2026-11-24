import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CtaStrip() {
  return (
    <section className="border-t border-white/10 bg-brand-surface/40 py-16 md:py-20" data-testid="cta-strip">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-10 px-5 md:px-10">
        <h2 className="font-display text-3xl font-black uppercase leading-[0.98] tracking-tight text-white md:text-5xl">
          Walk in. Walk out.
          <br />
          <span className="text-brand-yellow">Fixed.</span>
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/#quote" data-testid="cta-strip-quote-button" className="btn-primary group">
            Get a free quote
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/book" data-testid="cta-strip-book-button" className="btn-ghost">
            Book an appointment
          </Link>
        </div>
      </div>
    </section>
  );
}
