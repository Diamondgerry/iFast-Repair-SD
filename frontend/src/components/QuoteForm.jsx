import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DEVICES = ["iPhone", "Samsung Galaxy", "iPad / Tablet", "MacBook / Laptop", "Game Console", "Not sure — needs a diagnostic", "Other"];
const EASE = [0.16, 1, 0.3, 1];

const empty = { name: "", phone: "", email: "", device: "", issue: "" };

export default function QuoteForm() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await axios.post(`${API}/quote`, form);
      toast.success("Request sent! We'll text or call you back with a quote.", {
        description: "Usually within the hour during shop time.",
      });
      setForm(empty);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Couldn't send your request. Please call the shop.");
    } finally {
      setSending(false);
    }
  };

  const fade = (delay) => ({
    initial: reduce ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section
      id="quote"
      className="scroll-mt-24 border-t border-white/10 bg-brand-surface/40 py-24 md:py-32"
      data-testid="quote-section"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <motion.p {...fade(0)} className="eyebrow" data-testid="quote-eyebrow">
            Free quote
          </motion.p>
          <motion.h2
            {...fade(0.08)}
            className="mt-6 font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-5xl"
          >
            Tell us what's <span className="text-brand-yellow">broken.</span>
          </motion.h2>
          <motion.p {...fade(0.14)} className="mt-6 max-w-md text-sm leading-relaxed text-white/55 md:text-base">
            Drop the details and we'll text or call you back with an honest quote — no obligation,
            no appointment needed. Prefer to talk? Ring the shop.
          </motion.p>
          <motion.div {...fade(0.2)} className="mt-10 space-y-5 border-t border-white/10 pt-8" data-testid="quote-contact-info">
            <a
              href="https://www.google.com/maps/search/?api=1&query=3689+University+Ave+San+Diego+CA+92104"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="quote-address-link"
              className="flex items-start gap-4 text-sm text-white/70 transition-colors hover:text-brand-yellow"
            >
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
              <span>
                3689 University Ave
                <br />
                San Diego, CA 92104
              </span>
            </a>
            <p className="flex items-start gap-4 text-sm text-white/70">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
              <span>
                Mon – Fri: 8:00 AM – 5:00 PM
                <br />
                Saturday: 9:00 AM – 3:00 PM
                <br />
                Sunday: Closed
              </span>
            </p>
            <a
              href="tel:6196211111"
              data-testid="quote-call-link"
              className="flex items-center gap-4 text-sm text-white/70 transition-colors hover:text-brand-yellow"
            >
              <Phone className="h-5 w-5 shrink-0 text-brand-yellow" />
              (619) 621-1111
            </a>
            <a
              href="mailto:primephoneparts619@gmail.com"
              data-testid="quote-email-link"
              className="flex items-center gap-4 text-sm text-white/70 transition-colors hover:text-brand-yellow"
            >
              <Mail className="h-5 w-5 shrink-0 text-brand-yellow" />
              primephoneparts619@gmail.com
            </a>
          </motion.div>
        </div>

        <motion.form
          {...fade(0.1)}
          onSubmit={onSubmit}
          data-testid="quote-form"
          className="h-fit border border-white/10 bg-brand-black p-6 md:p-10"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="qf-name" className="field-label">Name *</label>
              <input
                id="qf-name"
                data-testid="quote-form-name"
                className="field"
                value={form.name}
                onChange={set("name")}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="qf-phone" className="field-label">Phone *</label>
              <input
                id="qf-phone"
                data-testid="quote-form-phone"
                className="field"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="(619) 555-0000"
                required
              />
            </div>
          </div>
          <div className="mt-5">
            <label htmlFor="qf-email" className="field-label">Email</label>
            <input
              id="qf-email"
              data-testid="quote-form-email"
              className="field"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@email.com"
            />
          </div>
          <div className="mt-5">
            <label htmlFor="qf-device" className="field-label">Device *</label>
            <select
              id="qf-device"
              data-testid="quote-form-device"
              className="field appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22%3E%3Cpath d=%22M1 1l5 5 5-5%22 stroke=%22%23FFDE00%22 stroke-width=%222%22 fill=%22none%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat pr-10"
              value={form.device}
              onChange={set("device")}
              required
            >
              <option value="" disabled>
                Select your device…
              </option>
              {DEVICES.map((d) => (
                <option key={d} value={d} className="bg-brand-black">
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5">
            <label htmlFor="qf-issue" className="field-label">What's the issue? *</label>
            <textarea
              id="qf-issue"
              data-testid="quote-form-issue"
              className="field min-h-[110px] resize-y"
              value={form.issue}
              onChange={set("issue")}
              placeholder="e.g. iPhone 14 Pro — cracked screen and battery drains fast"
              required
            />
          </div>
          <button
            type="submit"
            data-testid="quote-form-submit-button"
            disabled={sending}
            className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending…" : "Request my free quote"}
          </button>
          <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">
            We reply fast — usually within the hour during shop time.
          </p>
        </motion.form>
      </div>
    </section>
  );
}
