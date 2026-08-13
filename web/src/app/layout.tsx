import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#061b4e",
};

export const metadata: Metadata = {
  title: "Cours de soutien — gestion des cours",
  description:
    "Plateforme de gestion des cours de soutien : espaces administrateur, professeur et élève.",
  applicationName: "Cours de soutien",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cours de soutien",
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
    <html lang={locale} dir={dir} className="h-full antialiased" suppressHydrationWarning>
      <body className="site-bg flex min-h-full flex-col font-sans text-foreground antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
