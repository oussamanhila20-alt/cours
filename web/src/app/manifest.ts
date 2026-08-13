import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Cours de soutien",
    short_name: "Cours",
    description:
      "Plateforme de cours de soutien : espaces administrateur, professeur et élève.",
    start_url: "/fr?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#061b4e",
    theme_color: "#061b4e",
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
