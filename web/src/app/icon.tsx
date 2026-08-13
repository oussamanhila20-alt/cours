import { ImageResponse } from "next/og";
import { createPwaIcon } from "@/lib/pwa-icon-image";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return createPwaIcon(32) as ImageResponse;
}
