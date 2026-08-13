import { prisma } from "@/lib/prisma";

export type FulfillCoreParams = {
  pendingId: string;
  /** Montant en unité principale affichée (ex. MAD ou EUR selon votre catalogue). */
  amountMajor: number;
  paymentLabel: string;
  paymentMethod: string;
  paymentNote: string;
};

/**
 * Crée le compte élève + enregistre le paiement après paiement confirmé (Stripe ou Paddle).
 * Idempotent (webhooks + page succès peuvent appeler).
 */
export async function fulfillEleveRegistrationCore(
  params: FulfillCoreParams,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { pendingId, amountMajor, paymentLabel, paymentMethod, paymentNote } =
    params;

  try {
    await prisma.$transaction(async (tx) => {
      const pending = await tx.eleveRegistrationPending.findFirst({
        where: { id: pendingId, consumedAt: null },
      });
      if (!pending) {
        return;
      }

      const existingUser = await tx.user.findUnique({
        where: { email: pending.email },
      });
      if (existingUser) {
        await tx.eleveRegistrationPending.update({
          where: { id: pendingId },
          data: { consumedAt: new Date() },
        });
        return;
      }

      const user = await tx.user.create({
        data: {
          name: pending.name,
          email: pending.email,
          passwordHash: pending.passwordHash,
          role: "ELEVE",
          groupe: pending.groupe,
          anneeScolaire: pending.anneeScolaire,
          enrolledAt: new Date(),
        },
      });

      const last = await tx.payment.findFirst({
        orderBy: { receiptNumber: "desc" },
        select: { receiptNumber: true },
      });
      const receiptNumber = (last?.receiptNumber ?? 0) + 1;
      const now = new Date();

      await tx.payment.create({
        data: {
          studentId: user.id,
          amount: amountMajor,
          paidAt: now,
          periodMonth: now.getMonth() + 1,
          periodYear: now.getFullYear(),
          label: paymentLabel,
          method: paymentMethod,
          note: paymentNote,
          receiptNumber,
        },
      });

      await tx.eleveRegistrationPending.update({
        where: { id: pendingId },
        data: { consumedAt: new Date() },
      });
    });
    return { ok: true };
  } catch (e) {
    console.error("[fulfillEleveRegistrationCore]", e);
    return {
      ok: false,
      error: "Erreur lors de la création du compte. Contactez le support.",
    };
  }
}
