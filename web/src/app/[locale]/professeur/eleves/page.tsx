import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfesseurElevesPage() {
  const session = await auth();
  const attempts = await prisma.exerciseAttempt.findMany({
    where: { exercise: { authorId: session!.user.id } },
    include: { student: true, exercise: true },
    orderBy: { submittedAt: "desc" },
    take: 80,
  });

  const byStudent = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      groupe: string | null;
      anneeScolaire: string | null;
      count: number;
      last: Date;
    }
  >();
  for (const a of attempts) {
    const id = a.studentId;
    const cur = byStudent.get(id);
    if (!cur) {
      byStudent.set(id, {
        id,
        name: a.student.name,
        email: a.student.email,
        groupe: a.student.groupe,
        anneeScolaire: a.student.anneeScolaire,
        count: 1,
        last: a.submittedAt,
      });
    } else {
      cur.count += 1;
      if (a.submittedAt > cur.last) cur.last = a.submittedAt;
    }
  }

  const summary = [...byStudent.values()].sort(
    (a, b) => b.last.getTime() - a.last.getTime(),
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Aperçu des élèves ayant rendu au moins un exercice sur vos sujets.
      </p>
      {summary.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Aucune activité enregistrée.
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4">Élève</th>
                <th className="py-2 pr-4">E-mail</th>
                <th className="py-2 pr-4">Groupe</th>
                <th className="py-2 pr-4">Année</th>
                <th className="py-2 pr-4">Tentatives</th>
                <th className="py-2">Dernière</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-zinc-100 dark:border-zinc-900"
                >
                  <td className="py-2 pr-4 font-medium">{s.name}</td>
                  <td className="py-2 pr-4 text-zinc-600">{s.email}</td>
                  <td className="py-2 pr-4 text-xs text-zinc-600">
                    {s.groupe ?? "—"}
                  </td>
                  <td className="py-2 pr-4 text-xs text-zinc-600">
                    {s.anneeScolaire ?? "—"}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">{s.count}</td>
                  <td className="py-2 text-zinc-500">
                    {s.last.toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Dernières tentatives
      </h3>
      <ul className="space-y-2 text-sm">
        {attempts.slice(0, 15).map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-900"
          >
            <span className="font-medium">{a.student.name}</span>
            <span className="text-zinc-500"> — {a.exercise.title}</span>
            {a.score != null ? (
              <span className="ml-2 tabular-nums text-zinc-600">
                {a.score.toFixed(1)}/{a.maxScore?.toFixed(1) ?? "?"}
              </span>
            ) : (
              <span className="ml-2 text-gold">en attente</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
