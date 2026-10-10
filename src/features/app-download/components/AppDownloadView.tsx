"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useTranslations, type Messages } from "next-intl";
import {
  Apple,
  BellRing,
  Download,
  ShieldCheck,
  Smartphone,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { ANDROID_APK_URL, getAppRelease } from "@/lib/api/appVersion";

type AppDownloadKey = keyof Messages["AppDownload"];

const STEPS = ["step1", "step2", "step3"] as const satisfies readonly AppDownloadKey[];

const FEATURES = [
  { icon: Trophy, text: "featureXp" },
  { icon: BellRing, text: "featureNotifications" },
  { icon: Smartphone, text: "featureContinue" },
] as const satisfies readonly { icon: LucideIcon; text: AppDownloadKey }[];

export function AppDownloadView() {
  const t = useTranslations("AppDownload");
  const release = useQuery({
    queryKey: ["app-release", "android"],
    queryFn: async () => (await getAppRelease("android")).data,
    staleTime: 5 * 60_000,
  });

  const info = release.data;
  const apkUrl = info?.apkUrl || ANDROID_APK_URL;

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-white">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1e1e29] via-[#15151d] to-[#0b0b10] p-6 text-center shadow-2xl shadow-black/30 sm:p-10">
        <Image
          src="/images/app-icon.png"
          alt={t("iconAlt")}
          width={96}
          height={96}
          priority
          className="mx-auto rounded-[1.6rem] shadow-xl shadow-amber-500/10"
        />
        <h1 className="mt-5 font-display text-3xl font-black sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
          {t("intro")}
        </p>
        {info ? (
          <p className="mt-3 text-xs font-semibold text-slate-400">
            {t("version", { version: info.latestVersion, build: info.latestBuild })}
          </p>
        ) : null}

        <a
          href={apkUrl}
          download
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffc83d] to-[#f5a524] px-8 py-3 text-base font-black text-[#1a1205] shadow-lg shadow-amber-500/20 transition hover:brightness-105"
        >
          <Download className="size-5" aria-hidden="true" />
          {t("downloadApk")}
        </a>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />
          {t("official")}
        </p>
        {info?.releaseNotes ? (
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
            <span className="font-bold text-white">{t("whatsNew")}</span>
            {info.releaseNotes}
          </p>
        ) : null}
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-[#15151d] p-6">
        <h2 className="font-display text-xl font-black">{t("howToInstall")}</h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-slate-300">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#ffc83d] text-xs font-black text-[#1a1205]">
                {index + 1}
              </span>
              <span className="pt-1">{t(step)}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-slate-400">{t("updateNote")}</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, text }) => (
          <div key={text} className="rounded-2xl border border-white/10 bg-[#15151d] p-4 text-sm text-slate-300">
            <Icon className="mb-2 size-5 text-[#ffc83d]" aria-hidden="true" />
            {t(text)}
          </div>
        ))}
      </section>

      <section className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#15151d] p-4 text-sm text-slate-400">
        <Apple className="size-5 shrink-0 text-slate-300" aria-hidden="true" />
        {t("iosSoon")}
      </section>
    </div>
  );
}
