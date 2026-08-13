import { DashboardShell } from "@/components/dashboard-shell";

const nav = [
  { href: "/eleve", label: "Tableau de bord" },
  { href: "/eleve/profil", label: "Classe & année" },
  { href: "/eleve/cours", label: "Mes cours" },
  { href: "/eleve/favoris", label: "Mes favoris" },
  { href: "/eleve/exercices", label: "Exercices & QCM" },
  { href: "/eleve/cours-en-ligne", label: "Cours en ligne" },
  { href: "/eleve/notes", label: "Mes notes" },
  { href: "/eleve/emploi-du-temps", label: "Emploi du temps" },
  { href: "/eleve/paiements", label: "Mes paiements" },
  { href: "/eleve/progression", label: "Progression" },
];

export default function EleveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      spaceLabel="Élève"
      title="Espace élève"
      subtitle="Apprendre et s’entraîner facilement — contenus alignés sur votre classe et votre année scolaire."
      nav={nav}
      accent="teal"
    >
      {children}
    </DashboardShell>
  );
}
