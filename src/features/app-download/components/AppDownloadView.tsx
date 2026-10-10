"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Apple, BellRing, Download, ShieldCheck, Smartphone, Trophy } from "lucide-react";
import { ANDROID_APK_URL, getAppRelease } from "@/lib/api/appVersion";

const STEPS = [
  "Tap Download APK and wait for the file to finish downloading.",
  "Open the downloaded file. If Android asks, allow your browser to install unknown apps.",
  "Tap Install, then open GameDiscoveries and sign in with your account.",
];

const FEATURES = [
  { icon: Trophy, text: "Earn XP, missions and achievements on the go" },
  { icon: BellRing, text: "Notifications for replies, follows and rewards" },
  { icon: Smartphone, text: "Continue playing where you left off on the web" },
];

export function AppDownloadView() {
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
          alt="GameDiscoveries app icon"
          width={96}
          height={96}
          priority
          className="mx-auto rounded-[1.6rem] shadow-xl shadow-amber-500/10"
        />
        <h1 className="mt-5 font-display text-3xl font-black sm:text-4xl">
          GameDiscoveries for Android
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
          Play thousands of free games, keep your streak alive and level up with your
          friends — right from your phone.
        </p>
        {info ? (
          <p className="mt-3 text-xs font-semibold text-slate-400">
            Version {info.latestVersion} · build {info.latestBuild}
          </p>
        ) : null}

        <a
          href={apkUrl}
          download
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffc83d] to-[#f5a524] px-8 py-3 text-base font-black text-[#1a1205] shadow-lg shadow-amber-500/20 transition hover:brightness-105"
        >
          <Download className="size-5" aria-hidden="true" />
          Download APK
        </a>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />
          Official build from gamediscoveries.com · Free, no account needed to install
        </p>
        {info?.releaseNotes ? (
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
            <span className="font-bold text-white">What&apos;s new: </span>
            {info.releaseNotes}
          </p>
        ) : null}
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-[#15151d] p-6">
        <h2 className="font-display text-xl font-black">How to install</h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-slate-300">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#ffc83d] text-xs font-black text-[#1a1205]">
                {index + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-slate-400">
          New versions are announced inside the app — tap Update when asked and the
          newest APK downloads from this page.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, text }) => (
          <div key={text} className="rounded-2xl border border-white/10 bg-[#15151d] p-4 text-sm text-slate-300">
            <Icon className="mb-2 size-5 text-[#ffc83d]" aria-hidden="true" />
            {text}
          </div>
        ))}
      </section>

      <section className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#15151d] p-4 text-sm text-slate-400">
        <Apple className="size-5 shrink-0 text-slate-300" aria-hidden="true" />
        The iPhone app is coming soon. Meanwhile, you can play every game right here in
        your browser.
      </section>
    </div>
  );
}
