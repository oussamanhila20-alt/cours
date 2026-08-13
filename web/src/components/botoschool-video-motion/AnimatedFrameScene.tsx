"use client";

import { AnimatedCard } from "./AnimatedCard";
import { GlowLine } from "./GlowLine";
import { ParticlesLayer } from "./ParticlesLayer";
import { SubtitleBar } from "./SubtitleBar";
import {
  getSceneProgress,
  lerp,
  type SceneConfig,
} from "./scene-config";

type AnimatedFrameSceneProps = {
  scene: SceneConfig;
  currentTime: number;
  sceneElapsed: number;
  showTransition: "flash" | "swipe" | null;
  isEnding: boolean;
};

export function AnimatedFrameScene({
  scene,
  currentTime,
  sceneElapsed,
  showTransition,
  isEnding,
}: AnimatedFrameSceneProps) {
  const progress = getSceneProgress(currentTime, scene);
  const scale = lerp(scene.zoomFrom, scene.zoomTo, progress);
  const translateY = lerp(12, 0, Math.min(1, sceneElapsed / 1.2));

  return (
    <div className="bsv-stage" data-scene={scene.id}>
      <div
        className="bsv-frame-layer"
        style={{
          backgroundImage: `url(/video-botoschool/frames/${scene.frame})`,
          transform: `scale(${scale}) translateY(${translateY}px)`,
        }}
      />

      <div className="bsv-vignette" aria-hidden />

      {scene.flags.bookGlow ? <div className="bsv-book-glow" aria-hidden /> : null}

      {scene.id === 1 ? <div className="bsv-logo-pulse" aria-hidden /> : null}

      {scene.flags.lightSweep ? <div className="bsv-light-sweep" aria-hidden /> : null}

      {scene.flags.scanLine ? <div className="bsv-scan-line" aria-hidden /> : null}

      <ParticlesLayer count={32} seed={scene.id * 17} />

      <GlowLine sceneId={scene.id} active />

      {scene.highlights.map((h) => {
        if (sceneElapsed < h.delay) return null;
        const fadeIn = Math.min(1, (sceneElapsed - h.delay) / 0.6);
        const fadeOut =
          sceneElapsed > h.delay + 2.5
            ? Math.max(0, 1 - (sceneElapsed - h.delay - 2.5) / 1.2)
            : 1;
        const opacity = fadeIn * fadeOut * 0.35;

        return (
          <div
            key={h.id}
            className="bsv-highlight"
            style={{
              top: `${h.top}%`,
              left: `${h.left}%`,
              width: `${h.width}%`,
              height: `${h.height}%`,
              opacity,
              borderColor: h.color ?? "rgba(21, 216, 255, 0.6)",
              boxShadow: `0 0 24px ${h.color ?? "rgba(10, 108, 255, 0.5)"}`,
            }}
            aria-hidden
          />
        );
      })}

      {scene.cards.map((card) => (
        <AnimatedCard
          key={card.id}
          card={card}
          sceneElapsed={sceneElapsed}
          visible
        />
      ))}

      {scene.flags.phoneFloat ? (
        <>
          <div className="bsv-phone-float" aria-hidden />
          {scene.flags.notificationDots
            ? ["38%", "44%", "50%", "56%"].map((top, i) => (
                <span
                  key={top}
                  className="bsv-notif-dot"
                  style={{
                    top,
                    left: `${62 + (i % 2) * 4}%`,
                    animationDelay: `${i * 0.35}s`,
                  }}
                  aria-hidden
                />
              ))
            : null}
        </>
      ) : null}

      {scene.flags.gpsRoute ? (
        <>
          <div className="bsv-gps-route" aria-hidden>
            <svg viewBox="0 0 700 120" preserveAspectRatio="none">
              <path d="M 20 80 Q 180 20 350 60 T 680 40" />
            </svg>
          </div>
          <div
            className="bsv-gps-pin"
            style={{ top: "46%", left: "44%" }}
            aria-hidden
          />
          <div className="bsv-bus-layer" aria-hidden />
        </>
      ) : null}

      {scene.flags.ctaPulse ? (
        <div
          className="bsv-cta-pulse"
          style={{ top: "78%", left: "18%", width: "64%", height: "5%" }}
          aria-hidden
        />
      ) : null}

      {scene.flags.urlGlow && sceneElapsed > 2 ? (
        <div className="bsv-url-glow" aria-hidden />
      ) : null}

      <SubtitleBar text={scene.subtitle} keyId={`sub-${scene.id}-${Math.floor(currentTime)}`} />

      {showTransition === "flash" ? <div className="bsv-transition-flash" aria-hidden /> : null}
      {showTransition === "swipe" ? <div className="bsv-transition-swipe" aria-hidden /> : null}

      {isEnding ? <div className="bsv-end-fade" aria-hidden /> : null}
    </div>
  );
}
