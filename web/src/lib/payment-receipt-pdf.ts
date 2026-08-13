import { formatDh } from "@/lib/format-currency-ma";
import { formatPaymentPeriod } from "@/lib/payment-period";

export type ReceiptPdfInput = {
  receiptNumber: number;
  studentName: string;
  studentEmail: string;
  groupe: string | null;
  anneeScolaire: string | null;
  periodMonth: number;
  periodYear: number;
  amount: number;
  method: string;
  label: string;
  paidAt: Date;
  note: string | null;
};

function pdfSafe(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function latin1(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    out[i] = c <= 255 ? c : 63;
  }
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function padOff(n: number): string {
  return `${String(n).padStart(10, "0")} 00000 n `;
}

/** Reçu PDF A4 (Helvetica) sans dépendance native. */
export function buildPaymentReceiptPdf(p: ReceiptPdfInput): Uint8Array {
  const period = formatPaymentPeriod(p.periodMonth, p.periodYear);
  const paid = p.paidAt.toLocaleString("fr-FR");
  const rows: { size: number; text: string }[] = [
    { size: 22, text: "Reçu de paiement" },
    { size: 11, text: `N° reçu : #${p.receiptNumber}` },
    { size: 12, text: `Mois payé : ${period}` },
    { size: 11, text: `Élève : ${p.studentName}` },
    { size: 11, text: `E-mail : ${p.studentEmail}` },
    { size: 11, text: `Groupe : ${p.groupe ?? "—"}` },
    { size: 11, text: `Année scolaire : ${p.anneeScolaire ?? "—"}` },
    { size: 11, text: `Date de paiement : ${paid}` },
    { size: 11, text: `Mode : ${p.method}` },
    { size: 11, text: `Libellé : ${p.label}` },
    { size: 14, text: `Montant payé : ${formatDh(p.amount)}` },
  ];
  if (p.note) rows.push({ size: 11, text: `Note : ${p.note}` });
  rows.push({
    size: 9,
    text: "Document généré automatiquement par la plateforme.",
  });

  let y = 780;
  const streamParts: string[] = [];
  for (const row of rows) {
    streamParts.push("BT");
    streamParts.push(`/F1 ${row.size} Tf`);
    streamParts.push(`50 ${y} Td`);
    streamParts.push(`(${pdfSafe(row.text)}) Tj`);
    streamParts.push("ET");
    y -= row.size === 22 ? 36 : row.size === 14 ? 28 : 22;
  }
  const stream = streamParts.join("\n");
  const streamBytes = latin1(stream);

  const objects = [
    latin1("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"),
    latin1("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"),
    latin1(
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n",
    ),
    concat([
      latin1(`4 0 obj << /Length ${streamBytes.length} >> stream\n`),
      streamBytes,
      latin1("\nendstream\nendobj\n"),
    ]),
    latin1(
      "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
    ),
  ];

  const header = latin1("%PDF-1.4\n");
  const chunks: Uint8Array[] = [header];
  const offsets = [0];
  let offset = header.length;
  for (const obj of objects) {
    offsets.push(offset);
    chunks.push(obj);
    offset += obj.length;
  }

  const xref =
    `xref\n0 6\n0000000000 65535 f \n` +
    `${padOff(offsets[1])}\n${padOff(offsets[2])}\n${padOff(offsets[3])}\n${padOff(offsets[4])}\n${padOff(offsets[5])}\n` +
    `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;
  chunks.push(latin1(xref));
  return concat(chunks);
}
