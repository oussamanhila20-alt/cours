#!/usr/bin/env node
/**
 * Génère une vidéo Kling v3 Pro (text-to-video) via fal.ai.
 *
 * Usage :
 *   node scripts/kling-text-to-video.mjs --prompt "..." [--out video.mp4] [--duration 5] [--aspect 9:16]
 *
 * Prérequis : FAL_KEY dans web/.env — https://fal.ai/dashboard/keys
 */
import { config } from "dotenv";
import { createWriteStream, existsSync } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, "..");
config({ path: resolve(webRoot, ".env") });
config({ path: resolve(webRoot, ".env.local") });

function flag(argv, name, fallback = null) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1 || i + 1 >= argv.length) return fallback;
  return argv[i + 1];
}

function hasFlag(argv, name) {
  return argv.includes(`--${name}`);
}

async function main() {
  const argv = process.argv.slice(2);
  if (hasFlag(argv, "help") || argv.length === 0) {
    console.log(`Usage:
  node scripts/kling-text-to-video.mjs --prompt "Description de la scène" [options]

Options:
  --prompt TEXT       Prompt texte (obligatoire sauf --async avec --request-id)
  --out PATH          Fichier MP4 de sortie (défaut: ./output/kling-<timestamp>.mp4)
  --duration N        Durée 3–15 secondes (défaut: 5)
  --aspect RATIO      16:9 | 9:16 | 1:1 (défaut: 16:9)
  --no-audio          Désactiver l'audio natif Kling
  --async             Soumettre en file d'attente et afficher requestId
  --request-id UUID   Récupérer le résultat d'une requête async
  --status UUID       Afficher le statut d'une requête async
`);
    process.exit(argv.length === 0 ? 1 : 0);
  }

  if (!process.env.FAL_KEY?.trim()) {
    console.error("✗ FAL_KEY manquante. Ajoutez-la dans web/.env");
    console.error("  https://fal.ai/dashboard/keys");
    process.exit(1);
  }

  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: process.env.FAL_KEY.trim() });

  const endpoint = "fal-ai/kling-video/v3/pro/text-to-video";
  const requestId = flag(argv, "request-id") || flag(argv, "status");

  if (flag(argv, "status")) {
    const status = await fal.queue.status(endpoint, {
      requestId: flag(argv, "status"),
      logs: true,
    });
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  if (requestId && !hasFlag(argv, "async")) {
    const result = await fal.queue.result(endpoint, { requestId });
    await downloadVideo(result.data.video.url, flag(argv, "out"));
    console.log("requestId:", result.requestId);
    return;
  }

  const prompt = flag(argv, "prompt");
  if (!prompt?.trim()) {
    console.error("✗ --prompt requis.");
    process.exit(1);
  }

  const input = {
    prompt: prompt.trim(),
    duration: flag(argv, "duration", "5"),
    aspect_ratio: flag(argv, "aspect", "16:9"),
    generate_audio: !hasFlag(argv, "no-audio"),
    negative_prompt: "blur, distort, and low quality",
    cfg_scale: 0.5,
    shot_type: "customize",
  };

  if (hasFlag(argv, "async")) {
    const { request_id } = await fal.queue.submit(endpoint, { input });
    console.log("✓ Soumis en file d'attente");
    console.log("requestId:", request_id);
    console.log(`Statut : node scripts/kling-text-to-video.mjs --status ${request_id}`);
    console.log(`Résultat : node scripts/kling-text-to-video.mjs --request-id ${request_id} --out video.mp4`);
    return;
  }

  console.log("→ Génération Kling v3 Pro (peut prendre plusieurs minutes)…");
  const result = await fal.subscribe(endpoint, {
    input,
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS" && update.logs) {
        for (const log of update.logs) {
          console.log(" ", log.message);
        }
      }
    },
  });

  const outPath = await downloadVideo(
    result.data.video.url,
    flag(argv, "out"),
  );
  console.log("✓ Vidéo :", outPath);
  console.log("  requestId:", result.requestId);
}

async function downloadVideo(url, outArg) {
  const outPath =
    outArg ||
    resolve(webRoot, "output", `kling-${Date.now()}.mp4`);
  await mkdir(dirname(outPath), { recursive: true });

  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Téléchargement échoué (${res.status}) : ${url}`);
  }

  await pipeline(res.body, createWriteStream(outPath));
  const { size } = await stat(outPath);
  console.log(`  (${Math.round(size / 1024)} Ko)`);
  return outPath;
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
