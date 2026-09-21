import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseEnrollmentSubjectsJson } from "@/lib/format-student-enrollment";
import { prisma } from "@/lib/prisma";
import { formatPaymentPeriod } from "@/lib/payment-period";
import { buildPaymentReceiptPdf } from "@/lib/payment-receipt-pdf";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          name: true,
          email: true,
          groupe: true,
          anneeScolaire: true,
          enrollmentSubjectsJson: true,
          group: { select: { matiere: true } },
        },
      },
    },
  });
  if (!payment) {
    return new NextResponse("Reçu introuvable", { status: 404 });
  }

  const isOwner = session.user.id === payment.studentId;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return new NextResponse("Non autorisé", { status: 403 });
  }

  const subjects = parseEnrollmentSubjectsJson(
    payment.student.enrollmentSubjectsJson,
  );
  const subjectNames = subjects.map((s) => s.name);
  if (payment.student.group?.matiere) {
    subjectNames.push(payment.student.group.matiere);
  }

  const bytes = buildPaymentReceiptPdf({
    receiptNumber: payment.receiptNumber,
    studentName: payment.student.name,
    studentEmail: payment.student.email,
    groupe: payment.student.groupe,
    anneeScolaire: payment.student.anneeScolaire,
    periodMonth: payment.periodMonth,
    periodYear: payment.periodYear,
    amount: payment.amount,
    method: payment.method,
    label: payment.label,
    paidAt: payment.paidAt,
    note: payment.note,
    subjectNames,
  });

  const period = formatPaymentPeriod(payment.periodMonth, payment.periodYear)
    .replace(/\s+/g, "-");
  const filename = `recu-${period}-${payment.receiptNumber}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
