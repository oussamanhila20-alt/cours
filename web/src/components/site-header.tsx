import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { SiteHeaderNav } from "@/components/site-header-nav";
import { getTranslations } from "next-intl/server";

export async function SiteHeader() {
  const session = await auth();
  const t = await getTranslations("SiteHeader");

  return (
    <header className="header-glass">
      <div className="relative mx-auto flex h-[var(--header-h)] max-w-6xl items-center justify-between gap-3 px-3 sm:px-6">
        <Link
          href="/"
          className="header-brand-link group flex min-w-0 shrink-0 items-center"
        >
          <span className="font-display text-base font-bold tracking-tight text-navy sm:text-lg">
            {t("brandTitle")}
          </span>
        </Link>
        <SiteHeaderNav
          user={
            session?.user
              ? {
                  name: session.user.name,
                  role: session.user.role ?? "",
                }
              : null
          }
        />
      </div>
    </header>
  );
}
