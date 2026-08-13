/**
 * Vérifie la configuration fal.ai (Kling v3 Pro).
 */
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, "..");
const envPath = resolve(webRoot, ".env");

if (existsSync(envPath)) {
  config({ path: envPath });
}
config({ path: resolve(webRoot, ".env.local") });

const key = process.env.FAL_KEY?.trim();

if (!key) {
  console.error("FAL_KEY : manquante.");
  console.error("  1. Créez une clé sur https://fal.ai/dashboard/keys");
  console.error("  2. Ajoutez dans web/.env : FAL_KEY=votre_cle");
  process.exit(1);
}

console.log("FAL_KEY : OK (longueur", key.length, "caractères).");
console.log("Modèle : fal-ai/kling-video/v3/pro/text-to-video");
console.log("");
console.log("Test CLI :");
console.log('  npm run kling:generate -- --prompt "Cinematic sunset over Marrakech medina" --aspect 9:16');
