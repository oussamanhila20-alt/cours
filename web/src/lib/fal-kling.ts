/**
 * Kling Video v3 Pro — text-to-video via fal.ai
 * @see https://fal.ai/models/fal-ai/kling-video/v3/pro/text-to-video/api
 */

import { fal } from "@fal-ai/client";

export const KLING_V3_PRO_TEXT_TO_VIDEO =
  "fal-ai/kling-video/v3/pro/text-to-video" as const;

export const FAL_KEY_MANQUANTE = "FAL_KEY_MANQUANTE";

export type KlingAspectRatio = "16:9" | "9:16" | "1:1";

export type KlingDuration =
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15";

export type KlingShotType = "customize" | "intelligent";

export type KlingMultiPromptElement = {
  prompt: string;
  duration?: KlingDuration;
};

export type KlingTextToVideoInput = {
  prompt?: string;
  multi_prompt?: KlingMultiPromptElement[];
  duration?: KlingDuration;
  generate_audio?: boolean;
  shot_type?: KlingShotType;
  aspect_ratio?: KlingAspectRatio;
  negative_prompt?: string;
  cfg_scale?: number;
};

export type KlingVideoFile = {
  url: string;
  content_type?: string;
  file_name?: string;
  file_size?: number;
};

export type KlingTextToVideoOutput = {
  video: KlingVideoFile;
};

export type KlingTextToVideoResult = {
  data: KlingTextToVideoOutput;
  requestId: string;
};

function requireFalKey(): string {
  const key = process.env.FAL_KEY?.trim();
  if (!key) {
    throw new Error(FAL_KEY_MANQUANTE);
  }
  return key;
}

/** Configure fal client from FAL_KEY (server-side only). */
export function configureFalClient(): void {
  fal.config({ credentials: requireFalKey() });
}

function validateInput(input: KlingTextToVideoInput): void {
  const hasPrompt = !!input.prompt?.trim();
  const hasMulti =
    Array.isArray(input.multi_prompt) && input.multi_prompt.length > 0;
  if (hasPrompt === hasMulti) {
    throw new Error(
      "Fournissez soit prompt, soit multi_prompt (un seul des deux).",
    );
  }
}

/**
 * Génère une vidéo (bloquant jusqu'à la fin — peut prendre plusieurs minutes).
 */
export async function generateKlingTextToVideo(
  input: KlingTextToVideoInput,
  options?: { logs?: boolean },
): Promise<KlingTextToVideoResult> {
  validateInput(input);
  configureFalClient();

  const result = await fal.subscribe(KLING_V3_PRO_TEXT_TO_VIDEO, {
    input: {
      negative_prompt: "blur, distort, and low quality",
      generate_audio: true,
      shot_type: "customize",
      aspect_ratio: "16:9",
      duration: "5",
      cfg_scale: 0.5,
      ...input,
    },
    logs: options?.logs ?? false,
    onQueueUpdate: (update) => {
      if (options?.logs && update.status === "IN_PROGRESS" && update.logs) {
        for (const log of update.logs) {
          console.log("[kling]", log.message);
        }
      }
    },
  });

  return {
    data: result.data as KlingTextToVideoOutput,
    requestId: result.requestId,
  };
}

/** Soumet une génération en file d'attente (non bloquant). */
export async function submitKlingTextToVideo(
  input: KlingTextToVideoInput,
  webhookUrl?: string,
): Promise<{ requestId: string }> {
  validateInput(input);
  configureFalClient();

  const { request_id } = await fal.queue.submit(KLING_V3_PRO_TEXT_TO_VIDEO, {
    input: {
      negative_prompt: "blur, distort, and low quality",
      generate_audio: true,
      shot_type: "customize",
      aspect_ratio: "16:9",
      duration: "5",
      cfg_scale: 0.5,
      ...input,
    },
    webhookUrl,
  });

  return { requestId: request_id };
}

export async function getKlingTextToVideoStatus(
  requestId: string,
  logs = false,
) {
  configureFalClient();
  return fal.queue.status(KLING_V3_PRO_TEXT_TO_VIDEO, {
    requestId,
    logs,
  });
}

export async function getKlingTextToVideoResult(
  requestId: string,
): Promise<KlingTextToVideoResult> {
  configureFalClient();
  const result = await fal.queue.result(KLING_V3_PRO_TEXT_TO_VIDEO, {
    requestId,
  });
  return {
    data: result.data as KlingTextToVideoOutput,
    requestId: result.requestId,
  };
}
