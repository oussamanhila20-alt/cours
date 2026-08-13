import { redirect } from "@/i18n/navigation";

type PageProps = { params: Promise<{ locale: string }> };

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  redirect({ href: "/connexion", locale });
}
