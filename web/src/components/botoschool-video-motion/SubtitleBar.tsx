"use client";

type SubtitleBarProps = {
  text: string;
  keyId: string;
};

export function SubtitleBar({ text, keyId }: SubtitleBarProps) {
  return (
    <div key={keyId} className="bsv-subtitle" role="status" aria-live="polite">
      {text}
    </div>
  );
}
