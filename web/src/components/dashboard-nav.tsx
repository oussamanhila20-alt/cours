"use client";

import { Link, usePathname } from "@/i18n/navigation";

export type NavItem = { href: string; label: string };

type Accent = "teal" | "indigo" | "amber";

const activeByAccent: Record<Accent, string> = {
  teal: "border-electric bg-electric/10 text-navy md:border-l-brandblue md:bg-brandblue/[0.08] dark:text-white",
  indigo:
    "border-navy bg-navy/10 text-navy md:border-l-navy md:bg-navy/[0.08] dark:text-white",
  amber:
    "border-gold bg-gold/15 text-navy md:border-l-gold md:bg-gold/[0.1] dark:text-white",
};

export function DashboardNav({
  nav,
  accent,
}: {
  nav: NavItem[];
  accent: Accent;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (pathname === href) return true;
    const sectionRoots = ["/eleve", "/professeur", "/admin"];
    if (sectionRoots.includes(href)) return false;
    return pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] md:mx-0 md:flex-col md:gap-0.5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
      {nav.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors md:rounded-r-lg md:border-y-0 md:border-r-0 md:border-l-[3px] md:px-3 md:py-2.5 md:text-sm md:font-medium ${
              active
                ? activeByAccent[accent]
                : "border-border-soft bg-white text-navy/70 hover:bg-background-secondary md:border-transparent md:bg-transparent md:text-slate-600 dark:text-slate-400"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
