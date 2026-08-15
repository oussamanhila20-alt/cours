import { auth } from "@/auth";
import { ScheduleWeekAgenda } from "@/components/schedule-week-agenda";
import { prisma } from "@/lib/prisma";

export default async function ProfesseurEmploiDuTempsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const [entries, affectations, groups] = await Promise.all([
    prisma.scheduleEntry.findMany({
      where: { professeurId: userId },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      include: { professeur: { select: { name: true } } },
    }),
    prisma.professeurAffectation.findMany({
      where: { professeurId: userId },
      orderBy: [{ anneeScolaire: "desc" }, { groupe: "asc" }, { matiere: "asc" }],
    }),
    prisma.group.findMany({
      include: { _count: { select: { students: true } } },
    }),
  ]);

  const studentsByGroupeKey = new Map(
    groups.map((g) => [`${g.name}\0${g.anneeScolaire}`, g._count.students] as const),
  );

  return (
    <div className="space-y-10">
      <section className="brand-card p-5 sm:p-6">
        <div className="brand-card-inner">
          <h3 className="brand-section-title">Mes affectations</h3>
          <p className="brand-section-subtitle mt-2">
            Matière et groupe (référentiel administration). Le nombre d’élèves reflète les affectations
            dans « Groupes ».
          </p>
        </div>
        {affectations.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-navy/15 bg-navy/[0.02] px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/30">
            Aucune affectation enregistrée par l’administration pour le moment.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {affectations.map((a) => {
              const n =
                studentsByGroupeKey.get(`${a.groupe}\0${a.anneeScolaire}`) ?? null;
              const elevesLabel =
                n === null
                  ? null
                  : n === 0
                    ? "Aucun élève affecté à ce groupe pour l’instant."
                    : `${n} élève${n > 1 ? "s" : ""} dans ce groupe`;
              return (
                <li key={a.id} className="brand-list-item">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-base font-semibold text-navy dark:text-gold">{a.matiere}</span>
                    <span className="text-slate-400 dark:text-slate-500">—</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{a.groupe}</span>
                    <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-navy dark:bg-gold/20 dark:text-gold">
                      {a.anneeScolaire}
                    </span>
                  </div>
                  {elevesLabel ? (
                    <p className="mt-2 border-t border-navy/5 pt-2 text-xs text-slate-600 dark:border-slate-700/80 dark:text-slate-400">
                      <span className="text-brandblue dark:text-brandblue/90">{elevesLabel}</span>
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="brand-card p-5 sm:p-6">
        <h3 className="brand-section-title">Créneaux à l’emploi du temps</h3>
        <p className="brand-section-subtitle mt-2">
          Horaires où vous êtes désigné comme enseignant.
        </p>
        {entries.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-brandblue/25 bg-brandblue/[0.03] p-10 text-center text-sm text-slate-500 dark:border-brandblue/20 dark:bg-brandblue/[0.04] dark:text-slate-400">
            Aucun créneau ne vous est encore attribué.
          </div>
        ) : (
          <div className="mt-5">
            <ScheduleWeekAgenda variant="brand" entries={entries} />
          </div>
        )}
      </section>
    </div>
  );
}
