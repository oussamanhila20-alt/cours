"use client";

import type { SceneCard } from "./scene-config";

type AnimatedCardProps = {
  card: SceneCard;
  sceneElapsed: number;
  visible: boolean;
};

export function AnimatedCard({ card, sceneElapsed, visible }: AnimatedCardProps) {
  if (!visible || sceneElapsed < card.delay) return null;

  const intensity = Math.min(1, (sceneElapsed - card.delay) / 0.5);

  return (
    <div
      className="bsv-card-glow"
      style={{
        top: `${card.top}%`,
        left: `${card.left}%`,
        width: `${card.width}%`,
        height: `${card.height}%`,
        opacity: intensity,
        transform: `scale(${0.97 + intensity * 0.03})`,
      }}
      aria-hidden
    />
  );
}
