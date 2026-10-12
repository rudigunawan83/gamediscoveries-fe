"use client";

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Camera, ImageIcon, Loader2, Trash2, type LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { authKeys } from "@/features/auth/api/authQueries";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { AVATAR_MAX_BYTES, removeAvatar, uploadAvatar } from "@/features/settings/profileApi";
import { cn } from "@/lib/utils";
import { useErrorMessage } from "./MobileCommunityUi";

/** Camera badge over the profile avatar that opens the app's change-avatar sheet. */
export function MobileAvatarEditor({
  hasAvatar,
  children,
}: {
  hasAvatar: boolean;
  children: ReactNode;
}) {
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const toErrorMessage = useErrorMessage();
  const queryClient = useQueryClient();
  const galleryInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function apply(action: () => Promise<AuthUser>, successMessage: string) {
    setBusy(true);
    try {
      const updated = await action();
      queryClient.setQueryData(authKeys.me(), updated);
      useAuthStore.getState().setUser(updated);
      // Progress also carries the avatar URL and is preferred by some headers.
      void queryClient.invalidateQueries({ queryKey: ["me", "progress"] });
      toast.success(successMessage);
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function onFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type && !file.type.startsWith("image/")) {
      toast.error(t("avatarNotImage"));
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error(t("avatarTooLarge", { maxMb: AVATAR_MAX_BYTES / (1024 * 1024) }));
      return;
    }
    void apply(() => uploadAvatar(file), t("avatarUpdated"));
  }

  function pick(input: HTMLInputElement | null) {
    setOpen(false);
    input?.click();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={busy}
        aria-busy={busy}
        aria-label={busy ? t("uploadingAvatar") : t("changeAvatar")}
        className="relative rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffc83d] disabled:cursor-wait"
      >
        {children}
        {busy ? (
          <span className="absolute inset-[5px] grid place-items-center rounded-full bg-black/55">
            <Loader2 className="size-9 animate-spin text-[#ffc83d]" aria-hidden="true" />
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className="absolute bottom-1 right-0 grid size-10 place-items-center rounded-full border-[3px] border-[#0b0b10] bg-gradient-to-b from-[#ffe08a] to-[#ffc83d] text-[#0b0b10] shadow-[0_0_12px_rgba(255,200,61,0.4)]"
        >
          <Camera className="size-5" />
        </span>
      </button>

      <input ref={galleryInput} type="file" accept="image/*" hidden onChange={onFileChosen} />
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="user"
        hidden
        onChange={onFileChosen}
      />

      <Sheet open={open} onOpenChange={(next) => setOpen(next)}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="mx-auto max-w-xl rounded-t-[28px] border-[#2a2a37] bg-[#15151d] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 text-white"
        >
          <SheetTitle className="px-2 text-lg font-extrabold text-white">
            {t("changeAvatar")}
          </SheetTitle>
          <div className="flex flex-col">
            <SheetOption
              icon={ImageIcon}
              label={t("chooseFromGallery")}
              onClick={() => pick(galleryInput.current)}
            />
            <SheetOption
              icon={Camera}
              label={t("takePhoto")}
              onClick={() => pick(cameraInput.current)}
            />
            {hasAvatar ? (
              <SheetOption
                icon={Trash2}
                label={t("removePhoto")}
                danger
                onClick={() => {
                  setOpen(false);
                  void apply(removeAvatar, t("avatarRemoved"));
                }}
              />
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-11 rounded-2xl border border-[#2a2a37] text-sm font-bold text-white"
          >
            {tCommon("cancel")}
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}

function SheetOption({
  icon: Icon,
  label,
  danger = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-12 items-center gap-4 rounded-xl px-2 text-left text-base font-semibold hover:bg-white/5",
        danger ? "text-[#ff5d73]" : "text-white",
      )}
    >
      <Icon
        className={cn("size-6 shrink-0", danger ? "text-[#ff5d73]" : "text-[#ffc83d]")}
        aria-hidden="true"
      />
      {label}
    </button>
  );
}
