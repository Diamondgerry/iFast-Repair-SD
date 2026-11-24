import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, Menu, X, ShoppingCart } from "lucide-react";
import Logo from "@/components/Logo";

const NAV = [
  { label: "Services", to: "/services" },
  { label: "Sell", to: "/sell" },
  { label: "Buy", to: "/buy" },
  { label: "Book", to: "/book" },
  { label: "Pay", to: "/pay" },
  { label: "Reviews", to: "/reviews" },
  { label: "Visit", to: "/visit" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-brand-teal/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-20 md:px-10">
        <Logo />
        <nav className="hidden items-center gap-4 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-testid={`nav-${item.to.slice(1)}-link`}
              className={`${item.xl ? "hidden xl:inline-block" : ""} font-sans text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                pathname === item.to ? "text-brand-yellow" : "text-white/70 hover:text-brand-yellow"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="tel:6196211111"
            data-testid="header-call-link"
            className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 font-mono text-xs text-white/80 transition-colors hover:border-brand-yellow hover:text-brand-yellow"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden 2xl:inline">(619) 621-1111</span>
          </a>
          <Link
            to="/checkout"
            data-testid="header-checkout-button"
            aria-label="Checkout — pay for a phone"
            className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-white transition-colors hover:border-brand-yellow hover:text-brand-yellow"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden 2xl:inline">Checkout</span>
          </Link>
          <Link
            to="/#quote"
            data-testid="header-quote-button"
            className="border border-brand-yellow bg-brand-yellow px-5 py-2.5 font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-black transition-colors hover:bg-transparent hover:text-brand-yellow"
          >
            Free Quote
          </Link>
        </div>
        <button
          type="button"
          data-testid="header-menu-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center border border-white/15 text-white transition-colors hover:border-brand-yellow hover:text-brand-yellow lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-brand-teal/95 px-5 py-6 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-${item.to.slice(1)}-link`}
                className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-brand-yellow"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/#quote"
              onClick={() => setOpen(false)}
              data-testid="mobile-header-quote-button"
              className="mt-2 inline-flex items-center justify-center border border-brand-yellow bg-brand-yellow px-5 py-3 font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-black"
            >
              Get a Free Quote
            </Link>
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              data-testid="mobile-header-checkout-button"
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-white/80"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Checkout — pay for a phone
            </Link>
            <a
              href="tel:6196211111"
              data-testid="mobile-header-call-link"
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 font-mono text-xs text-white/80"
            >
              <Phone className="h-3.5 w-3.5" />
              (619) 621-1111
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
