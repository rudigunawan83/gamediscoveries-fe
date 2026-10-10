import { render } from "@testing-library/react";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import type { HistoryFormatter } from "@/features/my-games/utils/formatPlayedAt";
import type { Locale } from "@/i18n/config";
import en from "../../../messages/en.json";
import id from "../../../messages/id.json";

export function renderWithIntl(ui: ReactElement, locale: Locale = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "en" ? en : id}>
      {ui}
    </NextIntlClientProvider>,
  );
}

export function gamificationTranslator(locale: Locale = "en") {
  return createTranslator({ locale, messages: locale === "en" ? en : id, namespace: "Gamification" });
}

export function communityTranslator(locale: Locale = "en") {
  return createTranslator({ locale, messages: locale === "en" ? en : id, namespace: "Community" });
}

export function seoTranslator(locale: Locale = "en") {
  return createTranslator({ locale, messages: locale === "en" ? en : id, namespace: "Seo" });
}

export function notificationsTranslator(locale: Locale = "en") {
  return createTranslator({ locale, messages: locale === "en" ? en : id, namespace: "Notifications" });
}

export function historyFormatter(locale: Locale = "en"): HistoryFormatter {
  const messages = locale === "en" ? en : id;
  return {
    t: createTranslator({ locale, messages, namespace: "Library" }),
    time: createTranslator({ locale, messages, namespace: "Time" }),
    locale,
  };
}
