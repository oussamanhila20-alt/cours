import { auth } from "@/auth";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { formatDh } from "@/lib/format-currency-ma";
import {
  formatPaymentPeriod,
  listRecentPeriods,
} from "@/lib/payment-period";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ElevePaiementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const periods = listRecentPeriods(12);
  const payments = await prisma.payment.findMany({
    where: { studentId: session.user.id },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }, { paidAt: "desc" }],
  });

  const byPeriod = new Map<string, (typeof payments)[number]>();
  for (const p of payments) {
    const key = `${p.periodYear}-${p.periodMonth}`;
    if (p.amount > 0 && !byPeriod.has(key)) byPeriod.set(key, p);
  }

  const rows = periods.map((period) => {
    const payment = byPeriod.get(`${period.year}-${period.month}`);
    return { ...period, payment, paid: Boolean(payment) };
  });
  const paidCount = rows.filter((r) => r.paid).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
            Payés
          </p>
          <p className="mt-1 text-2xl font-extrabold text-navy">{paidCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
            Impayés
          </p>
          <p className="mt-1 text-2xl font-extrabold text-navy">
            {rows.length - paidCount}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Un mois est <strong>payé</strong> dès qu’un montant est enregistré.
        Sinon il reste <strong>impayé</strong>.
      </p>

      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li
            key={`${row.year}-${row.month}`}
            className={`rounded-2xl border p-4 ${
              row.paid
                ? "border-emerald-200 bg-white"
                : "border-amber-200 bg-amber-50/70"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold capitalize text-navy">
                  {formatPaymentPeriod(row.month, row.year)}
                </p>
                {row.payment ? (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Reçu #{row.payment.receiptNumber} ·{" "}
                    {new Date(row.payment.paidAt).toLocaleDateString("fr-FR")}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Aucun montant enregistré
                  </p>
                )}
              </div>
              <PaymentStatusBadge paid={row.paid} />
            </div>
            {row.payment ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-bold tabular-nums text-navy">
                  {formatDh(row.payment.amount)}
                </p>
                <a
                  href={`/api/paiements/${row.payment.id}/pdf`}
                  className="inline-flex min-h-10 items-center rounded-full bg-navy px-4 text-xs font-semibold text-white"
                >
                  Télécharger PDF
                </a>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
