"use client";

import { useEffect, useState } from "react";
import { AnimatedFrameScene } from "./AnimatedFrameScene";
import { ReplayButton } from "./ReplayButton";
import { getSceneAtTime } from "./scene-config";
import { SceneController, TOTAL_DURATION_S } from "./SceneController";
import { VideoStage } from "./VideoStage";
import "./botoschool-video-motion.css";

function formatTime(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const ms = Math.floor((t % 1) * 100);
  return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

export function BotoSchoolVideoMotionPage({
  exportMode = false,
  seekMode = false,
}: {
  exportMode?: boolean;
  seekMode?: boolean;
}) {
  const [replayKey, setReplayKey] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [debugTime, setDebugTime] = useState(0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    const prevBg = document.body.style.background;
    const prevMargin = document.body.style.margin;
    document.body.style.overflow = "hidden";
    document.body.style.background = "#020818";
    if (exportMode) {
      document.body.style.margin = "0";
    }
    return () => {
      document.body.style.overflow = prev;
      document.body.style.background = prevBg;
      document.body.style.margin = prevMargin;
    };
  }, [exportMode]);

  const debugScene = getSceneAtTime(debugTime).id;

  return (
    <div className={exportMode ? "bsv-root bsv-export" : "bsv-root"}>
      {!exportMode && debugMode ? (
        <div className="bsv-debug">
          t={formatTime(debugTime)} / {TOTAL_DURATION_S}s · scène {debugScene}
        </div>
      ) : null}

      <VideoStage exportMode={exportMode}>
        <SceneController
          replayKey={replayKey}
          exportMode={exportMode}
          seekMode={seekMode}
          onTimeUpdate={debugMode && !exportMode ? setDebugTime : undefined}
        >
          {({ currentTime, scene, sceneElapsed, showTransition, isEnding }) => (
            <AnimatedFrameScene
              scene={scene}
              currentTime={currentTime}
              sceneElapsed={sceneElapsed}
              showTransition={showTransition}
              isEnding={isEnding}
            />
          )}
        </SceneController>
      </VideoStage>

      {!exportMode ? (
        <ReplayButton
          onReplay={() => setReplayKey((k) => k + 1)}
          debugMode={debugMode}
          onToggleDebug={() => setDebugMode((d) => !d)}
        />
      ) : null}
    </div>
  );
}
