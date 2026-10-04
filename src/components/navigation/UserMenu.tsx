"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name?: string | null, email?: string | null) {
  const source = (name || email || "U").trim();
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { user } = useCurrentUser();

  if (!isAuthenticated) {
    return (
      <Button
        asChild
        className="h-10 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgb(168_85_247_/_35%)] hover:opacity-95"
      >
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  const label = user?.displayName || user?.email || "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 p-1 pr-3 text-sm font-medium text-foreground outline-none transition hover:bg-card focus-visible:ring-2 focus-visible:ring-ring/60"
        aria-label="Open user menu"
      >
        <Avatar size="sm">
          {user?.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback>
            {initials(user?.displayName, user?.email)}
          </AvatarFallback>
        </Avatar>
        <span className="max-w-[9rem] truncate">{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem
          onClick={() => {
            router.push("/my-games");
          }}
        >
          My Games
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void logout();
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
