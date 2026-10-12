const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const steps: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "2 minutes ago", "yesterday", "3 months ago"; under a minute is "just now". */
export function relativeTime(iso: string | null | undefined, now: number = Date.now()): string | null {
  if (!iso) return null;
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  if (!Number.isFinite(seconds)) return null;
  if (Math.abs(seconds) < 60) return "just now";
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.trunc(seconds / size), unit);
  }
  return "just now";
}

export function formatJoinedDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

/** Users active within the last 15 minutes show a live dot. */
export function isRecentlyActive(iso: string | null | undefined, now: number = Date.now()) {
  return Boolean(iso) && now - new Date(iso!).getTime() <= 15 * 60 * 1000;
}

export function shortUserId(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export const roleLabel: Record<string, string> = {
  SuperAdmin: "Super Admin",
  Admin: "Admin",
  Moderator: "Moderator",
  Developer: "Developer",
  Advertiser: "Advertiser",
  Player: "Player",
};

export const roleBadgeClass: Record<string, string> = {
  SuperAdmin: "border-[#f5c542]/60 bg-[#f5c542]/15 text-[#f5c542]",
  Admin: "border-[#e0a43a]/50 bg-[#e0a43a]/10 text-[#f0b955]",
  Moderator: "border-[#8b5cf6]/50 bg-[#8b5cf6]/15 text-[#c4b5fd]",
  Developer: "border-[#5b8def]/50 bg-[#5b8def]/10 text-[#9db9f5]",
  Advertiser: "border-[#2dd4bf]/50 bg-[#2dd4bf]/10 text-[#7ee8da]",
  Player: "border-white/10 bg-white/5 text-[#c7c8d6]",
};

export const statusBadge: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: "Active", className: "border-[#3dd68c]/50 bg-[#3dd68c]/10 text-[#3dd68c]", dot: "bg-[#3dd68c]" },
  suspended: { label: "Suspended", className: "border-[#ff6b6b]/50 bg-[#ff6b6b]/10 text-[#ff6b6b]", dot: "bg-[#ff6b6b]" },
};
