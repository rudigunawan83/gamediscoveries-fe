import type { ReactNode } from "react";

export function GamePlayerShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#060914] text-white">
      {children}
    </div>
  );
}
