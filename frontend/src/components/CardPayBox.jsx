import { useState } from "react";
import axios from "axios";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CheckCircle2, Lock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CARD_STYLE = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "15px",
      "::placeholder": { color: "rgba(255,255,255,0.35)" },
    },
    invalid: { color: "#ff6b6b" },
  },
};

export default function CardPayBox({ clientSecret, intentId, amount, name, email, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || busy) return;
    const card = elements.getElement(CardElement);
    setBusy(true);
    setError("");
    const { error: err, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: { name: name || undefined, email: email || undefined },
      },
    });
    if (err) {
      setError(err.message || "Payment failed. Please try again or call the shop.");
      setBusy(false);
      return;
    }
    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      setError("Your payment is still processing — we'll confirm it shortly. No need to pay again.");
      setBusy(false);
      return;
    }
    try {
      await axios.post(`${API}/payments/verify`, { payment_intent_id: intentId });
    } catch (verifyErr) {
      /* payment succeeded — verification sync is best-effort here */
    }
    setBusy(false);
    onSuccess();
  };

  return (
    <form onSubmit={pay} data-testid="card-pay-form" className="space-y-5">
      <div>
        <span className="field-label">Card details</span>
        <div className="field py-3" data-testid="card-element-box">
          <CardElement options={CARD_STYLE} />
        </div>
      </div>
      {error && (
        <p data-testid="card-pay-error" className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        data-testid="card-pay-button"
        disabled={!stripe || busy}
        className="btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Processing…" : `Pay $${amount.toFixed(2)}`}
      </button>
      <p className="flex items-center justify-center gap-2 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">
        <Lock className="h-3 w-3" />
        Credit &amp; debit cards — secured by Stripe
      </p>
    </form>
  );
}
