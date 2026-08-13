import { Link } from "@/i18n/navigation";
import { createPaymentAction, deletePaymentAction } from "@/actions/payments";
import { formatDh } from "@/lib/format-currency-ma";
import {
  MONTHS_FR,
  currentPaymentPeriod,
  formatPaymentPeriod,
} from "@/lib/payment-period";
import { prisma } from "@/lib/prisma";

const METHODS = ["ESPECES", "VIREMENT", "CARTE", "AUTRE"] as const;

export default async function AdminFinancesPage() {
  const now = currentPaymentPeriod();
  const years = Array.from({ length: 6 }, (_, i) => now.year - 2 + i);

  const [eleves, payments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "ELEVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.payment.findMany({
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }, { paidAt: "desc" }],
      take: 200,
      include: { student: { select: { name: true } } },
    }),
  ]);

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const groups = new Map<string, typeof payments>();
  for (const p of payments) {
    const key = `${p.periodYear}-${String(p.periodMonth).padStart(2, "0")}`;
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/admin" className="text-navy hover:underline dark:text-gold">
          ← Tableau de bord
        </Link>
      </p>

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="text-lg font-semibold">Nouveau paiement mensuel</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Chaque paiement correspond à un mois (mai, août, etc.). L’élève peut
          télécharger le reçu en PDF.
        </p>
        <form action={createPaymentAction} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs">
            Élève
            <select
              name="studentId"
              required
              className="min-w-[200px] rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            >
              <option value="">—</option>
              {eleves.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Mois
            <select
              name="periodMonth"
              required
              defaultValue={now.month}
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            >
              {MONTHS_FR.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Année
            <select
              name="periodYear"
              required
              defaultValue={now.year}
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Montant (dh)
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="w-28 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Date de paiement
            <input
              type="datetime-local"
              name="paidAt"
              required
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Libellé (optionnel)
            <input
              name="label"
              placeholder="Laissé vide = Mensualité mai 2026"
              className="min-w-[180px] rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Mode
            <select
              name="method"
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
              defaultValue="ESPECES"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Note interne
            <input name="note" className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700" />
          </label>
          <button
            type="submit"
            className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90"
          >
            Enregistrer le paiement
          </button>
        </form>
      </section>

      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Paiements par mois</h3>
          <p className="text-sm text-zinc-600">
            Total affiché :{" "}
            <span className="font-semibold text-navy">{formatDh(total)}</span>
          </p>
        </div>
        {groups.size === 0 ? (
          <p className="text-sm text-zinc-500">Aucun paiement enregistré.</p>
        ) : (
          <div className="space-y-6">
            {[...groups.entries()].map(([key, list]) => {
              const first = list[0];
              const subtotal = list.reduce((s, p) => s + p.amount, 0);
              return (
                <div
                  key={key}
                  className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
                    <h4 className="text-sm font-semibold capitalize">
                      {formatPaymentPeriod(first.periodMonth, first.periodYear)}
                    </h4>
                    <p className="text-xs text-zinc-600">{formatDh(subtotal)}</p>
                  </div>
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr>
                        <th className="p-3">Reçu</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Élève</th>
                        <th className="p-3">Libellé</th>
                        <th className="p-3">Montant</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3 w-40" />
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((p) => (
                        <tr
                          key={p.id}
                          className="border-t border-zinc-100 dark:border-zinc-800"
                        >
                          <td className="p-3 font-mono text-xs">#{p.receiptNumber}</td>
                          <td className="p-3 whitespace-nowrap">
                            {new Date(p.paidAt).toLocaleString("fr-FR")}
                          </td>
                          <td className="p-3">{p.student.name}</td>
                          <td className="p-3">{p.label}</td>
                          <td className="p-3 font-medium">{formatDh(p.amount)}</td>
                          <td className="p-3 text-xs">{p.method}</td>
                          <td className="p-3">
                            <a
                              href={`/api/paiements/${p.id}/pdf`}
                              className="text-xs font-medium text-navy hover:underline dark:text-gold"
                            >
                              Télécharger PDF
                            </a>
                            <form
                              action={deletePaymentAction.bind(null, p.id)}
                              className="mt-1"
                            >
                              <button
                                type="submit"
                                className="text-xs text-red-600 hover:underline dark:text-red-400"
                              >
                                Supprimer
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
