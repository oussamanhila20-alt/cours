"use client";

import { useMemo } from "react";

type ParticlesLayerProps = {
  count?: number;
  seed?: number;
};

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export function ParticlesLayer({ count = 36, seed = 1 }: ParticlesLayerProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = pseudoRandom(seed + i);
        const r2 = pseudoRandom(seed + i + 100);
        const r3 = pseudoRandom(seed + i + 200);
        return {
          id: i,
          left: `${r * 100}%`,
          top: `${50 + r2 * 50}%`,
          size: 2 + r3 * 4,
          delay: r * 4,
          duration: 4 + r2 * 5,
          gold: r3 > 0.55,
        };
      }),
    [count, seed],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="bsv-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.gold
              ? "radial-gradient(circle, #d4af37 0%, transparent 70%)"
              : "radial-gradient(circle, #15d8ff 0%, transparent 70%)",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
