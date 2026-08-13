import { notFound } from "next/navigation";
import { formatDh } from "@/lib/format-currency-ma";
import { formatPaymentPeriod } from "@/lib/payment-period";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function ImprimerRecuPage({ params }: Props) {
  const { id } = await params;
  const p = await prisma.payment.findUnique({
    where: { id },
    include: {
      student: {
        select: { name: true, email: true, groupe: true, anneeScolaire: true },
      },
    },
  });
  if (!p) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6 print:p-2">
      <div className="mb-4 print:hidden">
        <a
          href={`/api/paiements/${id}/pdf`}
          className="inline-flex rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90"
        >
          Télécharger PDF
        </a>
      </div>
      <div className="rounded-xl border border-zinc-200 p-6 print:border-0">
        <h1 className="text-2xl font-bold text-navy">Reçu de paiement</h1>
        <p className="mt-1 text-sm text-zinc-600">
          N° reçu: <span className="font-mono">#{p.receiptNumber}</span>
        </p>

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <p>
            <strong>Mois payé:</strong>{" "}
            <span className="capitalize">
              {formatPaymentPeriod(p.periodMonth, p.periodYear)}
            </span>
          </p>
          <p>
            <strong>Élève:</strong> {p.student.name}
          </p>
          <p>
            <strong>E-mail:</strong> {p.student.email}
          </p>
          <p>
            <strong>Groupe:</strong> {p.student.groupe ?? "—"}
          </p>
          <p>
            <strong>Année scolaire:</strong> {p.student.anneeScolaire ?? "—"}
          </p>
          <p>
            <strong>Date:</strong> {new Date(p.paidAt).toLocaleString("fr-FR")}
          </p>
          <p>
            <strong>Mode:</strong> {p.method}
          </p>
          <p className="sm:col-span-2">
            <strong>Libellé:</strong> {p.label}
          </p>
          <p className="sm:col-span-2 text-lg">
            <strong>Montant payé:</strong> {formatDh(p.amount)}
          </p>
          {p.note ? (
            <p className="sm:col-span-2">
              <strong>Note:</strong> {p.note}
            </p>
          ) : null}
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 text-xs text-zinc-500">
          Document généré automatiquement par la plateforme.
        </div>
      </div>
    </main>
  );
}
