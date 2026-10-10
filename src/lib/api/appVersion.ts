import { apiClient } from "@/lib/api/client";

export type AppRelease = {
  platform: "android" | "ios";
  latestVersion: string;
  latestBuild: number;
  minSupportedBuild: number;
  storeUrl?: string | null;
  apkUrl?: string | null;
  releaseNotes?: string | null;
};

/** Stable link to the newest APK, used when the version API is unreachable. */
export const ANDROID_APK_URL = "/downloads/gamediscoveries.apk";

export async function getAppRelease(platform: "android" | "ios") {
  return apiClient.get<AppRelease>(`/api/v1/app/version?platform=${platform}`);
}
