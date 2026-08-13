import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function PublicPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="page-bg page-x mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col overflow-x-hidden pb-12 pb-safe pt-6 sm:pb-16 sm:pt-12">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
