import { Link } from "@/i18n/navigation";
import { createPaymentAction, deletePaymentAction } from "@/actions/payments";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { formatDh } from "@/lib/format-currency-ma";
import {
  MONTHS_FR,
  currentPaymentPeriod,
  formatPaymentPeriod,
} from "@/lib/payment-period";
import { prisma } from "@/lib/prisma";

const METHODS = ["ESPECES", "VIREMENT", "CARTE", "AUTRE"] as const;

const fieldClass =
  "min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-navy dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";

type Props = {
  searchParams: Promise<{ mois?: string; annee?: string }>;
};

export default async function AdminFinancesPage({ searchParams }: Props) {
  const now = currentPaymentPeriod();
  const params = await searchParams;
  const month = clampInt(params.mois, 1, 12, now.month);
  const year = clampInt(params.annee, 2020, 2100, now.year);
  const years = Array.from({ length: 6 }, (_, i) => now.year - 2 + i);

  const [eleves, payments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "ELEVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, groupe: true },
    }),
    prisma.payment.findMany({
      where: { periodMonth: month, periodYear: year },
      orderBy: { paidAt: "desc" },
      include: { student: { select: { name: true, groupe: true } } },
    }),
  ]);

  const paidByStudent = new Map<string, (typeof payments)[number]>();
  for (const p of payments) {
    if (p.amount > 0 && !paidByStudent.has(p.studentId)) {
      paidByStudent.set(p.studentId, p);
    }
  }

  const paidStudents = eleves.filter((e) => paidByStudent.has(e.id));
  const unpaidStudents = eleves.filter((e) => !paidByStudent.has(e.id));
  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
  const periodLabel = formatPaymentPeriod(month, year);

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/admin" className="text-navy hover:underline dark:text-gold">
          ← Tableau de bord
        </Link>
      </p>

      <form
        method="get"
        className="grid grid-cols-2 gap-2 rounded-2xl border border-zinc-200 bg-white p-3 sm:flex sm:flex-wrap sm:items-end sm:gap-3 dark:border-zinc-800"
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-navy">
          Mois
          <select name="mois" defaultValue={month} className={fieldClass}>
            {MONTHS_FR.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-navy">
          Année
          <select name="annee" defaultValue={year} className={fieldClass}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="col-span-2 min-h-11 rounded-full bg-navy px-4 text-sm font-semibold text-white sm:col-span-1"
        >
          Voir ce mois
        </button>
      </form>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Élèves" value={String(eleves.length)} />
        <StatCard
          label="Payés"
          value={String(paidStudents.length)}
          tone="ok"
        />
        <StatCard
          label="Impayés"
          value={String(unpaidStudents.length)}
          tone="warn"
        />
        <StatCard label="Encaissé" value={formatDh(totalAmount)} />
      </section>

      <p className="text-sm text-zinc-600">
        Statut pour <span className="font-semibold capitalize">{periodLabel}</span>{" "}
        : un montant enregistré = <strong>Payé</strong>, sinon{" "}
        <strong>Impayé</strong>.
      </p>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800">
        <h3 className="text-base font-semibold text-navy sm:text-lg">
          Enregistrer un paiement
        </h3>
        <form action={createPaymentAction} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input type="hidden" name="periodMonth" value={month} />
          <input type="hidden" name="periodYear" value={year} />
          <label className="flex flex-col gap-1 text-xs font-medium">
            Élève
            <select name="studentId" required className={fieldClass}>
              <option value="">—</option>
              {eleves.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {e.groupe ? ` · ${e.groupe}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium">
            Montant payé (dh)
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium">
            Date de paiement
            <input type="datetime-local" name="paidAt" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium">
            Mode
            <select name="method" className={fieldClass} defaultValue="ESPECES">
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium sm:col-span-2">
            Note interne (optionnel)
            <input name="note" className={fieldClass} />
          </label>
          <button
            type="submit"
            className="min-h-12 rounded-full bg-navy px-4 text-sm font-semibold text-white sm:col-span-2"
          >
            Marquer comme payé — {periodLabel}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-navy">
          Impayés ({unpaidStudents.length})
        </h3>
        {unpaidStudents.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Tous les élèves sont payés pour {periodLabel}.
          </p>
        ) : (
          <ul className="space-y-2">
            {unpaidStudents.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy">{e.name}</p>
                  <p className="text-xs text-zinc-500">{e.groupe ?? "Sans groupe"}</p>
                </div>
                <PaymentStatusBadge paid={false} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-navy">
          Payés ({paidStudents.length})
        </h3>
        {paidStudents.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucun paiement ce mois-ci.</p>
        ) : (
          <ul className="space-y-2">
            {paidStudents.map((e) => {
              const p = paidByStudent.get(e.id)!;
              return (
                <li
                  key={e.id}
                  className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">{e.name}</p>
                      <p className="text-xs text-zinc-500">
                        {e.groupe ?? "Sans groupe"} · Reçu #{p.receiptNumber}
                      </p>
                    </div>
                    <PaymentStatusBadge paid />
                  </div>
                  <p className="mt-2 text-lg font-bold tabular-nums text-navy">
                    {formatDh(p.amount)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`/api/paiements/${p.id}/pdf`}
                      className="inline-flex min-h-10 items-center rounded-full bg-navy px-4 text-xs font-semibold text-white"
                    >
                      Télécharger PDF
                    </a>
                    <form action={deletePaymentAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="inline-flex min-h-10 items-center rounded-full px-4 text-xs font-semibold text-red-600"
                      >
                        Annuler
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  const ring =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50"
        : "border-zinc-200 bg-white";
  return (
    <div className={`rounded-2xl border p-3 sm:p-4 ${ring}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold tabular-nums text-navy sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function clampInt(raw: string | undefined, min: number, max: number, fallback: number) {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
}
