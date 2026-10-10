import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Game } from "@/types/game";

/** Left-aligned page title, like the app's AppBar on each tab. */
export function MobileTabTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <h1 className="text-[22px] font-extrabold text-white">{title}</h1>
      {action}
    </div>
  );
}

/** Gold pill selector from the app (Daily/Weekly, sort chips). */
export function MobilePillTabs({
  labels,
  selectedIndex,
  onChange,
  expanded = true,
  label,
}: {
  labels: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  expanded?: boolean;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        expanded
          ? "flex rounded-full border border-[#2a2a37] bg-[#15151d] p-1"
          : "-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {labels.map((text, index) => {
        const selected = index === selectedIndex;
        return (
          <button
            key={text}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(index)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-4 py-[9px] text-[13px] transition-colors",
              expanded && "flex-1",
              selected
                ? "bg-[#ffc83d] font-extrabold text-[#1a1205]"
                : cn("font-semibold text-[#9c9cb0]", !expanded && "bg-[#1e1e29]"),
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

/** Row card matching the app's GameListTile: 84px 4:3 art, title, category. */
export function MobileGameListTile({
  game,
  trailing,
}: {
  game: Game;
  trailing?: ReactNode;
}) {
  const category = game.categories[0]?.name;

  return (
    <div className="flex items-center gap-2 rounded-[18px] bg-[#17171f] p-2.5">
      <Link
        href={`/game/${game.slug}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="relative h-[63px] w-[84px] shrink-0 overflow-hidden rounded-[14px] bg-[#1e1e29]">
          {game.thumbnailUrl ? (
            <Image
              src={game.thumbnailUrl}
              alt=""
              fill
              sizes="84px"
              className="object-cover"
            />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold text-white">
            {game.title}
          </span>
          {category ? (
            <span className="mt-0.5 block truncate text-xs text-[#9c9cb0]">
              {category}
            </span>
          ) : null}
          {game.mobileReady ? (
            <span className="mt-1.5 inline-block rounded-full bg-[#2bd576]/15 px-2 py-0.5 text-[11px] font-bold text-[#2bd576]">
              Mobile
            </span>
          ) : null}
        </span>
      </Link>
      {trailing}
    </div>
  );
}

export function MobileGameListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-[18px] bg-[#17171f] p-2.5"
        >
          <div className="h-[63px] w-[84px] rounded-[14px] bg-[#1e1e29]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/5 rounded-lg bg-[#1e1e29]" />
            <div className="h-3 w-2/5 rounded-lg bg-[#1e1e29]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Centered icon + message with optional sign-in actions (app's MessageView). */
export function MobileMessage({
  icon: Icon,
  title,
  message,
  signIn = false,
}: {
  icon: LucideIcon;
  title?: string;
  message: string;
  signIn?: boolean;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-[#ffc83d]/10">
        <Icon className="size-8 text-[#ffc83d]" aria-hidden="true" />
      </span>
      {title ? (
        <p className="mt-4 text-lg font-extrabold text-white">{title}</p>
      ) : null}
      <p className="mt-2 max-w-xs text-sm text-[#9c9cb0]">{message}</p>
      {signIn ? (
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5">
          <Link
            href="/login"
            className="grid h-12 place-items-center rounded-2xl bg-[#ffc83d] text-sm font-extrabold text-[#1a1205]"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="grid h-12 place-items-center rounded-2xl border border-[#2a2a37] text-sm font-bold text-white"
          >
            Create an account
          </Link>
        </div>
      ) : null}
    </div>
  );
}
