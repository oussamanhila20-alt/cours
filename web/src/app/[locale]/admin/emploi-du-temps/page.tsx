import { Link } from "@/i18n/navigation";
import { createScheduleEntryAction } from "@/actions/schedule";
import { ScheduleWeekAgenda } from "@/components/schedule-week-agenda";
import { prisma } from "@/lib/prisma";
import { MATIERES, NIVEAUX } from "@/lib/course-taxonomy";
import { ScheduleRowDelete } from "@/components/schedule-row-delete";

const jours = [
  { v: 1, l: "Lundi" },
  { v: 2, l: "Mardi" },
  { v: 3, l: "Mercredi" },
  { v: 4, l: "Jeudi" },
  { v: 5, l: "Vendredi" },
  { v: 6, l: "Samedi" },
  { v: 0, l: "Dimanche" },
];

export default async function AdminEmploiDuTempsPage() {
  const [schedule, profs, groups] = await Promise.all([
    prisma.scheduleEntry.findMany({
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      include: { professeur: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { role: "PROFESSEUR" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.group.findMany({
      orderBy: [
        { anneeScolaire: "desc" },
        { name: "asc" },
        { matiere: "asc" },
      ],
      select: { id: true, name: true, matiere: true, anneeScolaire: true },
    }),
  ]);

  const groupsForPrint = Array.from(
    new Set(
      schedule
        .filter((e) => e.groupe)
        .map((e) => `${e.groupe}|||${e.anneeScolaire ?? ""}`),
    ),
  )
    .map((k) => {
      const [groupe, annee] = k.split("|||");
      return { groupe, annee };
    })
    .sort((a, b) => `${a.groupe}${a.annee}`.localeCompare(`${b.groupe}${b.annee}`));

  return (
    <div className="space-y-6">
      <p className="text-sm text-navy/70">
        <Link href="/admin" className="text-navy hover:underline dark:text-gold">
          ← Tableau de bord
        </Link>
        {" · "}
        Créneaux visibles selon le groupe et l’année scolaire renseignés (laisser vides pour tout le monde).
        Rattachez chaque créneau à un groupe du référentiel (créé dans{" "}
        <Link href="/admin/groupes" className="font-medium text-navy underline-offset-2 hover:underline dark:text-gold">
          Groupes
        </Link>
        ) — max 5 créneaux par groupe.
      </p>

      {groupsForPrint.length > 0 ? (
        <section className="rounded-xl border border-gold/30 bg-white p-4">
          <h3 className="text-base font-semibold">Impression des agendas par groupe</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {groupsForPrint.map((g) => (
              <Link
                key={`${g.groupe}-${g.annee}`}
                href={`/imprimer/agenda-groupe?groupe=${encodeURIComponent(g.groupe)}${g.annee ? `&annee=${encodeURIComponent(g.annee)}` : ""}`}
                target="_blank"
                className="rounded-full border border-navy/25 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 dark:border-gold/40 dark:text-gold"
              >
                Imprimer {g.groupe}
                {g.annee ? ` (${g.annee})` : ""}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <form
        action={createScheduleEntryAction}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-gold/30 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-xs">
          Titre
          <input
            name="title"
            required
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Jour
          <select
            name="weekday"
            required
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          >
            {jours.map((d) => (
              <option key={d.v} value={d.v}>
                {d.l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Début
          <input
            name="startTime"
            type="time"
            required
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Fin
          <input
            name="endTime"
            type="time"
            required
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Rattacher au référentiel groupe (optionnel)
          <select
            name="groupId"
            className="min-w-[14rem] rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          >
            <option value="">— Aucun —</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} · {g.anneeScolaire}
                {g.matiere ? ` · ${g.matiere}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Professeur
          <select
            name="professeurId"
            className="min-w-[10rem] rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          >
            <option value="">—</option>
            {profs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Groupe / classe
          <input
            name="groupe"
            placeholder="ex. 4ème A"
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Année scolaire
          <input
            name="anneeScolaire"
            placeholder="ex. 2025-2026"
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Niveau
          <select
            name="niveau"
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          >
            <option value="">—</option>
            {NIVEAUX.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Matière
          <select
            name="matiere"
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          >
            <option value="">—</option>
            {MATIERES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Salle
          <input
            name="room"
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy"
        >
          Ajouter
        </button>
      </form>

      {schedule.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gold/40 bg-white px-4 py-8 text-center text-sm text-navy/70">
          Aucun créneau enregistré.
        </p>
      ) : (
        <ScheduleWeekAgenda
          entries={schedule}
          getMeta={(e) =>
            [
              e.professeur?.name,
              e.matiere,
              e.niveau,
              e.groupe ? `groupe ${e.groupe}` : null,
              e.anneeScolaire,
              e.room,
            ]
              .filter(Boolean)
              .join(" · ") || null
          }
          renderBlockFooter={(e) => <ScheduleRowDelete id={e.id} />}
        />
      )}
    </div>
  );
}
