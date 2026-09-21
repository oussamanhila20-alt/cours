import {
  RECEIPT_MATIERE_OVALS,
  selectedReceiptMatiereCodes,
} from "@/lib/receipt-matieres";

export type InscriptionReceiptProps = {
  studentName: string;
  niveau: string;
  amountDh: string;
  subjectNames: string[];
  signatureDate: string;
};

function ReceiptWaves({ position }: { position: "top" | "bottom" }) {
  if (position === "top") {
    return (
      <svg
        className="pointer-events-none absolute inset-x-0 top-0 h-[92px] w-full"
        viewBox="0 0 400 92"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path fill="#0A2749" d="M0 0h255C200 6 168 44 0 80Z" />
        <path
          fill="#C9A227"
          d="M0 74C175 40 228 6 318 0v9C232 12 178 46 0 82Z"
        />
      </svg>
    );
  }
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[92px] w-full"
      viewBox="0 0 400 92"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path fill="#C9A227" d="M0 92V58C120 78 230 38 400 48v12C250 48 140 82 0 68Z" />
      <path fill="#0A2749" d="M55 92C175 50 280 64 400 22V92Z" />
    </svg>
  );
}

function FieldValue({ value, fallback }: { value: string; fallback: string }) {
  if (value.trim()) {
    return (
      <span className="border-b border-dotted border-zinc-600 px-1 font-bold tracking-wide">
        {value}
      </span>
    );
  }
  return <span className="tracking-[0.22em] text-zinc-500">{fallback}</span>;
}

export function InscriptionReceipt({
  studentName,
  niveau,
  amountDh,
  subjectNames,
  signatureDate,
}: InscriptionReceiptProps) {
  const selected = selectedReceiptMatiereCodes(subjectNames);

  return (
    <article className="inscription-receipt relative mx-auto min-h-[210mm] w-full max-w-[148mm] overflow-hidden bg-white text-[#111] shadow-[0_8px_30px_rgba(10,39,73,0.12)] print:max-w-none print:shadow-none">
      <ReceiptWaves position="top" />
      <ReceiptWaves position="bottom" />

      <div className="relative z-[1] px-8 pb-[108px] pt-[72px] sm:px-10">
        <div className="flex justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element -- impression: fichier public, taille fixe */}
          <img
            src="/logo-centre-beta.png"
            alt="Centre Bêta"
            width={76}
            height={76}
            className="h-[76px] w-[76px] max-h-[76px] max-w-[76px] rounded-full border-[3px] border-[#C9A227] object-cover shadow-[0_0_0_2px_#0A2749]"
          />
        </div>

        <h1 className="mt-3 text-[25px] font-extrabold uppercase tracking-wide underline decoration-2 underline-offset-[6px]">
          Reçu d&apos;inscription
        </h1>

        <section className="mt-9 space-y-8 text-[16.5px] font-semibold leading-snug">
          <div>
            <p>Nom et prénom de l&apos;élève :</p>
            <p className="mt-3">
              <FieldValue
                value={studentName}
                fallback="................................................"
              />
            </p>
          </div>

          <p>
            Niveau :{" "}
            <FieldValue value={niveau} fallback="................................" />
          </p>

          <p>
            Montant payé :{" "}
            <FieldValue value={amountDh} fallback="........................" />{" "}
            DH
          </p>

          <div>
            <p className="mb-5">Matière :</p>
            <div className="grid grid-cols-5 gap-x-2 gap-y-5">
              {RECEIPT_MATIERE_OVALS.map((m) => {
                const on = selected.has(m.code);
                return (
                  <span
                    key={m.code}
                    className={`inline-flex min-h-[34px] items-center justify-center rounded-full border-[1.6px] border-dashed px-1 text-[11px] font-extrabold tracking-wide ${
                      on
                        ? "border-[#0A2749] bg-[#0A2749] text-white"
                        : "border-zinc-800 bg-white text-zinc-900"
                    }`}
                  >
                    {m.code}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="pt-6">
            <p>Signature :</p>
            <p className="mt-12 text-right text-[15px] font-semibold tracking-[0.28em]">
              {signatureDate || "..../..../........"}
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
