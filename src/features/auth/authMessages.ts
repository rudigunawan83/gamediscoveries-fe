import { useCallback } from "react";
import { useTranslations, type Messages } from "next-intl";

export type AuthMessageKey = keyof Messages["Auth"];

/** Schemas and error mappers return message keys; components translate them when rendering. */
export const authKey = (key: AuthMessageKey) => key;

/** Translates an `Auth` key; unknown text (e.g. a server message) is shown as-is. */
export function useAuthMessage() {
  const t = useTranslations("Auth");
  return useCallback(
    (key: string | null | undefined) => {
      if (!key) return undefined;
      return t.has(key as AuthMessageKey) ? t(key as AuthMessageKey) : key;
    },
    [t],
  );
}
