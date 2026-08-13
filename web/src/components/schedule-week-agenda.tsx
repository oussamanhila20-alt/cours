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

const PX_PER_HOUR = 56;
/** Hauteur mini d’un créneau (évite les blocs illisibles ; peut légèrement chevaucher un créneau très court suivant) */
const MIN_BLOCK_PX = 32;
/** Hauteur mini si bouton admin sous le bloc */
const MIN_BLOCK_WITH_FOOTER_PX = 80;

function parseTimeToMinutes(t: string): number {
  const parts = t.split(":").map((x) => parseInt(x, 10));
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  return h * 60 + m;
}

function computeTimeRange(
  entries: { startTime: string; endTime: string }[],
  fallbackMin = 8 * 60,
  fallbackMax = 18 * 60,
): { min: number; max: number } {
  if (entries.length === 0) {
    return { min: fallbackMin, max: fallbackMax };
  }
  let min = Infinity;
  let max = -Infinity;
  for (const e of entries) {
    min = Math.min(min, parseTimeToMinutes(e.startTime));
    max = Math.max(max, parseTimeToMinutes(e.endTime));
  }
  min = Math.max(7 * 60, Math.floor((min - 45) / 60) * 60);
  max = Math.min(22 * 60, Math.ceil((max + 45) / 60) * 60);
  if (max <= min) {
    max = min + 60;
  }
  return { min, max };
}

export type ScheduleAgendaEntryBase = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  title: string;
};

type Props<T extends ScheduleAgendaEntryBase> = {
  entries: T[];
  getMeta?: (entry: T) => string | null;
  renderBlockFooter?: (entry: T) => ReactNode;
  variant?: "default" | "brand";
  dayLabelStyle?: "short" | "long";
};

export function ScheduleWeekAgenda<T extends ScheduleAgendaEntryBase>({
  entries,
  getMeta,
  renderBlockFooter,
  variant = "default",
  dayLabelStyle = "short",
}: Props<T>) {
  const { min, max } = computeTimeRange(entries);
  const totalMinutes = max - min;
  const columnHeight = (totalMinutes / 60) * PX_PER_HOUR;

  const hasSunday = entries.some((e) => e.weekday === 0);
  const columns = hasSunday ? WEEKDAY_COLUMNS : WEEKDAY_COLUMNS.filter((c) => c.weekday !== 0);

  const hourTicks: number[] = [];
  for (let m = min; m <= max; m += 60) {
    hourTicks.push(m);
  }

  const entriesByDay = new Map<number, T[]>();
  for (const e of entries) {
    const list = entriesByDay.get(e.weekday) ?? [];
    list.push(e);
    entriesByDay.set(e.weekday, list);
  }
  for (const [, list] of entriesByDay) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  const formatHourLabel = (minutesFromMidnight: number) => {
    const h = Math.floor(minutesFromMidnight / 60);
    const m = minutesFromMidnight % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const blockClass =
    variant === "brand"
      ? "rounded-md border border-navy/15 bg-gradient-to-br from-white to-navy/[0.04] px-2 py-1.5 text-left shadow-sm dark:border-slate-600 dark:from-slate-800/90 dark:to-slate-900/80"
      : "rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-left shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80";

  const titleClass =
    variant === "brand"
      ? "line-clamp-2 text-sm font-semibold leading-snug text-navy dark:text-gold"
      : "line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100";

  const metaClass =
    variant === "brand"
      ? "line-clamp-3 mt-1 text-[11px] leading-snug text-slate-600 dark:text-slate-400"
      : "line-clamp-3 mt-1 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400";

  const timeClass =
    variant === "brand"
      ? "text-[10px] font-medium tabular-nums text-brandblue dark:text-brandblue/90"
      : "text-[10px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400";

  const minBlock = renderBlockFooter ? MIN_BLOCK_WITH_FOOTER_PX : MIN_BLOCK_PX;

  const headerRowClass =
    "flex h-10 shrink-0 items-center justify-center border-b border-zinc-200 bg-zinc-100/90 text-xs font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100";

  const n = columns.length;
  const gridTemplate = `3.25rem repeat(${n}, minmax(6.5rem, 1fr))`;

  return (
    <div className="max-w-full overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/20">
      <div
        className="grid w-full min-w-[720px]"
        style={{
          gridTemplateColumns: gridTemplate,
          gridTemplateRows: `auto ${columnHeight}px`,
        }}
      >
        {/* Coin + en-têtes jours */}
        <div className={`${headerRowClass} border-r border-zinc-200 dark:border-zinc-700`} aria-hidden />
        {columns.map((col) => {
          const label = dayLabelStyle === "short" ? col.labelShort : col.labelLong;
          return (
            <div
              key={`h-${col.weekday}`}
              className={`${headerRowClass} border-l border-zinc-200 dark:border-zinc-700`}
            >
              {label}
            </div>
          );
        })}

        {/* Colonne des heures */}
        <div className="relative h-full min-h-0 border-r border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40">
          {hourTicks.map((tick) => {
            const top = ((tick - min) / totalMinutes) * columnHeight;
            return (
              <span
                key={tick}
                className="absolute right-1.5 -translate-y-1/2 text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400"
                style={{ top }}
              >
                {formatHourLabel(tick)}
              </span>
            );
          })}
        </div>

        {/* Une colonne par jour : repères + créneaux */}
        {columns.map((col) => {
          const dayEntries = entriesByDay.get(col.weekday) ?? [];
          return (
            <div
              key={col.weekday}
              className="relative h-full min-h-0 border-l border-zinc-200 bg-white/60 dark:border-zinc-700 dark:bg-zinc-900/30"
            >
              {hourTicks.map((tick) => {
                const top = ((tick - min) / totalMinutes) * columnHeight;
                return (
                  <div
                    key={tick}
                    className="pointer-events-none absolute right-0 left-0 border-t border-zinc-200/90 dark:border-zinc-700/80"
                    style={{ top }}
                  />
                );
              })}

              {dayEntries.map((e, idx) => {
                const start = parseTimeToMinutes(e.startTime);
                const end = parseTimeToMinutes(e.endTime);
                const durationMin = Math.max(end - start, 1);
                const topPx = ((start - min) / totalMinutes) * columnHeight;
                const rawHeight = (durationMin / totalMinutes) * columnHeight;
                const heightPx = Math.max(rawHeight, minBlock);
                const meta = getMeta?.(e) ?? null;

                return (
                  <div
                    key={e.id}
                    className="absolute right-1 left-1 box-border overflow-hidden"
                    style={{
                      top: topPx,
                      height: heightPx,
                      zIndex: 10 + idx,
                    }}
                  >
                    <div className={`flex h-full min-h-0 flex-col ${blockClass}`}>
                      <div className="min-h-0 flex-1 overflow-hidden">
                        <div className={titleClass}>{e.title}</div>
                        <div className={timeClass}>
                          {e.startTime.slice(0, 5)} – {e.endTime.slice(0, 5)}
                        </div>
                        {meta ? <div className={metaClass}>{meta}</div> : null}
                      </div>
                      {renderBlockFooter ? (
                        <div className="mt-auto shrink-0 border-t border-zinc-100 pt-1 dark:border-zinc-700/80">
                          {renderBlockFooter(e)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
