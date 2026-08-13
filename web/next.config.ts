import type { NextConfig } from "next";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const cwd = process.cwd();
const parentDir = path.join(cwd, "..");

/** Permet OPENAI_API_KEY (etc.) dans `.env` à la racine du dépôt si absent de `web/.env`. */
function mergeParentDotenvIfMonorepoWeb() {
  const isWebPackage =
    path.basename(cwd) === "web" && fs.existsSync(path.join(cwd, "package.json"));
  if (!isWebPackage) return;
  for (const name of [".env.local", ".env"] as const) {
    const abs = path.join(parentDir, name);
    try {
      if (!fs.existsSync(abs)) continue;
      const parsed = dotenv.parse(fs.readFileSync(abs));
      for (const [key, val] of Object.entries(parsed)) {
        const cur = process.env[key];
        if (cur === undefined || String(cur).trim() === "") {
          process.env[key] = val;
        }
      }
    } catch {
      /* ignore */
    }
  }
}
mergeParentDotenvIfMonorepoWeb();

const nextConfig: NextConfig = {
  /** Évite que le bundler traite mal Prisma sur Vercel (client + moteur query). */
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/:locale/eleve/aide-maths",
        destination: "/:locale/eleve/aide-scolaire",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/eleve/aide-maths-fichier",
        destination: "/api/eleve/aide-scolaire-fichier",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
