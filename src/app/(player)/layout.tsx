import type { ReactNode } from "react";
import { GamePlayerShell } from "@/features/game-player/components/GamePlayerShell";

export default function PlayerLayout({ children }: { children: ReactNode }) {
  return <GamePlayerShell>{children}</GamePlayerShell>;
}
