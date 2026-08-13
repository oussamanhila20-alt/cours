import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function hash(password: string) {
  return bcrypt.hashSync(password, 10);
}

const qcmDemo = {
  questions: [
    {
      id: "q1",
      prompt: "Combien font 7 × 8 ?",
      options: ["54", "56", "63"],
      correct: 1,
    },
    {
      id: "q2",
      prompt: "La racine carrée de 81 est :",
      options: ["7", "8", "9"],
      correct: 2,
    },
  ],
};

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.fr" },
    update: {},
    create: {
      email: "admin@demo.fr",
      name: "Administrateur",
      passwordHash: hash("admin123"),
      role: "ADMIN",
    },
  });

  const prof = await prisma.user.upsert({
    where: { email: "prof@demo.fr" },
    update: {},
    create: {
      email: "prof@demo.fr",
      name: "Marie Dupont",
      passwordHash: hash("prof123"),
      role: "PROFESSEUR",
    },
  });

  const demoSubjects = [
    { name: "Mathématiques", priceDh: 50 },
    { name: "Français", priceDh: 30 },
  ];
  const demoTotal = demoSubjects.reduce((s, l) => s + l.priceDh, 0);

  const eleve = await prisma.user.upsert({
    where: { email: "eleve@demo.fr" },
    update: {
      groupe: "4ème A",
      anneeScolaire: "2025-2026",
      enrollmentLanguageCount: 2,
      enrollmentSubjectsJson: JSON.stringify(demoSubjects),
      enrollmentTotal: demoTotal,
      enrolledAt: new Date("2025-09-01T12:00:00"),
    },
    create: {
      email: "eleve@demo.fr",
      name: "Luc Martin",
      passwordHash: hash("eleve123"),
      role: "ELEVE",
      groupe: "4ème A",
      anneeScolaire: "2025-2026",
      enrollmentLanguageCount: 2,
      enrollmentSubjectsJson: JSON.stringify(demoSubjects),
      enrollmentTotal: demoTotal,
      enrolledAt: new Date("2025-09-01T12:00:00"),
    },
  });

  const course = await prisma.course.upsert({
    where: { id: "seed-course-1" },
    update: {},
    create: {
      id: "seed-course-1",
      title: "Les équations du premier degré",
      description: "Introduction et exercices corrigés.",
      matiere: "Mathématiques",
      niveau: "Collège",
      chapitre: "Algèbre",
      contentText:
        "## Objectifs\n\n- Isoler une inconnue.\n- Résoudre ax + b = c.\n\n> Ce cours est un exemple chargé par le script de seed.",
      published: true,
      authorId: prof.id,
    },
  });

  await prisma.exercise.upsert({
    where: { id: "seed-ex-1" },
    update: { published: true },
    create: {
      id: "seed-ex-1",
      title: "QCM — calcul mental",
      matiere: "Mathématiques",
      niveau: "Collège",
      chapitre: "Algèbre",
      type: "QCM",
      contentJson: JSON.stringify(qcmDemo),
      published: true,
      authorId: prof.id,
    },
  });

  await prisma.exercise.upsert({
    where: { id: "seed-ex-2" },
    update: {},
    create: {
      id: "seed-ex-2",
      title: "Rédaction — méthode",
      matiere: "Mathématiques",
      niveau: "Collège",
      chapitre: "Algèbre",
      type: "OUVERT",
      contentJson: JSON.stringify({
        questions: [
          {
            id: "q1",
            prompt:
              "Expliquez en quelques phrases comment isoler x dans 3x - 5 = 10.",
          },
        ],
      }),
      published: true,
      authorId: prof.id,
    },
  });

  await prisma.professeurAffectation.deleteMany({});
  await prisma.scheduleEntry.deleteMany({});

  await prisma.professeurAffectation.create({
    data: {
      professeurId: prof.id,
      matiere: "Mathématiques",
      groupe: "4ème A",
      anneeScolaire: "2025-2026",
    },
  });

  await prisma.scheduleEntry.createMany({
    data: [
      {
        title: "Soutien scolaire — 4e",
        weekday: 1,
        startTime: "16:30",
        endTime: "18:00",
        niveau: "Collège",
        matiere: "Mathématiques",
        room: "Salle A",
        professeurId: prof.id,
        groupe: "4ème A",
        anneeScolaire: "2025-2026",
      },
      {
        title: "Physique — préparation brevet",
        weekday: 3,
        startTime: "17:00",
        endTime: "18:30",
        niveau: "Collège",
        matiere: "Physique-Chimie",
        room: "Labo 2",
      },
    ],
  });

  console.log("Seed OK:", {
    admin: admin.email,
    prof: prof.email,
    eleve: eleve.email,
    course: course.title,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
