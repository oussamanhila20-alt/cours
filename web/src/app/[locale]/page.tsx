import { PublicPageShell } from "@/components/public-page-shell";
import { BrandLogo } from "@/components/brand-logo";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

type PageProps = { params: Promise<{ locale: string }> };

const spaces = [
  { key: "admin" as const },
  { key: "teacher" as const },
  { key: "student" as const },
];

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HomePage");

  return (
    <PublicPageShell>
      <section className="site-card-bg relative overflow-hidden rounded-2xl border border-border-soft px-4 py-10 shadow-md backdrop-blur-md sm:rounded-[24px] sm:px-10 sm:py-16">
        <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
          <BrandLogo size="lg" showName={false} />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-mauve">
            {t("simpleBadge")}
          </p>
          <h1 className="font-display mt-4 text-2xl font-extrabold leading-tight tracking-tight text-gold sm:text-4xl">
            {t("simpleTitle")}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-text sm:text-base">
            {t("simpleIntro")}
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/connexion" className="btn-primary inline-flex w-full justify-center px-6 py-3.5 text-sm font-semibold sm:w-auto sm:px-8">
              {t("ctaLogin")}
            </Link>
            <Link href="/inscription" className="btn-secondary inline-flex w-full justify-center px-6 py-3.5 text-sm font-semibold sm:w-auto sm:px-8">
              {t("ctaSignup")}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-stack" aria-labelledby="spaces-heading">
        <h2 id="spaces-heading" className="font-display text-center text-xl font-bold text-navy sm:text-2xl">
          {t("spacesSectionTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-text">
          {t("spacesSectionSubtitle")}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {spaces.map((space) => (
            <article
              key={space.key}
              className="site-card-bg rounded-2xl border border-border-soft p-5 shadow-sm"
            >
              <h3 className="font-display text-lg font-bold text-navy">
                {t(`spaces.${space.key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-text">
                {t(`spaces.${space.key}.desc`)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
