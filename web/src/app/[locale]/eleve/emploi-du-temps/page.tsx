import { auth } from "@/auth";
import { ScheduleWeekAgenda } from "@/components/schedule-week-agenda";
import { andClauseSchedulePourEleve } from "@/lib/eleve-visibility";
import { prisma } from "@/lib/prisma";

export default async function EleveEmploiDuTempsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { groupe: true, anneeScolaire: true },
  });

  const entries = await prisma.scheduleEntry.findMany({
    where: {
      AND: andClauseSchedulePourEleve({
        groupe: user?.groupe ?? null,
        anneeScolaire: user?.anneeScolaire ?? null,
      }),
    },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    include: { professeur: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-navy/70">
        Séances correspondant à votre classe et à votre année scolaire (profil), ou créneaux ouverts à tous.
      </p>
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold/40 bg-white p-8 text-center text-sm text-navy/70">
          Emploi du temps non renseigné.
        </div>
      ) : (
        <ScheduleWeekAgenda
          entries={entries}
          getMeta={(e) =>
            [
              e.professeur?.name ? `Prof. ${e.professeur.name}` : null,
              e.matiere,
              e.niveau,
              e.room,
            ]
              .filter(Boolean)
              .join(" · ") || null
          }
        />
      )}
    </div>
  );
}
