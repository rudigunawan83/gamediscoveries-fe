import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE, parseLanguageMode, resolveLocale, type LanguageMode } from "./config";

export async function getLanguageMode(): Promise<LanguageMode> {
  const store = await cookies();
  return parseLanguageMode(store.get(LOCALE_COOKIE)?.value) ?? "SYSTEM";
}

export default getRequestConfig(async () => {
  const mode = await getLanguageMode();
  const locale = resolveLocale(mode, (await headers()).get("accept-language"));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
