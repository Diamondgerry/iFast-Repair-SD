import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { Facebook, MapPin, Star } from "lucide-react";
import PageHero from "@/components/PageHero";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const GOOGLE_REVIEW_URL =
  "https://www.google.com/maps/search/?api=1&query=iFast+Repair%2B+3689+University+Ave+San+Diego+CA+92104";
const FB_URL = "https://www.facebook.com/p/IFast-S-d-100065151693460/";
const EASE = [0.16, 1, 0.3, 1];

const Stars = ({ value, size = "h-4 w-4" }) => (
  <span className="flex gap-1" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`${size} ${n <= value ? "fill-brand-yellow text-brand-yellow" : "text-white/25"}`}
      />
    ))}
  </span>
);

export default function ReviewsPage() {
  const reduce = useReducedMotion();
  const [reviews, setReviews] = useState(null);
  const [form, setForm] = useState({ name: "", rating: 5, device: "", text: "" });
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/reviews`);
      setReviews(data);
    } catch (err) {
      setReviews([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!form.text.trim()) {
      toast.error("Tell us a little about your experience.");
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API}/reviews`, {
        name: form.name,
        rating: form.rating,
        text: form.text,
        device: form.device,
      });
      toast.success("Review posted — thank you!");
      setForm({ name: "", rating: 5, device: "", text: "" });
      await load();
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(typeof msg === "string" ? msg : "Couldn't post your review. Please try again.");
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

  const avg = reviews && reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <>
      <PageHero
        eyebrow="Customer reviews"
        title="Real people, real"
        accent="reviews."
        sub="Had your phone, tablet or laptop fixed with us? Leave a review — it keeps our little shop going."
      />
      <section className="pb-24 md:pb-32" data-testid="reviews-section">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <motion.div
              {...fade(0)}
              className="border border-white/10 bg-brand-surface p-8"
              data-testid="reviews-summary"
            >
              {avg ? (
                <div className="flex items-center gap-6">
                  <p className="font-display text-6xl font-black text-brand-yellow">{avg}</p>
                  <div>
                    <Stars value={Math.round(parseFloat(avg))} size="h-5 w-5" />
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
                      {reviews.length} customer review{reviews.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-display text-xl font-black uppercase text-white">
                    Be the first to <span className="text-brand-yellow">leave a review.</span>
                  </p>
                  <p className="mt-2 text-sm text-white/50">
                    Fixed something for you recently? Your review helps other San Diego folks find
                    us.
                  </p>
                </div>
              )}
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="google-review-button"
                  className="inline-flex items-center gap-2 border border-white/15 px-5 py-2.5 font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-white transition-colors hover:border-brand-yellow hover:text-brand-yellow"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Review us on Google
                </a>
                <a
                  href={FB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="facebook-review-button"
                  className="inline-flex items-center gap-2 border border-white/15 px-5 py-2.5 font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-white transition-colors hover:border-brand-yellow hover:text-brand-yellow"
                >
                  <Facebook className="h-3.5 w-3.5" />
                  Review us on Facebook
                </a>
              </div>
            </motion.div>

            <motion.form
              {...fade(0.1)}
              onSubmit={async (e) => {
                e.preventDefault();
                if (sending) return;
                if (!form.text.trim()) {
                  toast.error("Tell us a little about your experience.");
                  return;
                }
                setSending(true);
                try {
                  await axios.post(`${API}/reviews`, {
                    name: form.name,
                    rating: form.rating,
                    text: form.text,
                    device: form.device,
                  });
                  toast.success("Review posted — thank you!");
                  setForm({ name: "", rating: 5, device: "", text: "" });
                  await load();
                } catch (err) {
                  const msg = err.response?.data?.detail;
                  toast.error(typeof msg === "string" ? msg : "Couldn't post your review. Please try again.");
                } finally {
                  setSending(false);
                }
              }}
              data-testid="review-form"
              className="mt-10 border border-white/10 bg-brand-black p-6 md:p-10"
            >
              <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">
                Leave a review
              </h2>
              <div className="mt-6">
                <span className="field-label">Your rating *</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      data-testid={`review-star-${n}`}
                      aria-label={`${n} star${n === 1 ? "" : "s"}`}
                      onClick={() => setForm((f) => ({ ...f, rating: n }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          n <= form.rating ? "fill-brand-yellow text-brand-yellow" : "text-white/25 hover:text-brand-yellow/60"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="rv-name" className="field-label">Name *</label>
                  <input
                    id="rv-name"
                    data-testid="review-form-name"
                    className="field"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rv-device" className="field-label">What did we fix?</label>
                  <input
                    id="rv-device"
                    data-testid="review-form-device"
                    className="field"
                    value={form.device}
                    onChange={set("device")}
                    placeholder="e.g. iPhone screen"
                  />
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="rv-text" className="field-label">Your review *</label>
                <textarea
                  id="rv-text"
                  data-testid="review-form-text"
                  className="field min-h-[100px] resize-y"
                  value={form.text}
                  onChange={set("text")}
                  placeholder="How was the service, price and turnaround?"
                  required
                />
              </div>
              <button
                type="submit"
                data-testid="review-form-submit-button"
                disabled={sending}
                className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Posting…" : "Post my review"}
              </button>
            </motion.form>
          </div>

          <div data-testid="reviews-list">
            {reviews === null ? (
              <p className="text-sm text-white/40">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <div className="border border-white/10 bg-brand-surface p-10 text-center" data-testid="reviews-empty">
                <p className="font-display text-lg font-black uppercase text-white">
                  No reviews yet — yours would be first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {reviews.map((r, i) => (
                  <motion.div
                    key={r.id}
                    {...fade(Math.min(i * 0.06, 0.3))}
                    className="border border-white/10 bg-brand-surface p-6"
                    data-testid={`review-card-${i}`}
                  >
                    <div className="flex items-center justify-between">
                      <Stars value={r.rating} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-white/70">"{r.text}"</p>
                    <div className="mt-5 flex items-center justify-between">
                      <p className="font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-white">
                        {r.name}
                      </p>
                      {r.device && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                          {r.device}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
