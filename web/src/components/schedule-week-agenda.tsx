import type { ReactNode } from "react";

/** Ordre d’affichage : Lun … Sam, Dim (0) en dernier */
const WEEKDAY_COLUMNS: { weekday: number; labelShort: string; labelLong: string }[] = [
  { weekday: 1, labelShort: "Lun", labelLong: "Lundi" },
  { weekday: 2, labelShort: "Mar", labelLong: "Mardi" },
  { weekday: 3, labelShort: "Mer", labelLong: "Mercredi" },
  { weekday: 4, labelShort: "Jeu", labelLong: "Jeudi" },
  { weekday: 5, labelShort: "Ven", labelLong: "Vendredi" },
  { weekday: 6, labelShort: "Sam", labelLong: "Samedi" },
  { weekday: 0, labelShort: "Dim", labelLong: "Dimanche" },
];

export type ScheduleAgendaEntryBase = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  title: string;
  room?: string | null;
  matiere?: string | null;
  groupe?: string | null;
  professeur?: { name: string | null } | null;
};

type Props<T extends ScheduleAgendaEntryBase> = {
  entries: T[];
  getMeta?: (entry: T) => string | null;
  getProfessorName?: (entry: T) => string | null;
  renderBlockFooter?: (entry: T) => ReactNode;
  variant?: "default" | "brand";
  dayLabelStyle?: "short" | "long";
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

function courseName(entry: ScheduleAgendaEntryBase) {
  return entry.matiere?.trim() || entry.title;
}

export function ScheduleWeekAgenda<T extends ScheduleAgendaEntryBase>({
  entries,
  getMeta,
  getProfessorName,
  renderBlockFooter,
  dayLabelStyle = "long",
}: Props<T>) {
  const hasSunday = entries.some((e) => e.weekday === 0);
  const columns = hasSunday ? WEEKDAY_COLUMNS : WEEKDAY_COLUMNS.filter((c) => c.weekday !== 0);

  const entriesByDay = new Map<number, T[]>();
  for (const e of entries) {
    const list = entriesByDay.get(e.weekday) ?? [];
    list.push(e);
    entriesByDay.set(e.weekday, list);
  }
  for (const [, list] of entriesByDay) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  const gridCols = hasSunday
    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-7"
    : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-6";

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-navy/55">
        Heure · Cours · Professeur · Salle
      </p>
      <div className={`grid gap-3 ${gridCols}`}>
        {columns.map((col) => {
          const dayEntries = entriesByDay.get(col.weekday) ?? [];
          const label = dayLabelStyle === "short" ? col.labelShort : col.labelLong;
          return (
            <section
              key={col.weekday}
              className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gold/35 bg-white shadow-sm"
            >
              <h3 className="border-b border-gold/25 bg-gold/10 px-3 py-2.5 text-center text-sm font-bold text-navy">
                {label}
              </h3>
              <div className="flex flex-1 flex-col gap-2 p-2.5">
                {dayEntries.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-navy/40">Aucun cours</p>
                ) : (
                  dayEntries.map((e) => {
                    const prof =
                      getProfessorName?.(e) ?? e.professeur?.name?.trim() ?? null;
                    const extra = getMeta?.(e) ?? null;
                    return (
                      <article
                        key={e.id}
                        className="rounded-xl border border-gold/30 bg-[#fffdf8] p-3"
                      >
                        <p className="text-sm font-bold tabular-nums text-mauve">
                          {formatTime(e.startTime)} – {formatTime(e.endTime)}
                        </p>
                        <p className="mt-1.5 text-sm font-semibold leading-snug text-navy">
                          {courseName(e)}
                        </p>
                        {e.matiere && e.title && e.title !== e.matiere ? (
                          <p className="mt-0.5 text-xs text-navy/65">{e.title}</p>
                        ) : null}
                        <dl className="mt-2 space-y-1 text-xs text-navy/80">
                          <div className="flex gap-2">
                            <dt className="w-10 shrink-0 font-semibold text-navy/50">Prof</dt>
                            <dd className="min-w-0 break-words">{prof || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-10 shrink-0 font-semibold text-navy/50">Salle</dt>
                            <dd className="min-w-0 break-words">{e.room?.trim() || "—"}</dd>
                          </div>
                          {e.groupe ? (
                            <div className="flex gap-2">
                              <dt className="w-10 shrink-0 font-semibold text-navy/50">Classe</dt>
                              <dd className="min-w-0 break-words">{e.groupe}</dd>
                            </div>
                          ) : null}
                          {extra ? (
                            <div className="flex gap-2">
                              <dt className="w-10 shrink-0 font-semibold text-navy/50">Info</dt>
                              <dd className="min-w-0 break-words">{extra}</dd>
                            </div>
                          ) : null}
                        </dl>
                        {renderBlockFooter ? (
                          <div className="mt-2 border-t border-gold/20 pt-2">
                            {renderBlockFooter(e)}
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
