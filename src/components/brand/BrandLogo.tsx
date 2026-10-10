import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/seo/constants";

type BrandLogoProps = {
  className?: string;
  showMark?: boolean;
  showTagline?: boolean;
  tagline?: string;
  size?: "sm" | "md" | "lg";
  href?: string | null;
};

const sizeMap = {
  sm: { mark: 28, text: "text-base", tag: "text-[0.55rem]" },
  md: { mark: 34, text: "text-lg", tag: "text-[0.62rem]" },
  lg: { mark: 44, text: "text-2xl", tag: "text-xs" },
} as const;

export function BrandLogo({
  className,
  showMark = true,
  showTagline = false,
  tagline,
  size = "md",
  href = "/",
}: BrandLogoProps) {
  const t = useTranslations("Seo");
  const s = sizeMap[size];

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark ? (
        <Image
          src="/images/logo-mark.png"
          alt=""
          width={s.mark}
          height={s.mark}
          className="shrink-0 object-contain"
          priority
        />
      ) : null}
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight",
            s.text,
          )}
        >
          <span className="text-foreground">Game</span>
          <span className="bg-brand-gradient bg-clip-text text-transparent">
            Discoveries
          </span>
        </span>
        {showTagline ? (
          <span
            className={cn(
              "mt-1 hidden font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:block sm:tracking-[0.28em]",
              s.tag,
            )}
          >
            {tagline ?? t("tagline")}
          </span>
        ) : null}
      </span>
      <span className="sr-only">{SITE_NAME}</span>
    </span>
  );

  if (href === null || href === "") {
    return content;
  }

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
