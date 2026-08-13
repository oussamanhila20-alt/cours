import { auth } from "@/auth";
import { formatDh } from "@/lib/format-currency-ma";
import { formatPaymentPeriod } from "@/lib/payment-period";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ElevePaiementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const payments = await prisma.payment.findMany({
    where: { studentId: session.user.id },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }, { paidAt: "desc" }],
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Vos mensualités (mai, août, etc.). Téléchargez chaque reçu en PDF.
      </p>
      {payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Aucun paiement enregistré pour le moment.
        </div>
      ) : (
        <ul className="space-y-3">
          {payments.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium capitalize">
                  {formatPaymentPeriod(p.periodMonth, p.periodYear)}
                </p>
                <p className="text-xs text-zinc-500">
                  Reçu #{p.receiptNumber} · {p.label} ·{" "}
                  {new Date(p.paidAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold tabular-nums">{formatDh(p.amount)}</p>
                <a
                  href={`/api/paiements/${p.id}/pdf`}
                  className="rounded-full bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy/90"
                >
                  Télécharger PDF
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
