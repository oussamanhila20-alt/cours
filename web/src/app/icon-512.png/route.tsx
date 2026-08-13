import { createPwaIcon } from "@/lib/pwa-icon-image";

export function GET() {
  return createPwaIcon(512, true);
}
