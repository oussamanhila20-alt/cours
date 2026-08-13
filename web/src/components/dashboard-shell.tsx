"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { DashboardNav, type NavItem } from "@/components/dashboard-nav";

export type { NavItem };

type Accent = "teal" | "indigo" | "amber";

const asideAccent: Record<Accent, string> = {
  teal: "md:border-l-[3px] md:border-l-brandblue/60",
  indigo: "md:border-l-[3px] md:border-l-navy/60",
  amber: "md:border-l-[3px] md:border-l-gold/60",
};

const headerAccent: Record<Accent, string> = {
  teal: "from-white via-white to-brandblue/[0.07]",
  indigo: "from-white via-white to-navy/[0.06]",
  amber: "from-white via-white to-gold/[0.08]",
};

const badgeClass: Record<Accent, string> = {
  teal: "bg-brandblue/15 text-navy ring-brandblue/20",
  indigo: "bg-navy/12 text-navy ring-navy/20",
  amber: "bg-gold/15 text-navy ring-gold/40",
};

type DashboardShellProps = {
  spaceLabel: string;
  title: string;
  subtitle?: string;
  nav: NavItem[];
  accent: Accent;
  children: React.ReactNode;
};

export function DashboardShell({
  spaceLabel,
  title,
  subtitle,
  nav,
  accent,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-30 border-b border-navy/10 bg-white/95 px-3 py-2.5 backdrop-blur-md md:px-4">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-navy/10 bg-white text-navy shadow-sm md:hidden"
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-navy"
          >
            Accueil
          </Link>
          <span
            className={`ms-auto inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${badgeClass[accent]}`}
          >
            {spaceLabel}
          </span>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1">
        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-[2px] md:hidden"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 start-0 z-50 flex w-[min(18.5rem,86vw)] flex-col border-e border-navy/10 bg-white shadow-2xl transition-transform duration-200 md:static md:z-0 md:w-64 md:translate-x-0 md:shadow-none md:rtl:translate-x-0 ${asideAccent[accent]} ${
            open
              ? "translate-x-0"
              : "-translate-x-full rtl:translate-x-full md:translate-x-0 md:rtl:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-navy/10 px-4 py-3 md:hidden">
            <p className="text-sm font-bold text-navy">Menu</p>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-navy"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mb-2 mt-5 hidden px-5 text-[10px] font-bold uppercase tracking-[0.22em] text-navy/70 md:block">
            Navigation
          </p>
          <div className="flex-1 overflow-y-auto px-3 py-3 md:px-3 md:py-0">
            <DashboardNav nav={nav} accent={accent} onNavigate={() => setOpen(false)} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[var(--background)]">
          <header
            className={`relative overflow-hidden border-b border-navy/10 bg-gradient-to-br px-4 py-5 md:px-6 md:py-7 ${headerAccent[accent]}`}
          >
            <h1 className="text-xl font-extrabold tracking-tight text-navy md:text-[1.65rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                {subtitle}
              </p>
            ) : null}
          </header>
          <main className="flex-1 px-4 py-5 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
