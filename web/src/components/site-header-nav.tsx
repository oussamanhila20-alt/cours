"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { logoutAction } from "@/actions/logout";
import { LanguageSwitcher } from "@/components/language-switcher";

type HeaderUser = {
  name?: string | null;
  role: string;
};

function navLinkClass(activeMobile?: boolean, mobile?: boolean) {
  const base =
    "rounded-full font-medium transition " +
    (activeMobile
      ? "bg-electric/10 text-navy"
      : "text-navy/80 hover:bg-background-secondary hover:text-navy");
  if (mobile) {
    return `${base} flex min-h-[48px] items-center rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-base shadow-sm backdrop-blur-md`;
  }
  return `${base} px-3 py-2 text-sm`;
}

function spaceHref(role: string) {
  if (role === "ELEVE") return "/eleve";
  if (role === "PROFESSEUR") return "/professeur";
  return "/admin";
}

export function SiteHeaderNav({ user }: { user: HeaderUser | null }) {
  const t = useTranslations("SiteHeader");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    if (mobileOpen) {
      document.documentElement.dataset.mobileNav = "open";
    } else {
      delete document.documentElement.dataset.mobileNav;
    }
    return () => {
      document.body.style.overflow = "";
      delete document.documentElement.dataset.mobileNav;
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="relative z-[1] flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
        <LanguageSwitcher variant="icon" />

        <nav
          className="hidden flex-wrap items-center gap-1 lg:flex lg:gap-2"
          aria-label="Principal"
        >
          {user ? (
            <>
              <Link href={spaceHref(user.role)} className={navLinkClass()}>
                {t("mySpace")}
              </Link>
              <span className="hidden max-w-[140px] truncate text-sm text-muted-text lg:inline">
                {user.name}
              </span>
              <form action={logoutAction} className="inline">
                <button
                  type="submit"
                  className="rounded-full border border-border-soft bg-white/50 px-3 py-2 text-sm font-medium text-navy transition hover:bg-background-secondary"
                >
                  {t("logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/connexion" className={navLinkClass()}>
                {t("login")}
              </Link>
              <Link href="/inscription" className="btn-primary !py-2 !text-sm">
                {t("signup")}
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="relative z-[1] inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border-soft bg-white/80 p-2 text-navy shadow-sm transition hover:bg-background-secondary lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-site-nav"
          aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? (
            <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mounted && mobileOpen
        ? createPortal(
            <div
              id="mobile-site-nav"
              className="fixed inset-0 z-[200] lg:hidden"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="absolute inset-0 bg-navy/45 backdrop-blur-sm"
                aria-label={t("closeMenu")}
                onClick={() => setMobileOpen(false)}
              />
              <div className="mobile-nav-panel absolute inset-x-0 bottom-0 top-[var(--header-h)] flex flex-col overflow-hidden border-t border-border-soft/80 shadow-2xl">
                <nav
                  className="flex flex-1 flex-col gap-1.5 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-4 pb-safe"
                  aria-label="Principal mobile"
                >
                  {user ? (
                    <>
                      <Link
                        href={spaceHref(user.role)}
                        className={navLinkClass(true, true)}
                        onClick={() => setMobileOpen(false)}
                      >
                        {t("mySpace")}
                      </Link>
                      {user.name ? (
                        <span className="truncate px-4 py-1 text-xs text-muted-text">
                          {user.name}
                        </span>
                      ) : null}
                      <form action={logoutAction} className="pt-2">
                        <button
                          type="submit"
                          className="flex min-h-[48px] w-full items-center rounded-2xl border border-border-soft bg-white px-4 py-3 text-left text-base font-medium text-navy transition hover:bg-background-secondary"
                        >
                          {t("logout")}
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/connexion"
                        className={navLinkClass(true, true)}
                        onClick={() => setMobileOpen(false)}
                      >
                        {t("login")}
                      </Link>
                      <Link
                        href="/inscription"
                        className={navLinkClass(true, true)}
                        onClick={() => setMobileOpen(false)}
                      >
                        {t("signup")}
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
