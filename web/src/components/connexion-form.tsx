"use client";

import { signIn } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useSearchParams, useParams } from "next/navigation";
import { useState } from "react";

/** next-intl impose /fr/… ou /ar/… — un chemin sans locale renvoie 404 en prod. */
function resolveCallbackUrl(raw: string | null, locale: string): string {
  const fallback = `/${locale}/apres-connexion`;
  if (!raw?.trim()) return fallback;
  const t = raw.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) {
    try {
      const u = new URL(t);
      if (typeof window !== "undefined" && u.origin !== window.location.origin) {
        return fallback;
      }
      return resolveCallbackUrl(u.pathname + u.search, locale);
    } catch {
      return fallback;
    }
  }
  if (/^\/(fr|ar)(\/|$)/.test(t)) return t;
  if (t.startsWith("/")) return `/${locale}${t}`;
  return fallback;
}

/** Utilise la réponse Auth.js (`res.url`) ; peut boucler vers `/connexion` ou `/api/auth/signin`. */
function finalizeLoginHref(
  rawFromAuth: string | null | undefined,
  fallbackResolved: string,
  locale: string,
): string {
  const merged = rawFromAuth?.trim() || fallbackResolved;
  if (!merged) return fallbackResolved;
  if (merged.startsWith("http://") || merged.startsWith("https://")) {
    try {
      const u = new URL(merged);
      if (typeof window !== "undefined" && u.origin !== window.location.origin) {
        return fallbackResolved;
      }
      return resolveCallbackUrl(u.pathname + u.search, locale);
    } catch {
      return fallbackResolved;
    }
  }
  return resolveCallbackUrl(merged, locale);
}

function pathnameOnly(raw: string): string {
  const t = raw.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) {
    try {
      return new URL(t).pathname;
    } catch {
      return t.split("?")[0] ?? "";
    }
  }
  return t.split("?")[0] ?? "";
}

/** Évite callbackUrl=/connexion… qui provoque une boucle ERR_TOO_MANY_REDIRECTS avec apres-connexion. */
function sanitizeCallbackAwayFromConnexion(resolved: string, locale: string): string {
  const path = pathnameOnly(resolved).toLowerCase();
  const segments = path.split("/").filter(Boolean);
  if (segments.includes("connexion")) {
    return `/${locale}/apres-connexion`;
  }
  return resolved;
}

/** Connexion réelle (/…/connexion), pas « apres-connexion » (substring « connexion »). */
function looksLikeLoginRedirect(raw: string): boolean {
  const path = pathnameOnly(raw).toLowerCase();
  const segments = path.split("/").filter(Boolean);
  if (segments.includes("connexion")) return true;
  return (
    path.includes("/api/auth/signin") || path.includes("/api/auth/error")
  );
}

/** Si Auth renvoie une URL qui ramène au login, ignorer et utiliser la destination prévue. */
function redirectHrefAfterCredentials(
  authUrl: string | null | undefined,
  fallbackResolved: string,
  locale: string,
): string {
  const raw = authUrl?.trim();
  if (!raw) return fallbackResolved;
  if (looksLikeLoginRedirect(raw)) {
    return fallbackResolved;
  }
  return finalizeLoginHref(raw, fallbackResolved, locale);
}

/** Auth.js renvoie des codes techniques ; « Configuration » = souvent AUTH_SECRET absent ou crash serveur. */
function friendlyCredentialsError(code: string | undefined): string {
  switch (code) {
    case "Configuration":
      return "Impossible de finaliser la connexion (erreur serveur). Si vous déployez sur Vercel : vérifiez que AUTH_SECRET est défini et que DATABASE_URL permet d’atteindre la base (Neon). Sinon réessayez dans quelques minutes.";
    case "CredentialsSignin":
      return "E-mail ou mot de passe incorrect.";
    case "AccessDenied":
      return "Accès refusé.";
    default:
      return code?.trim()
        ? code
        : "Connexion impossible. Vérifiez vos identifiants ou réessayez.";
  }
}

export function ConnexionForm() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = typeof params.locale === "string" ? params.locale : "fr";
  const errParam = searchParams.get("error");
  const callbackUrl = sanitizeCallbackAwayFromConnexion(
    resolveCallbackUrl(searchParams.get("callbackUrl"), locale),
    locale,
  );
  const [error, setError] = useState<string | null>(() =>
    errParam ? friendlyCredentialsError(errParam) : null,
  );
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const email = fd.get("email") as string;
      const password = fd.get("password") as string;

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        redirectTo: callbackUrl,
      });

      // Ne pas utiliser res.ok === false : Auth.js peut renvoyer des codes ambiguës alors que la session est créée.
      if (!res) {
        setError("Connexion impossible. Réessayez.");
        return;
      }
      if (!res.error) {
        const href = redirectHrefAfterCredentials(res.url, callbackUrl, locale);
        window.location.assign(
          href.startsWith("http")
            ? href
            : `${window.location.origin}${href.startsWith("/") ? href : `/${href}`}`,
        );
        return;
      }

      setError(friendlyCredentialsError(res.error));
    } catch {
      setError("Erreur réseau ou serveur. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-100"
          >
            {error}
          </p>
        ) : null}
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            E-mail
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input-field"
            placeholder="vous@exemple.fr"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Mot de passe
          </span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="input-field"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          className="font-semibold text-navy underline-offset-4 hover:underline dark:text-brandblue"
        >
          Inscription
        </Link>
      </p>
    </>
  );
}
