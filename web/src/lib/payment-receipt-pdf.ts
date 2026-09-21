import { formatPaymentPeriod } from "@/lib/payment-period";
import {
  RECEIPT_MATIERE_OVALS,
  selectedReceiptMatiereCodes,
} from "@/lib/receipt-matieres";

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
  subjectNames?: string[];
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

function formatReceiptDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function formatReceiptAmount(amount: number): string {
  return amount.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function textOp(size: number, x: number, y: number, text: string): string {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${pdfSafe(text)}) Tj ET`;
}

/** Reçu PDF A5 (Helvetica) sans dépendance native — même contenu que la fiche papier. */
export function buildPaymentReceiptPdf(p: ReceiptPdfInput): Uint8Array {
  const niveau = p.groupe?.trim() || p.anneeScolaire?.trim() || "................................";
  const amount = `${formatReceiptAmount(p.amount)} DH`;
  const selected = selectedReceiptMatiereCodes(p.subjectNames ?? []);
  const topCodes = RECEIPT_MATIERE_OVALS.slice(0, 5)
    .map((m) => (selected.has(m.code) ? `[${m.code}]` : m.code))
    .join("    ");
  const bottomCodes = RECEIPT_MATIERE_OVALS.slice(5)
    .map((m) => (selected.has(m.code) ? `[${m.code}]` : m.code))
    .join("    ");
  const period = formatPaymentPeriod(p.periodMonth, p.periodYear);

  const stream = [
    "0.039 0.153 0.286 rg",
    "0 505 210 55 re f",
    "0.788 0.635 0.153 rg",
    "0 500 250 7 re f",
    "0.788 0.635 0.153 rg",
    "0 28 420 10 re f",
    "0.039 0.153 0.286 rg",
    "90 0 330 42 re f",
    "0 0 0 rg",
    textOp(20, 36, 450, "RECU D'INSCRIPTION"),
    "0.5 w 36 444 m 248 444 l S",
    textOp(11, 36, 410, "Nom et prenom de l'eleve :"),
    textOp(12, 36, 392, p.studentName),
    textOp(11, 36, 360, `Niveau : ${niveau}`),
    textOp(11, 36, 330, `Montant paye : ${amount}`),
    textOp(11, 36, 298, "Matiere :"),
    textOp(10, 36, 276, topCodes),
    textOp(10, 36, 258, bottomCodes),
    textOp(11, 36, 220, "Signature :"),
    textOp(11, 250, 70, formatReceiptDate(p.paidAt)),
    textOp(8, 36, 52, `N recu #${p.receiptNumber}  ·  ${period}  ·  ${p.method}`),
  ].join("\n");
  const streamBytes = latin1(stream);

  const objects = [
    latin1("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"),
    latin1("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"),
    latin1(
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 420 595] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n",
    ),
    concat([
      latin1(`4 0 obj << /Length ${streamBytes.length} >> stream\n`),
      streamBytes,
      latin1("\nendstream\nendobj\n"),
    ]),
    latin1(
      "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n",
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
