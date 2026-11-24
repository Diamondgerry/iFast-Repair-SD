import { Link } from "react-router-dom";

export const Bolt = ({ className = "h-5 w-5", fill = "#050505" }) => (
  <svg viewBox="0 0 64 64" className={className} fill={fill} aria-hidden="true">
    <path d="M32 4 8 38h16L24 60 56 22H38Z" />
  </svg>
);

export default function Logo() {
  return (
    <Link to="/" data-testid="logo-link" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center bg-brand-yellow">
        <Bolt className="h-5 w-5" />
      </span>
      <span className="font-display text-base font-black leading-none tracking-tight text-white md:text-lg">
        iFast Repair<span className="text-brand-yellow">+</span>
      </span>
    </Link>
  );
}
