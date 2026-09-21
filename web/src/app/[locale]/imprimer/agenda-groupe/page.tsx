import { notFound } from "next/navigation";
import { ScheduleAgendaToolbar } from "@/components/schedule-agenda-toolbar";
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
    <main className="schedule-print-root mx-auto max-w-6xl bg-zinc-100 p-4 print:max-w-none print:bg-white print:p-0">
      <style>{`@media print { @page { size: A4 landscape; margin: 10mm; } }`}</style>
      <ScheduleAgendaToolbar title={`Emploi du temps — ${groupe}`} />
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 print:border-0 print:p-0">
        <div className="mb-4 print:mb-2">
          <h1 className="text-xl font-bold text-navy">Centre Bêta — Agenda {groupe}</h1>
          <p className="text-sm text-zinc-600">
            Année scolaire : {annee ?? "Toutes"}
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucun créneau trouvé pour ce filtre.</p>
        ) : (
          <ScheduleWeekAgenda dayLabelStyle="short" entries={entries} />
        )}
      </div>
    </main>
  );
}
