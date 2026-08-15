import { ImageResponse } from "next/og";

const NAVY = "#070707";
const GOLD = "#d4af37";
const MAUVE = "#c4a0d8";

export function createPwaIcon(size: number, maskable = false) {
  const pad = maskable ? Math.round(size * 0.18) : Math.round(size * 0.12);
  const fontSize = Math.round(size * (maskable ? 0.32 : 0.38));
  const radius = Math.round(size * 0.18);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: NAVY,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: size - pad * 2,
            height: size - pad * 2,
            borderRadius: radius,
            background: `linear-gradient(135deg, ${GOLD} 0%, ${MAUVE} 100%)`,
            color: NAVY,
            fontSize,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            fontFamily: "serif",
          }}
        >
          CB
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
