import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const DEVICE_MODELS = {
  iPhone: [
    "iPhone 18 Pro Max",
    "iPhone 18 Pro",
    "iPhone 18 Plus",
    "iPhone 18",
    "iPhone 17 Pro Max",
    "iPhone 17 Pro",
    "iPhone 17 Air / Plus",
    "iPhone 17",
    "iPhone 16e",
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16 Plus",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13 mini",
    "iPhone 13",
    "iPhone SE (3rd Gen / 2022)",
    "iPhone 12 Pro Max",
    "iPhone 12 Pro",
    "iPhone 12 mini",
    "iPhone 12",
    "iPhone SE (2nd Gen / 2020)",
    "iPhone 11 Pro Max",
    "iPhone 11 Pro",
    "iPhone 11",
    "iPhone XS Max",
    "iPhone XS",
    "iPhone XR",
    "iPhone X",
    "iPhone 8 Plus",
    "iPhone 8",
    "iPhone 7 Plus",
    "iPhone 7",
    "iPhone 6s Plus",
    "iPhone 6s",
    "iPhone 6 Plus",
    "iPhone 6",
    "Other iPhone Model",
  ],
  "Samsung Galaxy": [
    "Galaxy S26 Ultra",
    "Galaxy S26+",
    "Galaxy S26",
    "Galaxy S25 Ultra",
    "Galaxy S25+",
    "Galaxy S25",
    "Galaxy S24 Ultra",
    "Galaxy S24+",
    "Galaxy S24 FE",
    "Galaxy S24",
    "Galaxy S23 Ultra",
    "Galaxy S23+",
    "Galaxy S23 FE",
    "Galaxy S23",
    "Galaxy S22 Ultra",
    "Galaxy S22+",
    "Galaxy S22",
    "Galaxy S21 Ultra",
    "Galaxy S21+ / S21 FE",
    "Galaxy S21",
    "Galaxy S20 Ultra / S20+ / S20",
    "Galaxy S10+ / S10 / S10e",
    "Galaxy Z Fold 7 / 6 / 5 / 4",
    "Galaxy Z Flip 7 / 6 / 5 / 4",
    "Galaxy Note 20 Ultra / Note 20",
    "Galaxy A56 / A55 / A54 / A53",
    "Galaxy A36 / A35 / A25 / A16 / A15",
    "Other Samsung Model",
  ],
  "Google Pixel": [
    "Pixel 11 Pro XL",
    "Pixel 11 Pro",
    "Pixel 11",
    "Pixel 10 Pro XL",
    "Pixel 10 Pro",
    "Pixel 10",
    "Pixel 9a",
    "Pixel 9 Pro Fold",
    "Pixel 9 Pro XL",
    "Pixel 9 Pro",
    "Pixel 9",
    "Pixel 8a",
    "Pixel 8 Pro",
    "Pixel 8",
    "Pixel 7a",
    "Pixel 7 Pro",
    "Pixel 7",
    "Pixel 6a",
    "Pixel 6 Pro",
    "Pixel 6",
    "Pixel 5a / Pixel 5",
    "Other Google Pixel Model",
  ],
  "T-Mobile REVVL": [
    "REVVL 8 Pro 5G",
    "REVVL 8 5G",
    "REVVL 7 Pro 5G",
    "REVVL 7 5G",
    "REVVL 6x Pro 5G",
    "REVVL 6x 5G",
    "REVVL 6 Pro 5G",
    "REVVL 6 5G",
    "REVVL V+ 5G",
    "REVVL V",
    "REVVL 5G",
    "REVVL 4+ / REVVL 4",
    "REVVL Tab 5G / Tab 2",
    "Other REVVL Model",
  ],
  "iPad / Tablet": [
    "iPad Pro (M4 / M2 / M1)",
    "iPad Air (M3 / M2 / 5th / 4th Gen)",
    "iPad (11th / 10th / 9th / 8th Gen)",
    "iPad mini (7th / 6th / 5th Gen)",
    "Samsung Galaxy Tab S10 / S9 / S8 / A9",
    "Other Tablet Model",
  ],
  "MacBook / Laptop": [
    "MacBook Pro 16-inch",
    "MacBook Pro 14-inch",
    "MacBook Pro 13-inch",
    "MacBook Air 15-inch",
    "MacBook Air 13-inch",
    "Windows Laptop (Dell / HP / Lenovo / ASUS)",
    "Other Laptop Model",
  ],
  "Game Console": [
    "PlayStation 5 / PS5 Pro / PS5 Slim",
    "PlayStation 4 / PS4 Pro",
    "Xbox Series X / Series S",
    "Xbox One / One S / One X",
    "Nintendo Switch 2 / OLED / Standard / Lite",
    "Steam Deck / ROG Ally",
    "Other Console Model",
  ],
  "Not sure — needs a diagnostic": [],
  Other: [],
};

const DEVICES = Object.keys(DEVICE_MODELS);
const EASE = [0.16, 1, 0.3, 1];
const SELECT_ARROW =
  "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://w3.org width=%2212%22 height=%228%22%3E%3Cpath d=%22M1 1l5 5 5-5%22 stroke=%22%23FFDE00%22 stroke-width=%222%22 fill=%22none%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat pr-10";

const empty = { name: "", phone: "", email: "", device: "", model: "", customModel: "", issue: "" };

export default function QuoteForm() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleDeviceChange = (e) => {
    const newDevice = e.target.value;
    setForm((f) => ({ ...f, device: newDevice, model: "", customModel: "" }));
  };

  const modelsForDevice = DEVICE_MODELS[form.device] || [];
  const needsCustomInput =
    form.device === "Other" || form.model.startsWith("Other ");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    const chosenModel = needsCustomInput ? form.customModel.trim() : form.model;
    const deviceSummary = chosenModel
      ? form.device + " — " + chosenModel
      : form.device;

    try {
      await axios.post(API + "/quote", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        device: deviceSummary,
        issue: form.issue,
      });
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
              href="https://google.com"
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
              <label htmlFor="qf-name" className="field-label">
                Name *
              </label>
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
              <label htmlFor="qf-phone" className="field-label">
                Phone *
              </label>
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
            <label htmlFor="qf-email" className="field-label">
              Email
            </label>
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
            <label htmlFor="qf-device" className="field-label">
              Device *
            </label>
            <select
              id="qf-device"
              data-testid="quote-form-device"
              className={"field " + SELECT_ARROW}
              value={form.device}
              onChange={handleDeviceChange}
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

          {modelsForDevice.length > 0 && (
            <div className="mt-5">
              <label htmlFor="qf-model" className="field-label">
                Model *
              </label>
              <select
                id="qf-model"
                data-testid="quote-form-model"
                className={"field " + SELECT_ARROW}
                value={form.model}
                onChange={set("model")}
                required
              >
                <option value="" disabled>
                  Select your model…
                </option>
                {modelsForDevice.map((m) => (
                  <option key={m} value={m} className="bg-brand-black">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {needsCustomInput && (
            <div className="mt-5">
              <label htmlFor="qf-custom-model" className="field-label">
                Enter your model *
              </label>
              <input
                id="qf-custom-model"
                data-testid="quote-form-custom-model"
                className="field"
                value={form.customModel}
                onChange={set("customModel")}
                placeholder="e.g. Motorola Moto G Power 5G"
                required
              />
            </div>
          )}

          <div className="mt-5">
            <label htmlFor="qf-issue" className="field-label">
              What's the issue? *
            </label>
            <textarea
              id="qf-issue"
              data-testid="quote-form-issue"
              className="field min-h-[110px] resize-y"
              value={form.issue}
              onChange={set("issue")}
              placeholder="e.g. Cracked front glass, screen stays black, or battery drains fast"
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
