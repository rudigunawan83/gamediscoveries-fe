import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { GamePlayerErrorKind } from "@/features/game-player/types/game-player.types";

type GamePlayerErrorProps = {
  kind: GamePlayerErrorKind;
  backHref: string;
  onRetry?: () => void;
};

export function GamePlayerError({ kind, backHref, onRetry }: GamePlayerErrorProps) {
  if (kind === "unavailable" || kind === "invalid_url") {
    return (
      <div
        role="alert"
        className="flex size-full min-h-[16rem] flex-col items-center justify-center gap-4 bg-[#060914] px-6 text-center"
      >
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-white">Game Unavailable</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            This game cannot be played right now.
          </p>
        </div>
        <Button asChild size="lg" className="bg-brand-gradient text-[#1a1205]">
          <Link href={backHref}>Back to Game</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex size-full min-h-[16rem] flex-col items-center justify-center gap-4 bg-[#060914] px-6 text-center"
    >
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold text-white">Unable to load this game.</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Please try again or choose another game.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry ? (
          <Button
            type="button"
            size="lg"
            className="bg-brand-gradient text-[#1a1205]"
            onClick={onRetry}
          >
            Retry
          </Button>
        ) : null}
        <Button asChild size="lg" variant="outline">
          <Link href="/games">More Games</Link>
        </Button>
      </div>
    </div>
  );
}
