import { AdminCreateUserForm } from "@/components/admin-create-user-form";
import { adminDeleteUserAction } from "@/actions/admin-users";
import { auth } from "@/auth";
import { formatDh } from "@/lib/format-currency-ma";
import { ANNEES_SCOLAIRES } from "@/lib/school-years";
import { parseEnrollmentSubjectsJson } from "@/lib/format-student-enrollment";
import { prisma } from "@/lib/prisma";

export default async function AdminUtilisateursPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-navy dark:text-gold">Nouvel utilisateur</h3>
          <a
            href="/api/admin/export-users"
            className="inline-flex items-center rounded-xl border border-navy/20 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition hover:bg-navy/5 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            download
          >
            Exporter CSV (utilisateurs)
          </a>
        </div>
        <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Pour un <strong className="text-navy dark:text-slate-200">élève</strong>, renseignez le
          forfait : nombre de langues, une ou plusieurs matières (nom et prix en dh), le total est
          calculé automatiquement, ainsi que la date d&apos;inscription.
        </p>
        <AdminCreateUserForm anneesScolaires={ANNEES_SCOLAIRES} />
      </section>

      <section>
        <h3 className="text-lg font-semibold text-navy dark:text-gold">Comptes</h3>
        <div className="mt-3 data-table-wrap">
          <table className="data-table">
            <thead>
              <tr className="border-b border-navy/10 bg-navy/[0.04] dark:border-slate-700 dark:bg-slate-800/50">
                <th className="py-2.5 pr-3 pl-3">Nom</th>
                <th className="py-2.5 pr-3">E-mail</th>
                <th className="py-2.5 pr-3">Rôle</th>
                <th className="py-2.5 pr-3">Groupe</th>
                <th className="py-2.5 pr-3">Année</th>
                <th className="py-2.5 pr-3">Langues</th>
                <th className="py-2.5 pr-3">Inscription</th>
                <th className="py-2.5 pr-3">Total</th>
                <th className="py-2.5 pr-3">Matières (détail)</th>
                <th className="py-2.5 pr-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const subjects = parseEnrollmentSubjectsJson(u.enrollmentSubjectsJson);
                const isEleve = u.role === "ELEVE";
                return (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 dark:border-slate-800/80"
                  >
                    <td className="py-2.5 pr-3 pl-3 font-medium">{u.name}</td>
                    <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="py-2.5 pr-3">{u.role}</td>
                    <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">
                      {u.groupe ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">
                      {u.anneeScolaire ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">
                      {isEleve && u.enrollmentLanguageCount != null
                        ? u.enrollmentLanguageCount
                        : "—"}
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {isEleve && u.enrolledAt
                        ? new Date(u.enrolledAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-navy dark:text-gold">
                      {isEleve && u.enrollmentTotal != null
                        ? formatDh(u.enrollmentTotal)
                        : "—"}
                    </td>
                    <td className="max-w-[280px] py-2.5 pr-3 text-xs leading-snug text-slate-600 dark:text-slate-400">
                      {isEleve && subjects.length > 0 ? (
                        <ul className="list-inside list-disc space-y-0.5">
                          {subjects.map((s, i) => (
                            <li key={i}>
                              {s.name}{" "}
                              <span className="text-slate-500">
                                — {formatDh(s.priceDh)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      {u.id !== session!.user.id ? (
                        <form action={adminDeleteUserAction.bind(null, u.id)}>
                          <button
                            type="submit"
                            className="rounded-md border border-red-200/90 bg-red-50/80 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100/90 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                          >
                            Supprimer
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-slate-400">vous</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
