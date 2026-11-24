import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, Clock, Zap } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DEVICES = ["iPhone", "Samsung Galaxy", "iPad / Tablet", "MacBook / Laptop", "Game Console", "Not sure — needs a diagnostic"];
const SERVICES = ["Diagnostic", "Screen Repair", "Battery Replacement", "Charging Port", "Water Damage", "Other"];
const CHEVRON =
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22%3E%3Cpath d=%22M1 1l5 5 5-5%22 stroke=%22%23FFDE00%22 stroke-width=%222%22 fill=%22none%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat";

const todayStr = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const slotsFor = (dateStr) => {
  if (!dateStr) return [];
  const day = new Date(`${dateStr}T00:00:00`).getDay(); // 0 = Sunday
  if (day === 0) return null;
  const open = day === 6 ? 9 : 8;
  const close = day === 6 ? 15 : 17;
  const slots = [];
  for (let m = open * 60; m <= close * 60 - 30; m += 30) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    slots.push(`${((h + 11) % 12) + 1}:${mm === 0 ? "00" : "30"} ${h < 12 ? "AM" : "PM"}`);
  }
  return slots;
};

const empty = { name: "", phone: "", email: "", device: "", service: "", date: "", time: "", notes: "" };
const EASE = [0.16, 1, 0.3, 1];

export default function Appointment() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const onDate = (e) => setForm((f) => ({ ...f, date: e.target.value, time: "" }));
  const slots = slotsFor(form.date);
  const closed = slots === null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending || closed) return;
    setSending(true);
    try {
      await axios.post(`${API}/appointment`, form);
      toast.success("Appointment requested!", {
        description: `${form.date} at ${form.time} — we'll text or call to confirm.`,
      });
      setForm(empty);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Couldn't book that slot. Please call the shop.");
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
      id="book"
      className="scroll-mt-24 border-t border-white/10 py-24 md:py-32"
      data-testid="appointment-section"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <motion.p {...fade(0)} className="eyebrow" data-testid="appointment-eyebrow">
            Book an appointment
          </motion.p>
          <motion.h2
            {...fade(0.08)}
            className="mt-6 font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-white md:text-5xl"
          >
            Pick a day. <span className="text-brand-yellow">We'll be ready.</span>
          </motion.h2>
          <motion.p {...fade(0.14)} className="mt-6 max-w-md text-sm leading-relaxed text-white/55 md:text-base">
            Reserve a time that works for you and skip the wait. We confirm every booking by text or
            call before your visit.
          </motion.p>
          <motion.div
            {...fade(0.2)}
            className="mt-10 space-y-5 border-t border-white/10 pt-8"
            data-testid="appointment-info"
          >
            <p className="flex items-start gap-4 text-sm text-white/70">
              <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
              Confirmed by text or call before your visit
            </p>
            <p className="flex items-start gap-4 text-sm text-white/70">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
              Walk-ins still welcome — booking just skips the wait
            </p>
            <p className="flex items-start gap-4 text-sm text-white/70">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
              Mon – Fri: 8:00 AM – 5:00 PM • Sat: 9:00 AM – 3:00 PM • Sun: Closed
            </p>
          </motion.div>
        </div>

        <motion.form
          {...fade(0.1)}
          onSubmit={onSubmit}
          data-testid="appointment-form"
          className="h-fit border border-white/10 bg-brand-black p-6 md:p-10"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ap-name" className="field-label">Name *</label>
              <input
                id="ap-name"
                data-testid="appointment-form-name"
                className="field"
                value={form.name}
                onChange={set("name")}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="ap-phone" className="field-label">Phone *</label>
              <input
                id="ap-phone"
                data-testid="appointment-form-phone"
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
            <label htmlFor="ap-email" className="field-label">Email</label>
            <input
              id="ap-email"
              data-testid="appointment-form-email"
              className="field"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@email.com"
            />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ap-device" className="field-label">Device *</label>
              <select
                id="ap-device"
                data-testid="appointment-form-device"
                className={`field appearance-none pr-10 ${CHEVRON}`}
                value={form.device}
                onChange={set("device")}
                required
              >
                <option value="" disabled>Select your device…</option>
                {DEVICES.map((d) => (
                  <option key={d} value={d} className="bg-brand-black">{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ap-service" className="field-label">Service *</label>
              <select
                id="ap-service"
                data-testid="appointment-form-service"
                className={`field appearance-none pr-10 ${CHEVRON}`}
                value={form.service}
                onChange={set("service")}
                required
              >
                <option value="" disabled>What do you need?</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s} className="bg-brand-black">{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ap-date" className="field-label">Day *</label>
              <input
                id="ap-date"
                data-testid="appointment-form-date"
                className="field [color-scheme:dark]"
                type="date"
                min={todayStr()}
                value={form.date}
                onChange={onDate}
                required
              />
            </div>
            <div>
              <label htmlFor="ap-time" className="field-label">Time *</label>
              {closed ? (
                <p
                  data-testid="appointment-closed-note"
                  className="field flex items-center border-brand-yellow/50 text-brand-yellow"
                >
                  Closed Sundays — pick another day
                </p>
              ) : (
                <select
                  id="ap-time"
                  data-testid="appointment-form-time"
                  className={`field appearance-none pr-10 ${CHEVRON}`}
                  value={form.time}
                  onChange={set("time")}
                  required
                  disabled={!form.date}
                >
                  <option value="" disabled>
                    {form.date ? "Pick a time…" : "Pick a day first…"}
                  </option>
                  {(slots || []).map((t) => (
                    <option key={t} value={t} className="bg-brand-black">{t}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="mt-5">
            <label htmlFor="ap-notes" className="field-label">Anything we should know?</label>
            <textarea
              id="ap-notes"
              data-testid="appointment-form-notes"
              className="field min-h-[90px] resize-y"
              value={form.notes}
              onChange={set("notes")}
              placeholder="e.g. screen + battery, or 'not turning on'"
            />
          </div>
          <button
            type="submit"
            data-testid="appointment-form-submit-button"
            disabled={sending || closed}
            className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Booking…" : "Request this time"}
          </button>
          <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">
            No payment needed — we confirm every booking first.
          </p>
        </motion.form>
      </div>
    </section>
  );
}
