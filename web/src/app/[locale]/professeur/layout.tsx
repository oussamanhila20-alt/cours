import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardTopBar } from "@/components/dashboard-top-bar";

const nav = [
  { href: "/professeur", label: "Tableau de bord" },
  { href: "/professeur/emploi-du-temps", label: "Emploi du temps" },
  { href: "/professeur/cours", label: "Mes cours" },
  { href: "/professeur/exercices", label: "Exercices / QCM" },
  { href: "/professeur/cours-en-ligne", label: "Cours en ligne" },
  { href: "/professeur/corrections", label: "Corrections" },
  { href: "/professeur/eleves", label: "Élèves & performances" },
];

export default function ProfesseurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <DashboardTopBar label="Professeur" accent="indigo" />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <DashboardShell
          title="Espace professeur"
          subtitle="Publier des cours, créer des exercices et suivre la progression des élèves."
          nav={nav}
          accent="indigo"
        >
          {children}
        </DashboardShell>
      </div>
    </div>
  );
}
