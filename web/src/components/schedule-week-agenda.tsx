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

const ROW_PX = 64;
const DAY_START_H = 8;
const DAY_END_H = 20;

type SubjectTone = {
  bg: string;
  border: string;
  text: string;
  legend: string;
};

const SUBJECT_TONES: { test: RegExp; tone: SubjectTone; label: string }[] = [
  {
    test: /math/i,
    label: "Mathématiques",
    tone: {
      bg: "bg-sky-100",
      border: "border-sky-300",
      text: "text-sky-900",
      legend: "bg-sky-400",
    },
  },
  {
    test: /physique|chimie/i,
    label: "Physique-Chimie",
    tone: {
      bg: "bg-emerald-100",
      border: "border-emerald-300",
      text: "text-emerald-900",
      legend: "bg-emerald-400",
    },
  },
  {
    test: /fran[cç]/i,
    label: "Français",
    tone: {
      bg: "bg-amber-100",
      border: "border-amber-300",
      text: "text-amber-900",
      legend: "bg-amber-400",
    },
  },
  {
    test: /anglais|english/i,
    label: "Anglais",
    tone: {
      bg: "bg-rose-100",
      border: "border-rose-300",
      text: "text-rose-900",
      legend: "bg-rose-400",
    },
  },
  {
    test: /svt|vie et terre/i,
    label: "SVT",
    tone: {
      bg: "bg-violet-100",
      border: "border-violet-300",
      text: "text-violet-900",
      legend: "bg-violet-400",
    },
  },
  {
    test: /histoire|g[eé]ograph/i,
    label: "Histoire-Géo",
    tone: {
      bg: "bg-teal-100",
      border: "border-teal-300",
      text: "text-teal-900",
      legend: "bg-teal-400",
    },
  },
];

const DEFAULT_TONE: SubjectTone = {
  bg: "bg-gold/15",
  border: "border-gold/40",
  text: "text-navy",
  legend: "bg-gold",
};

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
  showLegend?: boolean;
  compact?: boolean;
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

function courseName(entry: ScheduleAgendaEntryBase) {
  return entry.matiere?.trim() || entry.title;
}

function parseMinutes(t: string): number {
  const [h, m] = t.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function subjectTone(name: string): SubjectTone {
  for (const s of SUBJECT_TONES) {
    if (s.test.test(name)) return s.tone;
  }
  return DEFAULT_TONE;
}

function hourRange(entries: ScheduleAgendaEntryBase[]): { startH: number; endH: number } {
  if (entries.length === 0) return { startH: DAY_START_H, endH: DAY_END_H };
  let minM = Infinity;
  let maxM = -Infinity;
  for (const e of entries) {
    minM = Math.min(minM, parseMinutes(e.startTime));
    maxM = Math.max(maxM, parseMinutes(e.endTime));
  }
  const startH = Math.min(DAY_START_H, Math.max(7, Math.floor(minM / 60)));
  const endH = Math.max(DAY_END_H, Math.min(22, Math.ceil(maxM / 60)));
  return { startH, endH: Math.max(startH + 1, endH) };
}

export function ScheduleWeekAgenda<T extends ScheduleAgendaEntryBase>({
  entries,
  getMeta,
  getProfessorName,
  renderBlockFooter,
  dayLabelStyle = "short",
  showLegend = true,
  compact = false,
}: Props<T>) {
  const hasSunday = entries.some((e) => e.weekday === 0);
  const columns = hasSunday
    ? WEEKDAY_COLUMNS
    : WEEKDAY_COLUMNS.filter((c) => c.weekday !== 0);

  const { startH, endH } = hourRange(entries);
  const hours = Array.from({ length: endH - startH }, (_, i) => startH + i);
  const startMin = startH * 60;

  const entriesByDay = new Map<number, T[]>();
  for (const e of entries) {
    const list = entriesByDay.get(e.weekday) ?? [];
    list.push(e);
    entriesByDay.set(e.weekday, list);
  }

  const legendItems = SUBJECT_TONES.filter((s) =>
    entries.some((e) => s.test.test(courseName(e))),
  );

  const rowPx = compact ? 52 : ROW_PX;

  return (
    <div className="schedule-agenda space-y-4" data-schedule-agenda>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm print:shadow-none">
        <div
          className="min-w-[720px]"
          style={{
            display: "grid",
            gridTemplateColumns: `56px repeat(${columns.length}, minmax(100px, 1fr))`,
          }}
        >
          {/* Header */}
          <div className="border-b border-zinc-200 bg-zinc-50 px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Heure
          </div>
          {columns.map((col) => (
            <div
              key={`h-${col.weekday}`}
              className="border-b border-l border-zinc-200 bg-zinc-50 px-2 py-3 text-center text-sm font-bold text-navy"
            >
              {dayLabelStyle === "long" ? col.labelLong : col.labelShort}
            </div>
          ))}

          {/* Time gutter */}
          <div
            className="relative border-zinc-100 bg-zinc-50/80"
            style={{ height: hours.length * rowPx }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-0 left-0 flex items-start justify-end border-b border-zinc-100 pr-2 pt-1 text-[11px] font-semibold tabular-nums text-zinc-500"
                style={{ top: (h - startH) * rowPx, height: rowPx }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {columns.map((col) => {
            const dayEntries = entriesByDay.get(col.weekday) ?? [];
            return (
              <div
                key={col.weekday}
                className="relative border-l border-zinc-200"
                style={{ height: hours.length * rowPx }}
              >
                {hours.map((h) => (
                  <div
                    key={`${col.weekday}-${h}`}
                    className="absolute inset-x-0 border-b border-zinc-100"
                    style={{ top: (h - startH) * rowPx, height: rowPx }}
                  >
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-zinc-200">
                      —
                    </span>
                  </div>
                ))}

                {dayEntries.map((e) => {
                  const s = parseMinutes(e.startTime);
                  const en = parseMinutes(e.endTime);
                  const top = ((s - startMin) / 60) * rowPx;
                  const height = Math.max(((en - s) / 60) * rowPx - 4, rowPx * 0.7);
                  const name = courseName(e);
                  const tone = subjectTone(name);
                  const prof =
                    getProfessorName?.(e) ?? e.professeur?.name?.trim() ?? null;
                  const extra = getMeta?.(e) ?? null;
                  const level = e.groupe?.trim() || extra || null;

                  return (
                    <article
                      key={e.id}
                      className={`absolute inset-x-1 z-[1] overflow-hidden rounded-lg border px-2 py-1.5 shadow-sm ${tone.bg} ${tone.border} ${tone.text}`}
                      style={{ top: top + 2, height }}
                      title={`${formatTime(e.startTime)}–${formatTime(e.endTime)} · ${name}`}
                    >
                      <p className="truncate text-[12px] font-bold leading-tight">{name}</p>
                      {level ? (
                        <p className="truncate text-[10px] font-medium opacity-80">{level}</p>
                      ) : null}
                      {prof ? (
                        <p className="mt-0.5 truncate text-[10px] opacity-75">
                          Prof. {prof}
                        </p>
                      ) : null}
                      {e.room?.trim() ? (
                        <p className="truncate text-[10px] opacity-70">{e.room}</p>
                      ) : null}
                      {renderBlockFooter ? (
                        <div className="mt-1 print:hidden">{renderBlockFooter(e)}</div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {showLegend && legendItems.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs text-navy print:border-zinc-300">
          <span className="font-semibold text-zinc-500">Légende</span>
          {legendItems.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${item.tone.legend}`} />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
