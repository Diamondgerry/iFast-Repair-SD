import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck, Zap } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PageHero from "@/components/PageHero";
import CardPayBox from "@/components/CardPayBox";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const empty = { name: "", phone: "", email: "", purpose: "", amount: "" };
const EASE = [0.16, 1, 0.3, 1];

export default function PayPage() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const [intent, setIntent] = useState(null);
  const [paid, setPaid] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onDetails = async (e) => {
    e.preventDefault();
    if (sending) return;
    const amount = parseFloat(form.amount);
    if (!amount || amount < 1) {
      toast.error("Enter an amount of at least $1.");
      return;
    }
    setSending(true);
    try {
      const { data } = await axios.post(`${API}/payments/create-intent`, {
        kind: "invoice_payment",
        amount,
        name: form.name,
        phone: form.phone,
        email: form.email,
        purpose: form.purpose,
      });
      setIntent({ clientSecret: data.client_secret, intentId: data.payment_intent_id, amount });
      toast.success("Secure card form ready below.");
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(typeof msg === "string" ? msg : "Couldn't start checkout. Please call the shop.");
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

  const POINTS = [
    { icon: Lock, title: "Secure checkout", desc: "Card details are handled by Stripe — we never see them." },
    { icon: Zap, title: "Instant receipt", desc: "You get an email receipt the moment your payment clears." },
    { icon: ShieldCheck, title: "Any invoice", desc: "Repairs, deposits, parts — pay whatever was quoted." },
  ];

  return (
    <>
      <PageHero
        eyebrow="Make a payment"
        title="Pay your invoice,"
        accent="fast."
        sub="Got a quote or invoice from us? Pay it here by card in under a minute — securely processed by Stripe."
      />
      <section className="pb-24 md:pb-32" data-testid="pay-section">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <motion.h2
              {...fade(0)}
              className="font-display text-2xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-4xl"
              data-testid="pay-how-title"
            >
              Safe, simple, <span className="text-brand-yellow">done.</span>
            </motion.h2>
            <div className="mt-10 border-t border-white/10">
              {POINTS.map((p, i) => (
                <motion.div
                  key={p.title}
                  {...fade(0.08 + i * 0.08)}
                  className="flex gap-6 border-b border-white/10 py-6"
                  data-testid={`pay-point-${i}`}
                >
                  <p.icon className="h-6 w-6 shrink-0 text-brand-yellow" />
                  <div>
                    <h3 className="font-sans text-base font-extrabold uppercase tracking-wide text-white">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/50 md:text-sm">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="h-fit border border-white/10 bg-brand-black p-6 md:p-10" data-testid="pay-card">
            {paid ? (
              <div className="py-10 text-center" data-testid="pay-success-panel">
                <CheckCircle2 className="mx-auto h-14 w-14 text-brand-yellow" />
                <h3 className="mt-5 font-display text-2xl font-black uppercase text-white">
                  Payment <span className="text-brand-yellow">received.</span>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  Thank you! Your receipt is on its way and we'll be in touch to confirm.
                </p>
                <button
                  type="button"
                  data-testid="pay-again-button"
                  onClick={() => {
                    setPaid(false);
                    setIntent(null);
                    setForm(empty);
                  }}
                  className="btn-ghost mt-8"
                >
                  Make another payment
                </button>
              </div>
            ) : intent ? (
              <motion.div {...fade(0)} data-testid="pay-card-step">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Paying</p>
                    <p className="mt-1 text-sm text-white/70">{form.purpose || "Repair payment"}</p>
                  </div>
                  <p className="font-display text-2xl font-black text-brand-yellow">
                    ${intent.amount.toFixed(2)}
                  </p>
                </div>
                <div className="mt-7">
                  <Elements stripe={stripePromise}>
                    <CardPayBox
                      clientSecret={intent.clientSecret}
                      intentId={intent.intentId}
                      amount={intent.amount}
                      name={form.name}
                      email={form.email}
                      onSuccess={() => setPaid(true)}
                    />
                  </Elements>
                </div>
                <button
                  type="button"
                  data-testid="pay-back-button"
                  onClick={() => setIntent(null)}
                  className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-brand-yellow"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to details
                </button>
              </motion.div>
            ) : (
              <motion.form
                {...fade(0.1)}
                onSubmit={onDetails}
                data-testid="pay-form"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pay-name" className="field-label">Name *</label>
                    <input
                      id="pay-name"
                      data-testid="pay-form-name"
                      className="field"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pay-phone" className="field-label">Phone</label>
                    <input
                      id="pay-phone"
                      data-testid="pay-form-phone"
                      className="field"
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="(619) 555-0000"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <label htmlFor="pay-email" className="field-label">Email for your receipt</label>
                  <input
                    id="pay-email"
                    data-testid="pay-form-email"
                    className="field"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@email.com"
                  />
                </div>
                <div className="mt-5">
                  <label htmlFor="pay-purpose" className="field-label">What's this payment for?</label>
                  <textarea
                    id="pay-purpose"
                    data-testid="pay-form-purpose"
                    className="field min-h-[80px] resize-y"
                    value={form.purpose}
                    onChange={set("purpose")}
                    placeholder="e.g. invoice #1042, iPhone screen repair, deposit on trade"
                  />
                </div>
                <div className="mt-5">
                  <label htmlFor="pay-amount" className="field-label">Amount (USD) *</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-sans text-sm font-extrabold text-brand-yellow">
                      $
                    </span>
                    <input
                      id="pay-amount"
                      data-testid="pay-form-amount"
                      className="field pl-9"
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.amount}
                      onChange={set("amount")}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  data-testid="pay-form-submit-button"
                  disabled={sending}
                  className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Preparing card form…" : "Continue to card payment"}
                </button>
                <p className="mt-4 flex items-center justify-center gap-2 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">
                  <Lock className="h-3 w-3" />
                  Credit & debit cards — secured by Stripe
                </p>
              </motion.form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
