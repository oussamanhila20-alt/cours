import { Link } from "@/i18n/navigation";
import { createAbsenceAction, deleteAbsenceAction } from "@/actions/absences";
import { prisma } from "@/lib/prisma";

export default async function AdminAbsencesPage() {
  const [eleves, absences] = await Promise.all([
    prisma.user.findMany({
      where: { role: "ELEVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, groupe: true, anneeScolaire: true },
    }),
    prisma.absence.findMany({
      orderBy: { date: "desc" },
      take: 200,
      include: { student: { select: { name: true, groupe: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/admin" className="text-navy hover:underline dark:text-gold">
          ← Tableau de bord
        </Link>
      </p>

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="text-lg font-semibold">Nouvelle absence</h3>
        <form action={createAbsenceAction} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            Élève
            <select name="studentId" required className="min-h-11 w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700">
              <option value="">—</option>
              {eleves.map((e) => (
                <option key={e.id} value={e.id}>{e.name}{e.groupe ? ` (${e.groupe})` : ""}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Date
            <input name="date" type="date" required className="min-h-11 w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700" />
          </label>
          <label className="flex items-center gap-2 text-xs pb-1">
            <input type="checkbox" name="justified" value="true" />
            Absence justifiée
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Motif
            <input name="note" placeholder="Optionnel" className="min-h-11 w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700" />
          </label>
          <button type="submit" className="min-h-12 rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-navy/90 sm:col-span-2">Ajouter</button>
        </form>
      </section>

      <section>
        <h3 className="text-lg font-semibold">Historique des absences</h3>
        <div className="mt-3 data-table-wrap">
          <table className="data-table">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Élève</th>
                <th className="p-3">Groupe</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Motif</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {absences.map((a) => (
                <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="p-3 whitespace-nowrap">{new Date(a.date).toLocaleDateString("fr-FR")}</td>
                  <td className="p-3 font-medium">{a.student.name}</td>
                  <td className="p-3">{a.student.groupe ?? "—"}</td>
                  <td className="p-3">{a.justified ? "Justifiée" : "Non justifiée"}</td>
                  <td className="p-3 text-zinc-600 dark:text-zinc-300">{a.note ?? "—"}</td>
                  <td className="p-3">
                    <form action={deleteAbsenceAction.bind(null, a.id)}>
                      <button type="submit" className="text-xs text-red-600 hover:underline dark:text-red-400">Supprimer</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
