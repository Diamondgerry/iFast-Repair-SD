import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, Clock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState(sessionId ? "checking" : "missing");

  useEffect(() => {
    if (!sessionId) return undefined;
    let tries = 0;
    const tick = async () => {
      tries += 1;
      try {
        const { data } = await axios.get(`${API}/payments/status/${sessionId}`);
        if (data.payment_status === "paid" || data.status === "completed") {
          setState("paid");
          return true;
        }
      } catch (err) {
        /* keep polling until budget exhausted */
      }
      if (tries >= 12) setState("pending");
      return false;
    };
    let timer;
    const run = async () => {
      const done = await tick();
      if (!done) timer = setInterval(async () => { if (await tick()) clearInterval(timer); }, 2500);
    };
    run();
    return () => clearInterval(timer);
  }, [sessionId]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-24 text-center" data-testid="payment-success-page">
      {state === "paid" && (
        <>
          <CheckCircle2 className="h-16 w-16 text-brand-yellow" />
          <h1 className="mt-6 font-display text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
            Payment <span className="text-brand-yellow">received.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
            Thank you! We've got your payment and your receipt is on its way. We'll be in touch to
            confirm your order or repair.
          </p>
        </>
      )}
      {(state === "checking" || state === "pending") && (
        <>
          <Clock className="h-16 w-16 text-brand-yellow" />
          <h1 className="mt-6 font-display text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
            {state === "checking" ? "Checking payment…" : "Processing payment…"}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
            {state === "checking"
              ? "One moment — confirming your payment with Stripe."
              : "Your payment is still processing with your bank. We'll confirm it shortly — no need to pay again."}
          </p>
        </>
      )}
      {state === "missing" && (
        <>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            Thanks!
          </h1>
          <p className="mt-4 text-sm text-white/55">
            If you completed a payment, your receipt is on its way.
          </p>
        </>
      )}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link to="/" data-testid="payment-success-home-button" className="btn-primary">
          Back to home
        </Link>
        <Link to="/pay" data-testid="payment-success-again-button" className="btn-ghost">
          Make another payment
        </Link>
      </div>
    </div>
  );
}
