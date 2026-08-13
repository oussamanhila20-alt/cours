"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSceneAtTime,
  SCENES,
  TOTAL_DURATION_S,
} from "./scene-config";

type SceneControllerChildren = (props: {
  currentTime: number;
  scene: ReturnType<typeof getSceneAtTime>;
  sceneElapsed: number;
  showTransition: "flash" | "swipe" | null;
  isEnding: boolean;
  isPlaying: boolean;
}) => React.ReactNode;

type SceneControllerProps = {
  children: SceneControllerChildren;
  onTimeUpdate?: (t: number) => void;
  replayKey: number;
  exportMode?: boolean;
  seekMode?: boolean;
};

function transitionForScene(sceneId: number): "flash" | "swipe" | null {
  if (sceneId === 2 || sceneId === 5) return "flash";
  if (sceneId === 3 || sceneId === 4) return "swipe";
  return "flash";
}

export function SceneController({
  children,
  onTimeUpdate,
  replayKey,
  exportMode = false,
  seekMode = false,
}: SceneControllerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTransition, setShowTransition] = useState<"flash" | "swipe" | null>(null);
  const startRef = useRef<number | null>(null);
  const prevSceneRef = useRef(1);
  const rafRef = useRef<number>(0);

  const tick = useCallback(
    (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;
      const t = Math.min(elapsed, TOTAL_DURATION_S);

      const scene = getSceneAtTime(t);
      if (scene.id !== prevSceneRef.current) {
        setShowTransition(transitionForScene(scene.id));
        prevSceneRef.current = scene.id;
        window.setTimeout(() => setShowTransition(null), 700);
      }

      setCurrentTime(t);
      onTimeUpdate?.(t);

      if (t >= TOTAL_DURATION_S) {
        setIsPlaying(false);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [onTimeUpdate],
  );

  useEffect(() => {
    if (seekMode) {
      setCurrentTime(0);
      setIsPlaying(false);
      prevSceneRef.current = getSceneAtTime(0).id;

      const w = window as Window & {
        __bsvSeek?: (t: number) => void;
        __bsvReady?: boolean;
      };
      w.__bsvSeek = (t: number) => {
        const clamped = Math.max(0, Math.min(TOTAL_DURATION_S, t));
        setCurrentTime(clamped);
        setShowTransition(null);
        prevSceneRef.current = getSceneAtTime(clamped).id;
      };
      w.__bsvReady = true;
      document.documentElement.setAttribute("data-bsv-export-ready", "true");

      return () => {
        delete w.__bsvSeek;
        delete w.__bsvReady;
        document.documentElement.removeAttribute("data-bsv-export-ready");
      };
    }

    if (exportMode) {
      setCurrentTime(0);
      setIsPlaying(true);
      startRef.current = null;
      prevSceneRef.current = getSceneAtTime(0).id;
      rafRef.current = requestAnimationFrame(tick);

      return () => cancelAnimationFrame(rafRef.current);
    }

    setCurrentTime(0);
    setIsPlaying(true);
    startRef.current = null;
    prevSceneRef.current = getSceneAtTime(0).id;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [replayKey, tick, exportMode, seekMode]);

  const scene = getSceneAtTime(currentTime);
  const sceneElapsed = currentTime - scene.start;
  const isEnding = currentTime >= TOTAL_DURATION_S - 1.2;

  return (
    <>
      {children({
        currentTime,
        scene,
        sceneElapsed,
        showTransition,
        isEnding,
        isPlaying,
      })}
    </>
  );
}

export { SCENES, TOTAL_DURATION_S };
