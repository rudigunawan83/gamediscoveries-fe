import { useCallback } from "react";
import { useTranslations, type Messages } from "next-intl";

/** Localized label for an XP rule code; unknown codes fall back to the server text. */
export function useXpRuleLabel() {
  const t = useTranslations("XpRules");
  return useCallback(
    (ruleCode: string, fallback?: string | null) => {
      const key = ruleCode as keyof Messages["XpRules"];
      if (t.has(key)) return t(key);
      return fallback || ruleCode.replaceAll("_", " ");
    },
    [t],
  );
}
