import { notFound } from "next/navigation";
import { ScheduleWeekAgenda } from "@/components/schedule-week-agenda";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ groupe?: string; annee?: string }>;
};

export default async function ImprimerAgendaGroupePage({ searchParams }: Props) {
  const { groupe, annee } = await searchParams;
  if (!groupe) notFound();

  const entries = await prisma.scheduleEntry.findMany({
    where: {
      groupe,
      ...(annee ? { anneeScolaire: annee } : {}),
    },
    include: { professeur: { select: { name: true } } },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
  });

  return (
    <main className="mx-auto max-w-4xl p-6 print:p-2">
      <div className="rounded-xl border border-zinc-200 p-6 print:border-0">
        <h1 className="text-2xl font-bold text-navy">Agenda du groupe {groupe}</h1>
        <p className="mt-1 text-sm text-zinc-600">Année scolaire: {annee ?? "Toutes"}</p>

        {entries.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">Aucun créneau trouvé pour ce filtre.</p>
        ) : (
          <div className="mt-6 print:mt-4">
            <ScheduleWeekAgenda dayLabelStyle="long" entries={entries} />
          </div>
        )}
      </div>
    </main>
  );
}
