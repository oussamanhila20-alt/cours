"use client";

type GlowLineProps = {
  /** Scene id for variant paths */
  sceneId: number;
  active: boolean;
};

const PATHS: Record<number, string[]> = {
  1: [
    "M 80 720 Q 200 680 320 760",
    "M 760 720 Q 880 680 1000 760",
    "M 540 400 L 540 620",
  ],
  2: [
    "M 60 680 L 280 720",
    "M 1020 680 L 800 720",
  ],
  3: [
    "M 540 520 L 120 680",
    "M 540 580 L 120 820",
    "M 540 640 L 960 680",
    "M 540 700 L 960 820",
  ],
  4: [
    "M 200 980 L 540 920 L 880 980",
    "M 120 760 L 400 900",
    "M 960 760 L 680 900",
  ],
  5: [
    "M 80 700 L 400 780",
    "M 1000 700 L 680 780",
    "M 540 500 L 540 720",
  ],
};

export function GlowLine({ sceneId, active }: GlowLineProps) {
  if (!active) return null;
  const paths = PATHS[sceneId] ?? PATHS[1];

  return (
    <svg className="bsv-glow-line" viewBox="0 0 1080 1920" aria-hidden>
      <defs>
        <linearGradient id="bsv-gold-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#15d8ff" />
          <stop offset="100%" stopColor="#0a6cff" />
        </linearGradient>
      </defs>
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
