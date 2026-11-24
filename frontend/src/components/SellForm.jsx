import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CHEVRON =
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22%3E%3Cpath d=%22M1 1l5 5 5-5%22 stroke=%22%23FFDE00%22 stroke-width=%222%22 fill=%22none%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat";
const STORAGE = ["Not sure", "64GB", "128GB", "256GB", "512GB", "1TB"];
const CONDITIONS = [
  "Flawless — like new",
  "Good — light wear",
  "Cracked screen",
  "Battery drains fast",
  "Not turning on",
  "Other / not sure",
];
const CARRIERS = ["Unlocked", "AT&T", "T-Mobile", "Verizon", "Other carrier"];
const empty = { name: "", phone: "", email: "", device: "", storage: "", condition: "", carrier: "", notes: "" };
const EASE = [0.16, 1, 0.3, 1];

export default function SellForm() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await axios.post(`${API}/sell-quote`, form);
      toast.success("Offer request sent!", {
        description: "We'll text you a cash offer for your device.",
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
    <motion.form
      {...fade(0.1)}
      onSubmit={onSubmit}
      data-testid="sell-form"
      className="h-fit border border-white/10 bg-brand-black p-6 md:p-10"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sf-name" className="field-label">Name *</label>
          <input
            id="sf-name"
            data-testid="sell-form-name"
            className="field"
            value={form.name}
            onChange={set("name")}
            placeholder="Jane Doe"
            required
          />
        </div>
        <div>
          <label htmlFor="sf-phone" className="field-label">Phone *</label>
          <input
            id="sf-phone"
            data-testid="sell-form-phone"
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
        <label htmlFor="sf-device" className="field-label">What are you selling? *</label>
        <input
          id="sf-device"
          data-testid="sell-form-device"
          className="field"
          value={form.device}
          onChange={set("device")}
          placeholder="e.g. iPhone 13 Pro, Galaxy S22"
          required
        />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sf-storage" className="field-label">Storage</label>
          <select
            id="sf-storage"
            data-testid="sell-form-storage"
            className={`field appearance-none pr-10 ${CHEVRON}`}
            value={form.storage}
            onChange={set("storage")}
          >
            <option value="">Select…</option>
            {STORAGE.map((s) => (
              <option key={s} value={s} className="bg-brand-black">{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sf-condition" className="field-label">Condition *</label>
          <select
            id="sf-condition"
            data-testid="sell-form-condition"
            className={`field appearance-none pr-10 ${CHEVRON}`}
            value={form.condition}
            onChange={set("condition")}
            required
          >
            <option value="" disabled>Select…</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c} className="bg-brand-black">{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="sf-carrier" className="field-label">Carrier</label>
        <select
          id="sf-carrier"
          data-testid="sell-form-carrier"
          className={`field appearance-none pr-10 ${CHEVRON}`}
          value={form.carrier}
          onChange={set("carrier")}
        >
          <option value="">Select…</option>
          {CARRIERS.map((c) => (
            <option key={c} value={c} className="bg-brand-black">{c}</option>
          ))}
        </select>
      </div>
      <div className="mt-5">
        <label htmlFor="sf-notes" className="field-label">Details</label>
        <textarea
          id="sf-notes"
          data-testid="sell-form-notes"
          className="field min-h-[90px] resize-y"
          value={form.notes}
          onChange={set("notes")}
          placeholder="e.g. original box, iCloud signed out, second phone too"
        />
      </div>
      <button
        type="submit"
        data-testid="sell-form-submit-button"
        disabled={sending}
        className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? "Sending…" : "Get my cash offer"}
      </button>
      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">
        Offers by text or call — no obligation.
      </p>
    </motion.form>
  );
}
