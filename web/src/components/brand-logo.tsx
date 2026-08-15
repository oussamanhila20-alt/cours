import Image from "next/image";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
};

const sizes = {
  sm: { box: "h-10 w-10 sm:h-11 sm:w-11", text: "text-sm sm:text-base" },
  md: { box: "h-11 w-11 sm:h-12 sm:w-12", text: "text-base sm:text-lg" },
  lg: { box: "h-14 w-14 sm:h-16 sm:w-16", text: "text-lg sm:text-xl" },
};

export function BrandLogo({ size = "md", showName = true }: BrandLogoProps) {
  const s = sizes[size];
  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      <Image
        src="/logo-centre-beta.png"
        alt={showName ? "" : "Centre Beta"}
        width={128}
        height={128}
        className={`${s.box} shrink-0 rounded-full border border-gold/50 object-cover shadow-[0_0_18px_rgba(212,175,55,0.28)]`}
        priority
      />
      {showName ? (
        <span
          className={`font-display block truncate font-semibold tracking-[0.04em] text-gold ${s.text}`}
        >
          Centre Beta
        </span>
      ) : null}
    </span>
  );
}
