import { Link } from "@/i18n/navigation";
import { InscriptionForm } from "./inscription-form";
import { PublicPageShell } from "@/components/public-page-shell";
import { Suspense } from "react";

export default function InscriptionPage() {
  return (
    <PublicPageShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-md py-12 text-center text-sm text-slate-600 dark:text-slate-400">
            Chargement…
          </div>
        }
      >
        <InscriptionForm />
      </Suspense>
      <p className="mt-6 text-center text-sm">
        <Link
          href="/"
          className="font-medium text-electric underline-offset-4 transition hover:text-premium"
        >
          ← Retour à l’accueil
        </Link>
      </p>
    </PublicPageShell>
  );
}
