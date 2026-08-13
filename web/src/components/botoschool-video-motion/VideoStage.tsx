"use client";

import { useEffect, useRef, useState } from "react";
import { STAGE_H, STAGE_W } from "./scene-config";

type VideoStageProps = {
  children: React.ReactNode;
  exportMode?: boolean;
};

export function VideoStage({ children, exportMode = false }: VideoStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (exportMode) {
      setScale(1);
      return;
    }

    function updateScale() {
      const el = wrapRef.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      const sx = width / STAGE_W;
      const sy = height / STAGE_H;
      setScale(Math.min(sx, sy, 1));
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [exportMode]);

  return (
    <div
      ref={wrapRef}
      className={exportMode ? "bsv-export-area bsv-export-area--fixed" : "bsv-export-area"}
    >
      <div
        className="bsv-stage-wrap"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: exportMode ? undefined : `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
