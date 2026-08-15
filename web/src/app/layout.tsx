import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#d4af37",
};

export const metadata: Metadata = {
  title: "Centre Beta — gestion des cours",
  description:
    "Plateforme de gestion des cours de soutien : espaces administrateur, professeur et élève.",
  applicationName: "Centre Beta",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Centre Beta",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

function localeFromPathname(pathname: string): "fr" | "ar" {
  if (pathname.startsWith("/ar") || pathname === "/ar") return "ar";
  return "fr";
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const locale = localeFromPathname(pathname);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="h-full max-w-full overflow-x-hidden antialiased" suppressHydrationWarning>
      <body className="site-bg flex min-h-full w-full min-w-0 max-w-full flex-col overflow-x-hidden font-sans text-foreground antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
