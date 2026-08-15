import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Centre Beta",
    short_name: "Beta",
    description:
      "Plateforme Centre Beta : espaces administrateur, professeur et élève.",
    start_url: "/fr?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#070707",
    theme_color: "#d4af37",
    lang: "fr",
    dir: "ltr",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
