"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type LanguageSwitcherProps = {
  /** Sélecteur sur fond sombre (ex. barre de navigation marine) */
  variant?: "default" | "onDark" | "icon";
};

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .53-.049 1.049-.14 1.554"
      />
    </svg>
  );
}

export function LanguageSwitcher({
  variant = "default",
}: LanguageSwitcherProps) {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  function onChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const selectClass =
    variant === "onDark"
      ? "rounded-lg border border-white/25 bg-white/10 px-2 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur-sm"
      : "rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-800 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

  /** Globe + menu déroulant (header, fond sombre) */
  if (variant === "icon") {
    return (
      <div className="relative shrink-0" ref={panelRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/35 bg-black/40 text-gold shadow-sm backdrop-blur-sm transition hover:bg-mauve/15 aria-expanded:bg-mauve/15"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t("chooseLanguage")}
        >
          <GlobeIcon className="h-5 w-5" />
        </button>
        {open ? (
          <ul
            className="absolute end-0 z-[70] mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-gold/35 bg-white py-1 text-sm shadow-xl shadow-gold/10"
            role="listbox"
            aria-label={t("chooseLanguage")}
          >
            {routing.locales.map((loc) => (
              <li key={loc} role="option" aria-selected={locale === loc}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-start transition hover:bg-background-secondary dark:hover:bg-white/10 ${
                    locale === loc
                      ? "bg-electric/10 font-semibold text-electric dark:text-cyan-ai"
                      : "text-navy dark:text-white/90"
                  }`}
                  onClick={() => onChange(loc)}
                >
                  <span>{loc === "fr" ? t("fr") : t("ar")}</span>
                  {locale === loc ? (
                    <span className="text-electric dark:text-cyan-ai" aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  /** Même globe sur fond clair (optionnel) */
  if (variant === "default") {
    return (
      <div className="relative" ref={panelRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t("chooseLanguage")}
        >
          <GlobeIcon className="h-5 w-5" />
        </button>
        {open ? (
          <ul
            className="absolute end-0 z-[70] mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-900"
            role="listbox"
          >
            {routing.locales.map((loc) => (
              <li key={loc} role="option" aria-selected={locale === loc}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-start transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    locale === loc
                      ? "bg-brandblue/10 font-semibold text-navy dark:text-brandblue"
                      : "text-slate-800 dark:text-slate-100"
                  }`}
                  onClick={() => onChange(loc)}
                >
                  <span>{loc === "fr" ? t("fr") : t("ar")}</span>
                  {locale === loc ? <span aria-hidden>✓</span> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <label
      className={
        variant === "onDark"
          ? "flex items-center gap-2 text-sm text-white/90"
          : "flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
      }
    >
      <GlobeIcon className="h-4 w-4 shrink-0 opacity-80" />
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
        aria-label={t("chooseLanguage")}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc === "fr" ? t("fr") : t("ar")}
          </option>
        ))}
      </select>
    </label>
  );
}
