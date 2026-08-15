/**
 * Crée / met à jour les comptes Centre Beta (admin + professeurs).
 * Version .mjs pour Vercel — pas besoin de tsx pendant `npm run build`.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function hash(password) {
  return bcrypt.hashSync(password, 10);
}

async function main() {
  await prisma.user.upsert({
    where: { email: "centrebeta@gmail.com" },
    update: {
      name: "Administrateur",
      passwordHash: hash("beta2026"),
      role: "ADMIN",
    },
    create: {
      email: "centrebeta@gmail.com",
      name: "Administrateur",
      passwordHash: hash("beta2026"),
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "mohamed@gmail.com" },
    update: {
      name: "Mohamed",
      passwordHash: hash("mohamed2026"),
      role: "PROFESSEUR",
    },
    create: {
      email: "mohamed@gmail.com",
      name: "Mohamed",
      passwordHash: hash("mohamed2026"),
      role: "PROFESSEUR",
    },
  });

  await prisma.user.upsert({
    where: { email: "oussama@gmail.com" },
    update: {
      name: "Oussama",
      passwordHash: hash("oussama2026"),
      role: "PROFESSEUR",
    },
    create: {
      email: "oussama@gmail.com",
      name: "Oussama",
      passwordHash: hash("oussama2026"),
      role: "PROFESSEUR",
    },
  });

  for (const email of ["admin@demo.fr", "prof@demo.fr", "eleve@demo.fr"]) {
    try {
      const deleted = await prisma.user.deleteMany({ where: { email } });
      if (deleted.count > 0) {
        console.log(`[ensure-demo-users] Compte démo supprimé : ${email}`);
      }
    } catch (e) {
      console.warn(`[ensure-demo-users] Impossible de supprimer ${email} (données liées).`);
    }
  }

  console.log("[ensure-demo-users] OK : comptes Centre Beta à jour.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
