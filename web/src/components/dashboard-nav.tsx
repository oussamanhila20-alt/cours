"use client";

import { Link, usePathname } from "@/i18n/navigation";

export type NavItem = { href: string; label: string };

type Accent = "teal" | "indigo" | "amber";

const activeByAccent: Record<Accent, string> = {
  teal: "border-l-brandblue bg-brandblue/[0.1] text-navy",
  indigo: "border-l-navy bg-navy/[0.08] text-navy",
  amber: "border-l-gold bg-gold/[0.12] text-navy",
};

export function DashboardNav({
  nav,
  accent,
  onNavigate,
}: {
  nav: NavItem[];
  accent: Accent;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (pathname === href) return true;
    const sectionRoots = ["/eleve", "/professeur", "/admin"];
    if (sectionRoots.includes(href)) return false;
    return pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-r-xl border-l-[3px] px-3 py-3 text-sm font-semibold transition-colors ${
              active
                ? activeByAccent[accent]
                : "border-transparent text-navy/70 hover:bg-background-secondary hover:text-navy"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
