import Link from "next/link";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("Errors");
  const tCommon = useTranslations("Common");
  return (
    <EmptyState
      title={t("notFoundTitle")}
      description={t("notFoundDescription")}
      action={
        <Button asChild>
          <Link href="/">{tCommon("backToHome")}</Link>
        </Button>
      }
    />
  );
}
