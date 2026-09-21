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

/** Hauteur d’une heure — plus grande pour lisibilité */
const ROW_PX = 100;
/** On ignore le matin (8h–14h) : grille à partir de 14h */
const DAY_START_H = 14;
const DAY_END_H = 21;

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

type LaidOut<T> = {
  entry: T;
  startMin: number;
  endMin: number;
  col: number;
  colCount: number;
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
  const floor = DAY_START_H;
  if (entries.length === 0) return { startH: floor, endH: DAY_END_H };
  let maxM = floor * 60;
  for (const e of entries) {
    maxM = Math.max(maxM, parseMinutes(e.endTime));
  }
  const endH = Math.max(DAY_END_H, Math.min(23, Math.ceil(maxM / 60)));
  return { startH: floor, endH: Math.max(floor + 1, endH) };
}

/** Place les cours qui se chevauchent côte à côte (pas l’un sur l’autre). */
function layoutDayEntries<T extends ScheduleAgendaEntryBase>(
  dayEntries: T[],
  gridStartMin: number,
): LaidOut<T>[] {
  const visible = dayEntries
    .map((entry) => {
      let startMin = parseMinutes(entry.startTime);
      let endMin = parseMinutes(entry.endTime);
      if (endMin <= gridStartMin) return null;
      if (startMin < gridStartMin) startMin = gridStartMin;
      if (endMin <= startMin) return null;
      return { entry, startMin, endMin };
    })
    .filter((x): x is { entry: T; startMin: number; endMin: number } => x !== null)
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const withCol: (typeof visible[number] & { col: number })[] = [];
  const active: { endMin: number; col: number }[] = [];

  for (const item of visible) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].endMin <= item.startMin) active.splice(i, 1);
    }
    const used = new Set(active.map((a) => a.col));
    let col = 0;
    while (used.has(col)) col += 1;
    active.push({ endMin: item.endMin, col });
    withCol.push({ ...item, col });
  }

  // Pour chaque cluster qui se chevauche, même colCount
  const result: LaidOut<T>[] = withCol.map((item) => {
    const overlapping = withCol.filter(
      (o) => o.startMin < item.endMin && o.endMin > item.startMin,
    );
    const colCount = Math.max(1, ...overlapping.map((o) => o.col + 1));
    return {
      entry: item.entry,
      startMin: item.startMin,
      endMin: item.endMin,
      col: item.col,
      colCount,
    };
  });

  // Uniformiser le colCount dans chaque groupe qui se touche
  for (const item of result) {
    const group = result.filter(
      (o) => o.startMin < item.endMin && o.endMin > item.startMin,
    );
    const maxCols = Math.max(...group.map((g) => g.colCount));
    for (const g of group) g.colCount = maxCols;
  }

  return result;
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
  const rowPx = compact ? 80 : ROW_PX;

  const entriesByDay = new Map<number, T[]>();
  for (const e of entries) {
    const list = entriesByDay.get(e.weekday) ?? [];
    list.push(e);
    entriesByDay.set(e.weekday, list);
  }

  const legendItems = SUBJECT_TONES.filter((s) =>
    entries.some((e) => s.test.test(courseName(e))),
  );

  return (
    <div className="schedule-agenda space-y-4" data-schedule-agenda>
      <p className="text-xs text-navy/55 print:hidden">
        Affichage après-midi / soirée (à partir de 14h) — blocs agrandis pour une meilleure lecture.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm print:shadow-none">
        <div
          className="min-w-[860px]"
          style={{
            display: "grid",
            gridTemplateColumns: `64px repeat(${columns.length}, minmax(120px, 1fr))`,
          }}
        >
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

          <div
            className="relative border-zinc-100 bg-zinc-50/80"
            style={{ height: hours.length * rowPx }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-0 left-0 flex items-start justify-end border-b border-zinc-100 pr-2 pt-2 text-xs font-bold tabular-nums text-zinc-600"
                style={{ top: (h - startH) * rowPx, height: rowPx }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {columns.map((col) => {
            const laidOut = layoutDayEntries(entriesByDay.get(col.weekday) ?? [], startMin);
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
                  />
                ))}

                {laidOut.map(({ entry: e, startMin: s, endMin: en, col: lane, colCount }) => {
                  const top = ((s - startMin) / 60) * rowPx;
                  const height = Math.max(((en - s) / 60) * rowPx - 6, rowPx * 0.85);
                  const name = courseName(e);
                  const tone = subjectTone(name);
                  const prof =
                    getProfessorName?.(e) ?? e.professeur?.name?.trim() ?? null;
                  const extra = getMeta?.(e) ?? null;
                  const level = e.groupe?.trim() || extra || null;
                  const widthPct = 100 / colCount;
                  const leftPct = lane * widthPct;

                  return (
                    <article
                      key={e.id}
                      className={`absolute z-[1] overflow-hidden rounded-xl border-2 px-2.5 py-2 shadow-md ${tone.bg} ${tone.border} ${tone.text}`}
                      style={{
                        top: top + 3,
                        height,
                        left: `calc(${leftPct}% + 3px)`,
                        width: `calc(${widthPct}% - 6px)`,
                      }}
                      title={`${formatTime(e.startTime)}–${formatTime(e.endTime)} · ${name}`}
                    >
                      <p className="text-[11px] font-bold tabular-nums opacity-80">
                        {formatTime(e.startTime)} – {formatTime(e.endTime)}
                      </p>
                      <p className="mt-0.5 text-sm font-extrabold leading-snug">{name}</p>
                      {level ? (
                        <p className="mt-0.5 text-xs font-semibold opacity-85">{level}</p>
                      ) : null}
                      {prof ? (
                        <p className="mt-1 text-xs font-medium opacity-80">Prof. {prof}</p>
                      ) : null}
                      {e.room?.trim() ? (
                        <p className="text-xs opacity-70">Salle {e.room}</p>
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
