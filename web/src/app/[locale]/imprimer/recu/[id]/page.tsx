import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { InscriptionReceipt } from "@/components/inscription-receipt";
import { ReceiptPrintToolbar } from "@/components/receipt-print-toolbar";
import { parseEnrollmentSubjectsJson } from "@/lib/format-student-enrollment";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

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

export default async function ImprimerRecuPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const { id } = await params;
  const p = await prisma.payment.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          name: true,
          groupe: true,
          anneeScolaire: true,
          enrollmentSubjectsJson: true,
          group: { select: { name: true, matiere: true } },
        },
      },
    },
  });
  if (!p) notFound();

  const isOwner = session.user.id === p.studentId;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) notFound();

  const subjects = parseEnrollmentSubjectsJson(p.student.enrollmentSubjectsJson);
  const subjectNames = subjects.map((s) => s.name);
  if (p.student.group?.matiere) subjectNames.push(p.student.group.matiere);

  const niveau =
    p.student.groupe?.trim() ||
    p.student.group?.name?.trim() ||
    p.student.anneeScolaire?.trim() ||
    "";

  return (
    <main className="inscription-receipt-print mx-auto max-w-[160mm] bg-zinc-100 p-4 print:max-w-none print:bg-white print:p-0">
      <style>{`@media print { @page { size: A5 portrait; margin: 0; } }`}</style>
      <ReceiptPrintToolbar pdfHref={`/api/paiements/${id}/pdf`} />
      <InscriptionReceipt
        studentName={p.student.name}
        niveau={niveau}
        amountDh={formatReceiptAmount(p.amount)}
        subjectNames={subjectNames}
        signatureDate={formatReceiptDate(p.paidAt)}
      />
    </main>
  );
}
