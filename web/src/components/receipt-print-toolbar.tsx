"use client";

export function ReceiptPrintToolbar({ pdfHref }: { pdfHref: string }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex rounded-xl bg-[#0B2A5C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2A5C]/90"
      >
        Imprimer
      </button>
      <a
        href={pdfHref}
        className="inline-flex rounded-xl border border-[#0B2A5C] px-4 py-2 text-sm font-semibold text-[#0B2A5C] hover:bg-[#0B2A5C]/5"
      >
        Télécharger PDF
      </a>
    </div>
  );
}
