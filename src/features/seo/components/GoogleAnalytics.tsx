"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  CONSENT_CHANGE_EVENT,
  GA_MEASUREMENT_ID,
  readConsent,
  writeConsent,
  type AnalyticsConsent,
} from "@/lib/analytics/ga4";

type ConsentState = AnalyticsConsent | "unknown" | "loading";

/**
 * Loads GA4 only after the visitor accepts (basic consent mode): nothing is sent to Google
 * before that, and GPC / Do Not Track count as a refusal.
 */
function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function GoogleAnalytics() {
  const consent = useSyncExternalStore<ConsentState>(
    subscribeConsent,
    () => readConsent() ?? "unknown",
    () => "loading",
  );

  if (!GA_MEASUREMENT_ID) return null;
  if (consent === "unknown") return <ConsentBanner />;
  if (consent !== "granted") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'granted'
});
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', {
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});`}
      </Script>
    </>
  );
}

function ConsentBanner() {
  const t = useTranslations("Consent");
  return (
    <div
      role="region"
      aria-label={t("title")}
      className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-xl rounded-xl border border-white/10 bg-[#0b1020]/95 p-4 shadow-xl backdrop-blur lg:bottom-4"
    >
      <p className="text-sm text-muted-foreground">{t("message")}</p>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => writeConsent("denied")}>
          {t("decline")}
        </Button>
        <Button size="sm" onClick={() => writeConsent("granted")}>
          {t("accept")}
        </Button>
      </div>
    </div>
  );
}
