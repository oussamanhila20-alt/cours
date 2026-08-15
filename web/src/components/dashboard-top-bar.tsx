import { Link } from "@/i18n/navigation";

type Accent = "teal" | "indigo" | "amber";

const badgeClass: Record<Accent, string> = {
  teal: "bg-brandblue/15 text-navy ring-brandblue/20 dark:bg-brandblue/20 dark:text-brandblue/90 dark:ring-brandblue/25",
  indigo:
    "bg-navy/12 text-navy ring-navy/20 dark:bg-navy/20 dark:text-white/90 dark:ring-navy/30",
  amber:
    "bg-gold/15 text-navy ring-gold/40 dark:bg-gold/20 dark:text-gold dark:ring-gold/35",
};

export function DashboardTopBar({
  label,
  accent,
}: {
  label: string;
  accent: Accent;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-gold/25 bg-white/95 px-3 py-2.5 backdrop-blur-md md:px-4 md:py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-mauve"
        >
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gold/35 bg-white text-navy shadow-sm transition group-hover:border-mauve/40 group-hover:bg-mauve/10"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </span>
          Accueil
        </Link>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${badgeClass[accent]}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
