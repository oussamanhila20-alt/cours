"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { registerAction, type RegisterState } from "@/actions/auth";
import { useState } from "react";

const roleOptions = [
  { value: "ELEVE", labelKey: "roleStudent" as const },
  { value: "PROFESSEUR", labelKey: "roleTeacher" as const },
] as const;

export function InscriptionForm() {
  const t = useTranslations("InscriptionPage");
  const [role, setRole] = useState<string>("ELEVE");
  const [state, formAction, pending] = useActionState(
    registerAction,
    undefined as RegisterState,
  );

  if (state && "ok" in state && state.ok) {
    const loginHref = state.redirectTo
      ? `/connexion?callbackUrl=${encodeURIComponent(state.redirectTo)}`
      : "/connexion";

    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <div className="card-elevated p-10 shadow-xl shadow-slate-900/5 dark:shadow-black/40">
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {t("successTitle")}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("successRedirect")}
          </p>
          <Link href={loginHref} className="btn-primary mt-8 inline-flex w-full sm:w-auto">
            {t("goLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 sm:py-20">
      <div className="card-elevated p-8 shadow-xl shadow-electric/[0.06]">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-text">
          {t("subtitle")}
        </p>
        <form className="mt-8 flex flex-col gap-5" action={formAction}>
          {state && "error" in state && state.error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-100"
            >
              {state.error}
            </p>
          ) : null}
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {t("nameLabel")}
            </span>
            <input name="name" required autoComplete="name" className="input-field" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {t("emailLabel")}
            </span>
            <input name="email" type="email" required autoComplete="email" className="input-field" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {t("passwordLabel")}
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="input-field"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {t("roleLabel")}
            </span>
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {t(r.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Création…" : t("submitFree")}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Déjà inscrit ?{" "}
          <Link
            href="/connexion"
            className="font-semibold text-navy underline-offset-4 hover:underline dark:text-brandblue"
          >
            Connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
