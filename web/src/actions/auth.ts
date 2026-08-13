"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ELEVE", "PROFESSEUR"]),
  groupe: z.string().optional(),
  anneeScolaire: z.string().optional(),
});

export type RegisterState =
  | { error?: string }
  | { ok: true; redirectTo?: string }
  | undefined;

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    groupe: formData.get("groupe") ?? undefined,
    anneeScolaire: formData.get("anneeScolaire") ?? undefined,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Données invalides (mot de passe ≥ 6 caractères)." };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return { error: "Cet e-mail est déjà utilisé." };
    }

    const isEleve = parsed.data.role === "ELEVE";

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        role: parsed.data.role,
        groupe: isEleve ? parsed.data.groupe?.trim() || "À compléter" : null,
        anneeScolaire: isEleve
          ? parsed.data.anneeScolaire?.trim() || "2025-2026"
          : null,
      },
    });

    return {
      ok: true,
      redirectTo: isEleve ? "/eleve" : "/professeur",
    };
  } catch (e) {
    console.error("[registerAction]", e);
    const rawMsg = e instanceof Error ? e.message : String(e);
    const tail = rawMsg.length > 420 ? `${rawMsg.slice(0, 420)}…` : rawMsg;
    return {
      error: `Erreur serveur lors de l'inscription. Détail technique : ${tail}`,
    };
  }
}
