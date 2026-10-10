import Link from "next/link";
import { useTranslations } from "next-intl";

type SeoRelatedLinksProps = {
  title?: string;
  links: Array<{ href: string; label: string }>;
};

export function SeoRelatedLinks({ title, links }: SeoRelatedLinksProps) {
  const t = useTranslations("Discovery");
  if (!links.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        {title ?? t("exploreMore")}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex rounded-full border border-border/60 bg-secondary/30 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
