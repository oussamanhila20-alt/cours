export const TOTAL_DURATION_S = 30;
export const STAGE_W = 1080;
export const STAGE_H = 1920;
export const FPS = 30;

export type SceneCard = {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  delay: number;
};

export type SceneHighlight = {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  delay: number;
  color?: string;
};

export type SceneConfig = {
  id: number;
  start: number;
  end: number;
  frame: string;
  subtitle: string;
  zoomFrom: number;
  zoomTo: number;
  cards: SceneCard[];
  highlights: SceneHighlight[];
  /** Extra overlay flags per scene */
  flags: {
    bookGlow?: boolean;
    lightSweep?: boolean;
    scanLine?: boolean;
    phoneFloat?: boolean;
    gpsRoute?: boolean;
    busMove?: boolean;
    ctaPulse?: boolean;
    urlGlow?: boolean;
    notificationDots?: boolean;
  };
};

export const SCENES: SceneConfig[] = [
  {
    id: 1,
    start: 0,
    end: 6,
    frame: "01-portail-intelligent.png",
    subtitle: "BotoSchool centralise la gestion de votre école privée.",
    zoomFrom: 1,
    zoomTo: 1.08,
    flags: { bookGlow: true, lightSweep: true },
    cards: [
      { id: "c1", top: 38, left: 4, width: 18, height: 10, delay: 0.4 },
      { id: "c2", top: 48, left: 3, width: 18, height: 10, delay: 0.7 },
      { id: "c3", top: 58, left: 4, width: 18, height: 10, delay: 1.0 },
      { id: "c4", top: 38, left: 78, width: 18, height: 10, delay: 1.3 },
      { id: "c5", top: 48, left: 79, width: 18, height: 10, delay: 1.6 },
    ],
    highlights: [
      { id: "dash", top: 32, left: 22, width: 56, height: 38, delay: 0.2 },
    ],
  },
  {
    id: 2,
    start: 6,
    end: 12,
    frame: "02-tableau-de-bord-ia.png",
    subtitle: "La direction voit plus clair, plus vite.",
    zoomFrom: 1.02,
    zoomTo: 1.1,
    flags: { scanLine: true, bookGlow: true },
    cards: [
      { id: "c1", top: 36, left: 2, width: 16, height: 9, delay: 0.3 },
      { id: "c2", top: 46, left: 2, width: 16, height: 9, delay: 0.6 },
      { id: "c3", top: 56, left: 2, width: 16, height: 9, delay: 0.9 },
      { id: "c4", top: 36, left: 82, width: 16, height: 9, delay: 1.2 },
      { id: "c5", top: 46, left: 82, width: 16, height: 9, delay: 1.5 },
      { id: "c6", top: 56, left: 82, width: 16, height: 9, delay: 1.8 },
    ],
    highlights: [
      { id: "eleves", top: 34, left: 28, width: 14, height: 8, delay: 0.5, color: "#0A6CFF" },
      { id: "absences", top: 34, left: 43, width: 14, height: 8, delay: 1.2, color: "#EF4444" },
      { id: "docs", top: 34, left: 58, width: 14, height: 8, delay: 1.9, color: "#0A6CFF" },
      { id: "demandes", top: 43, left: 28, width: 14, height: 8, delay: 2.6, color: "#D4AF37" },
      { id: "comms", top: 43, left: 43, width: 14, height: 8, delay: 3.3, color: "#8B5CF6" },
      { id: "kpi", top: 43, left: 58, width: 14, height: 8, delay: 4.0, color: "#D4AF37" },
    ],
  },
  {
    id: 3,
    start: 12,
    end: 18,
    frame: "03-communication-parents.png",
    subtitle: "Une communication claire renforce la confiance.",
    zoomFrom: 1,
    zoomTo: 1.06,
    flags: { phoneFloat: true, notificationDots: true, bookGlow: true },
    cards: [
      { id: "msg", top: 34, left: 6, width: 16, height: 8, delay: 0.4 },
      { id: "abs", top: 44, left: 5, width: 16, height: 8, delay: 0.8 },
      { id: "bull", top: 54, left: 6, width: 16, height: 8, delay: 1.2 },
      { id: "ann", top: 34, left: 78, width: 16, height: 8, delay: 1.6 },
      { id: "info", top: 44, left: 79, width: 16, height: 8, delay: 2.0 },
      { id: "notif", top: 54, left: 78, width: 16, height: 8, delay: 2.4 },
    ],
    highlights: [
      { id: "phone", top: 30, left: 36, width: 28, height: 42, delay: 0.2, color: "#15D8FF" },
    ],
  },
  {
    id: 4,
    start: 18,
    end: 24,
    frame: "04-transport-live.png",
    subtitle: "Plus de visibilité. Plus de confiance.",
    zoomFrom: 1,
    zoomTo: 1.07,
    flags: { gpsRoute: true, busMove: true, bookGlow: true },
    cards: [
      { id: "trajet", top: 38, left: 4, width: 16, height: 8, delay: 0.5 },
      { id: "notif", top: 48, left: 3, width: 16, height: 8, delay: 1.0 },
      { id: "bus", top: 58, left: 5, width: 16, height: 8, delay: 1.5 },
      { id: "gps", top: 38, left: 80, width: 16, height: 8, delay: 2.0 },
      { id: "secu", top: 48, left: 79, width: 16, height: 8, delay: 2.5 },
      { id: "coord", top: 58, left: 80, width: 16, height: 8, delay: 3.0 },
    ],
    highlights: [
      { id: "route", top: 52, left: 18, width: 64, height: 12, delay: 0.3, color: "#0A6CFF" },
      { id: "pin", top: 48, left: 46, width: 8, height: 8, delay: 1.2, color: "#15D8FF" },
      { id: "notif-card", top: 36, left: 58, width: 22, height: 10, delay: 2.0, color: "#D4AF37" },
    ],
  },
  {
    id: 5,
    start: 24,
    end: 30,
    frame: "05-demo-botoschool.png",
    subtitle: "Demandez une démonstration personnalisée.",
    zoomFrom: 1.02,
    zoomTo: 1.12,
    flags: { ctaPulse: true, urlGlow: true, bookGlow: true },
    cards: [
      { id: "admin", top: 36, left: 3, width: 16, height: 9, delay: 0.5 },
      { id: "com", top: 46, left: 2, width: 16, height: 9, delay: 1.0 },
      { id: "ia", top: 56, left: 3, width: 16, height: 9, delay: 1.5 },
      { id: "bull", top: 36, left: 81, width: 16, height: 9, delay: 2.0 },
      { id: "trans", top: 46, left: 80, width: 16, height: 9, delay: 2.5 },
      { id: "orient", top: 56, left: 81, width: 16, height: 9, delay: 3.0 },
    ],
    highlights: [
      { id: "calendar", top: 34, left: 58, width: 24, height: 28, delay: 0.4, color: "#0A6CFF" },
      { id: "cta", top: 78, left: 18, width: 64, height: 6, delay: 1.0, color: "#0A6CFF" },
      { id: "url", top: 92, left: 30, width: 40, height: 4, delay: 2.0, color: "#D4AF37" },
    ],
  },
];

export function getSceneAtTime(t: number): SceneConfig {
  return SCENES.find((s) => t >= s.start && t < s.end) ?? SCENES[SCENES.length - 1]!;
}

export function getSceneProgress(t: number, scene: SceneConfig): number {
  const dur = scene.end - scene.start;
  if (dur <= 0) return 1;
  return Math.min(1, Math.max(0, (t - scene.start) / dur));
}

export function lerp(a: number, b: number, p: number): number {
  return a + (b - a) * p;
}
