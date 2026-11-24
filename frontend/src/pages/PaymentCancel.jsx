import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-24 text-center" data-testid="payment-cancel-page">
      <XCircle className="h-16 w-16 text-white/40" />
      <h1 className="mt-6 font-display text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
        Payment <span className="text-brand-yellow">cancelled.</span>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
        No charge was made. You can try again whenever you're ready — or call the shop and we'll
        sort it out together.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link to="/pay" data-testid="payment-cancel-retry-button" className="btn-primary">
          Try again
        </Link>
        <Link to="/" data-testid="payment-cancel-home-button" className="btn-ghost">
          Back to home
        </Link>
      </div>
    </div>
  );
}
