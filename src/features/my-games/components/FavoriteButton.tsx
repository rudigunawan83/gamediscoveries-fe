"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoriteGame } from "@/features/my-games/hooks/useFavoriteGame";
import { useFavoriteStatus } from "@/features/my-games/hooks/useFavoriteStatus";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  gameId: string;
  source?: string;
  className?: string;
  size?: "icon" | "default" | "sm" | "lg";
  variant?: "icon" | "labeled";
  callbackUrl?: string;
};

export function FavoriteButton({
  gameId,
  source = "game_card",
  className,
  size = "icon",
  variant = "icon",
  callbackUrl,
}: FavoriteButtonProps) {
  const t = useTranslations("Library");
  const { isAuthenticated } = useAuth();
  const statusQuery = useFavoriteStatus(gameId, isAuthenticated);
  const mutation = useFavoriteGame();
  const isFavorite = Boolean(statusQuery.data);

  const label = isFavorite ? t("removeFavorite") : t("addFavorite");

  return (
    <Button
      type="button"
      size={variant === "labeled" ? size === "icon" ? "lg" : size : size}
      variant={variant === "labeled" ? (isFavorite ? "secondary" : "outline") : "secondary"}
      aria-label={label}
      aria-pressed={isFavorite}
      disabled={
        mutation.isPending || (isAuthenticated && statusQuery.isPending)
      }
      className={cn(
        variant === "icon" &&
          "size-8 rounded-full bg-background/70 backdrop-blur",
        variant === "labeled" && "gap-2",
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        mutation.mutate({
          gameId,
          isFavorite,
          source,
          callbackUrl,
        });
      }}
    >
      <Heart
        className={cn(
          "size-4",
          isFavorite && "fill-destructive text-destructive",
        )}
        aria-hidden="true"
      />
      {variant === "labeled" ? (
        <span>{isFavorite ? t("favorite") : t("addToFavorites")}</span>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {isFavorite ? t("inFavorites") : t("notInFavorites")}
      </span>
    </Button>
  );
}
