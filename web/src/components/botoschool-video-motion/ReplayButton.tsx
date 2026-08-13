"use client";

type ReplayButtonProps = {
  onReplay: () => void;
  debugMode: boolean;
  onToggleDebug: () => void;
};

export function ReplayButton({ onReplay, debugMode, onToggleDebug }: ReplayButtonProps) {
  return (
    <div className="bsv-controls">
      <button type="button" className="bsv-btn" onClick={onReplay}>
        Replay
      </button>
      <button type="button" className="bsv-btn" onClick={onToggleDebug}>
        {debugMode ? "Debug ON" : "Debug OFF"}
      </button>
    </div>
  );
}
