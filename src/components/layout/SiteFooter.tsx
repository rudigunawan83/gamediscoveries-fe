import Link from "next/link";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/brand/BrandLogo";
import type { NavLabelKey } from "@/components/navigation/nav-config";
import { SITE_NAME } from "@/lib/seo/constants";

const footerLinks = [
  { href: "/most-popular", label: "mostPopular" },
  { href: "/hot-games", label: "hotGames" },
  { href: "/best-games", label: "bestGames" },
  { href: "/most-played", label: "mostPlayed" },
  { href: "/exclusive-games", label: "exclusive" },
  { href: "/multiplayer", label: "multiplayer" },
  { href: "/collections", label: "collections" },
  { href: "/community", label: "community" },
] as const satisfies readonly { href: string; label: NavLabelKey }[];

export function SiteFooter() {
  const t = useTranslations("Nav");

  return (
    <footer className="mt-auto border-t border-primary/15 bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <BrandLogo size="md" showTagline href={null} />
        <nav aria-label={t("footerLabel")} className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {t(link.label)}
            </Link>
          ))}
          <Link href="/download" className="font-semibold text-primary hover:underline">
            {t("downloadApp")}
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. {t("footerTagline")}
        </p>
      </div>
    </footer>
  );
}
