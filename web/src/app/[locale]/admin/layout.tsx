import { DashboardShell } from "@/components/dashboard-shell";

const nav = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/groupes", label: "Groupes" },
  { href: "/admin/absences", label: "Absences" },
  { href: "/admin/finances", label: "Finances" },
  { href: "/admin/emploi-du-temps", label: "Emploi du temps" },
  { href: "/admin/affectations", label: "Affectations" },
  { href: "/admin/cours", label: "Cours" },
  { href: "/admin/cours-en-ligne", label: "Cours en ligne" },
  { href: "/admin/exercices", label: "Exercices" },
  { href: "/admin/statistiques", label: "Statistiques" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      spaceLabel="Administration"
      title="Administration"
      subtitle="Pilotage des comptes, des contenus et des indicateurs globaux."
      nav={nav}
      accent="amber"
    >
      {children}
    </DashboardShell>
  );
}
