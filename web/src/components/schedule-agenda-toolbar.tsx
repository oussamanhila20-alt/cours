"use client";

export function ScheduleAgendaToolbar({
  title = "Emploi du temps",
}: {
  title?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </span>
        <div>
          <h2 className="text-base font-bold text-navy">{title}</h2>
          <p className="text-xs text-navy/60">Grille hebdomadaire · téléchargeable</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-navy px-4 text-xs font-semibold text-white hover:bg-navy/90"
        >
          Télécharger / Imprimer
        </button>
      </div>
    </div>
  );
}
