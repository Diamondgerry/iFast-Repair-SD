import { Bolt } from "@/components/Logo";

const WORDS = [
  { text: "Repair", style: "text-white" },
  { text: "Restore", style: "text-outline" },
  { text: "Revive", style: "text-brand-yellow" },
];

const Sequence = ({ hidden }) => (
  <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
    {WORDS.map((word) => (
      <span key={word.text} className="flex items-center gap-10">
        <span
          className={`whitespace-nowrap font-display text-5xl font-black uppercase leading-none tracking-tight md:text-7xl ${word.style}`}
        >
          {word.text}
        </span>
        <Bolt className="h-6 w-6 md:h-8 md:w-8" fill="#FFDE00" />
      </span>
    ))}
  </div>
);

export default function Marquee() {
  return (
    <section
      className="overflow-hidden border-y border-white/10 py-8 md:py-10"
      data-testid="marquee-section"
    >
      <div className="marquee-track flex w-max">
        <Sequence />
        <Sequence hidden />
      </div>
    </section>
  );
}
