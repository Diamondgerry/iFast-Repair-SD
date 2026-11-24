import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Lock, Smartphone, RefreshCcw } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PageHero from "@/components/PageHero";
import CardPayBox from "@/components/CardPayBox";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const empty = { name: "", phone: "", email: "", device: "", price: "" };
const EASE = [0.16, 1, 0.3, 1];

export default function CheckoutPage() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState(empty);
  const [option, setOption] = useState("full");
  const [sending, setSending] = useState(false);
  const [intent, setIntent] = useState(null);
  const [paid, setPaid] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const price = parseFloat(form.price) || 0;
  const amount = option === "deposit" ? Math.round(price * 50) / 100 : price;

  const onDetails = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!price || price < 1) {
      toast.error("Enter the agreed price of at least $1.");
      return;
    }
    setSending(true);
    try {
      const { data } = await axios.post(`${API}/payments/create-intent`, {
        kind: option === "deposit" ? "phone_deposit" : "phone_full",
        amount,
        name: form.name,
        phone: form.phone,
        email: form.email,
        device: form.device,
        purpose: option === "deposit" ? "50% deposit" : "Full payment",
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
    { icon: Smartphone, title: "Lock in your phone", desc: "Pay in full or leave a 50% deposit — we hold it either way." },
    { icon: RefreshCcw, title: "Deposit balance later", desc: "Pay the rest when you pick it up or pay it off here." },
    { icon: Lock, title: "Card-secure", desc: "Payments are processed by Stripe — cards never touch our servers." },
  ];

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Pay for your"
        accent="phone."
        sub="After we confirm availability and price, lock your phone in here — pay in full or leave a 50% deposit by card."
      />
      <section className="pb-24 md:pb-32" data-testid="checkout-section">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <motion.h2
              {...fade(0)}
              className="font-display text-2xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-4xl"
              data-testid="checkout-how-title"
            >
              Two ways to <span className="text-brand-yellow">pay.</span>
            </motion.h2>
            <div className="mt-10 border-t border-white/10">
              {POINTS.map((p, i) => (
                <motion.div
                  key={p.title}
                  {...fade(0.08 + i * 0.08)}
                  className="flex gap-6 border-b border-white/10 py-6"
                  data-testid={`checkout-point-${i}`}
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

          <div className="h-fit border border-white/10 bg-brand-black p-6 md:p-10" data-testid="checkout-card">
            {paid ? (
              <div className="py-10 text-center" data-testid="checkout-success-panel">
                <CheckCircle2 className="mx-auto h-14 w-14 text-brand-yellow" />
                <h3 className="mt-5 font-display text-2xl font-black uppercase text-white">
                  Phone <span className="text-brand-yellow">reserved.</span>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  Payment received — we'll confirm your {form.device || "phone"} and see you at the shop.
                </p>
                <button
                  type="button"
                  data-testid="checkout-again-button"
                  onClick={() => {
                    setPaid(false);
                    setIntent(null);
                    setForm(empty);
                  }}
                  className="btn-ghost mt-8"
                >
                  Pay for another phone
                </button>
              </div>
            ) : intent ? (
              <motion.div {...fade(0)} data-testid="checkout-card-step">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
                      {option === "deposit" ? "50% deposit today" : "Full payment"}
                    </p>
                    <p className="mt-1 text-sm text-white/70">{form.device}</p>
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
                  data-testid="checkout-back-button"
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
                data-testid="checkout-form"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="co-name" className="field-label">Name *</label>
                    <input
                      id="co-name"
                      data-testid="checkout-form-name"
                      className="field"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="co-phone" className="field-label">Phone *</label>
                    <input
                      id="co-phone"
                      data-testid="checkout-form-phone"
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
                  <label htmlFor="co-email" className="field-label">Email for your receipt</label>
                  <input
                    id="co-email"
                    data-testid="checkout-form-email"
                    className="field"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@email.com"
                  />
                </div>
                <div className="mt-5">
                  <label htmlFor="co-device" className="field-label">Which phone? *</label>
                  <input
                    id="co-device"
                    data-testid="checkout-form-device"
                    className="field"
                    value={form.device}
                    onChange={set("device")}
                    placeholder="e.g. iPhone 15, Galaxy S24 — as quoted"
                    required
                  />
                </div>
                <div className="mt-5">
                  <label htmlFor="co-price" className="field-label">Agreed price (USD) *</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-sans text-sm font-extrabold text-brand-yellow">
                      $
                    </span>
                    <input
                      id="co-price"
                      data-testid="checkout-form-price"
                      className="field pl-9"
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.price}
                      onChange={set("price")}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <span className="field-label">Payment option *</span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { id: "full", label: "Pay in full", hint: form.price ? `$${parseFloat(form.price || 0).toFixed(2)}` : "Full amount" },
                      { id: "deposit", label: "50% deposit", hint: form.price ? `$${(Math.round(parseFloat(form.price || 0) * 50) / 100).toFixed(2)} today` : "Half today" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`cursor-pointer border p-4 transition-colors ${
                          option === opt.id
                            ? "border-brand-yellow bg-brand-yellow/10"
                            : "border-white/15 hover:border-white/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment-option"
                          value={opt.id}
                          checked={option === opt.id}
                          onChange={() => setOption(opt.id)}
                          className="sr-only"
                          data-testid={`checkout-option-${opt.id}`}
                        />
                        <span className="flex items-center gap-2 font-sans text-sm font-extrabold uppercase tracking-wide text-white">
                          <span
                            className={`grid h-4 w-4 place-items-center rounded-full border ${
                              option === opt.id ? "border-brand-yellow" : "border-white/30"
                            }`}
                          >
                            {option === opt.id && <span className="h-2 w-2 rounded-full bg-brand-yellow" />}
                          </span>
                          {opt.label}
                        </span>
                        <span className="mt-1 block pl-6 font-mono text-xs text-white/50">{opt.hint}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  data-testid="checkout-form-submit-button"
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
