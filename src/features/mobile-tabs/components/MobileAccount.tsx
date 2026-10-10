"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/api/authQueries";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { updateProfile } from "@/features/settings/profileApi";
import {
  profileFieldErrors,
  profileUnchanged,
  type ProfileField,
} from "@/features/settings/profileRules";
import { useTranslations, type Messages } from "next-intl";
import { toast } from "sonner";
import {
  ChevronDown,
  Gamepad2,
  LogOut,
  Mail,
  MessageSquareText,
  Star,
  Trash2,
  UserCog,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LanguageSection } from "@/features/language/LanguageSection";
import {
  deleteReview,
  getMyReviews,
  getPrivacySettings,
  updatePrivacySetting,
  type MyReview,
  type PrivacyOption,
  type PrivacySettings,
} from "@/lib/api/community";
import { useFormats } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { ApiClientError } from "@/lib/api/types";
import { errorMessage, useErrorMessage } from "./MobileCommunityUi";
import { MobileSubpageHeader } from "./MobileSubpageHeader";
import { MobileMessage } from "./MobileTabUi";

const PRIVACY_KEY = ["me", "privacy"] as const;
const MY_REVIEWS_KEY = ["me", "reviews"] as const;

const card = "rounded-[18px] border border-[#2a2a37] bg-[#17171f]";

function LoadError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("Common");
  return (
    <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
      <p className="text-sm text-[#9c9cb0]">{t("errorGeneric")}</p>
      <button type="button" onClick={onRetry} className="mt-2 text-sm font-bold text-[#ffc83d]">
        {t("retry")}
      </button>
    </div>
  );
}

function ConfirmSheet({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("Common");
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onCancel()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-w-xl rounded-t-[28px] border-[#2a2a37] bg-[#15151d] px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 text-white"
      >
        <SheetTitle className="text-lg font-extrabold text-white">{title}</SheetTitle>
        <SheetDescription className="text-sm text-[#9c9cb0]">{description}</SheetDescription>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-full px-4 text-sm font-bold text-[#ffc83d]"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-full px-4 text-sm font-bold text-[#ff5d73]"
          >
            {confirmLabel}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

type SettingsKey = keyof Messages["Settings"];

/** Message keys (title, hint) in the `Settings` namespace. */
export const PRIVACY_LABELS: Record<PrivacyOption, [SettingsKey, SettingsKey]> = {
  showFavorites: ["privacyShowFavorites", "privacyShowFavoritesHint"],
  showHistory: ["privacyShowHistory", "privacyShowHistoryHint"],
  showAchievements: ["privacyShowAchievements", "privacyShowAchievementsHint"],
  showActivity: ["privacyShowActivity", "privacyShowActivityHint"],
  showOnLeaderboards: ["privacyShowOnLeaderboards", "privacyShowOnLeaderboardsHint"],
};

function fieldClass(invalid: boolean) {
  return cn(
    "h-11 w-full rounded-xl border bg-[#12121a] px-3 text-base font-bold text-white outline-none focus:border-[#ffc83d]",
    invalid ? "border-[#ff5d73]" : "border-[#2a2a37]",
  );
}

function ProfileForm({ user }: { user: AuthUser }) {
  const t = useTranslations("Settings");
  const toErrorMessage = useErrorMessage();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [syncedUser, setSyncedUser] = useState(user);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<ProfileField[]>([]);
  const [taken, setTaken] = useState(false);
  const [saving, setSaving] = useState(false);
  if (!dirty && syncedUser !== user) {
    setSyncedUser(user);
    setDisplayName(user.displayName ?? "");
    setUsername(user.username ?? "");
  }
  const draft = { displayName, username };
  const unchanged = profileUnchanged(draft, user);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = profileFieldErrors(draft, user);
    setErrors(nextErrors);
    setTaken(false);
    if (nextErrors.length > 0 || unchanged || saving) return;
    setSaving(true);
    try {
      const updated = await updateProfile(draft);
      queryClient.setQueryData(authKeys.me(), updated);
      useAuthStore.getState().setUser(updated);
      setDirty(false);
      setDisplayName(updated.displayName ?? "");
      setUsername(updated.username ?? "");
      toast.success(t("profileSaved"));
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        setTaken(true);
        toast.error(t("usernameTaken"));
      } else {
        toast.error(toErrorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  }

  const nameInvalid = errors.includes("displayName");
  const handleInvalid = taken || errors.includes("username");

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-3">
      <div className={cn(card, "space-y-4 px-4 py-4")}>
        <label className="block space-y-1.5">
          <span className="text-[13px] text-[#9c9cb0]">{t("displayName")}</span>
          <input
            value={displayName}
            autoComplete="nickname"
            maxLength={40}
            aria-invalid={nameInvalid}
            aria-describedby="profile-display-name-hint"
            onChange={(event) => {
              setDirty(true);
              setDisplayName(event.target.value);
              setErrors((current) => current.filter((field) => field !== "displayName"));
            }}
            className={fieldClass(nameInvalid)}
          />
          <span
            id="profile-display-name-hint"
            className={cn("block text-xs", nameInvalid ? "text-[#ff5d73]" : "text-[#6b6b7e]")}
          >
            {nameInvalid ? t("displayNameInvalid") : t("displayNameHint")}
          </span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-[13px] text-[#9c9cb0]">{t("username")}</span>
          <input
            value={username}
            autoComplete="username"
            maxLength={30}
            spellCheck={false}
            aria-invalid={handleInvalid}
            aria-describedby="profile-username-hint"
            onChange={(event) => {
              setDirty(true);
              setUsername(event.target.value);
              setTaken(false);
              setErrors((current) => current.filter((field) => field !== "username"));
            }}
            className={fieldClass(handleInvalid)}
          />
          <span
            id="profile-username-hint"
            className={cn("block text-xs", handleInvalid ? "text-[#ff5d73]" : "text-[#6b6b7e]")}
          >
            {taken ? t("usernameTaken") : errors.includes("username") ? t("usernameInvalid") : t("usernameHint")}
          </span>
        </label>
        <div className="flex items-center gap-4 border-t border-[#2a2a37] pt-3">
          <Mail className="size-6 shrink-0 text-[#ffc83d]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[13px] text-[#9c9cb0]">{t("email")}</p>
            <p className="truncate text-base font-bold text-white">{user.email || "—"}</p>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={unchanged || saving}
        className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#ffc83d] text-base font-extrabold text-[#1a1205] disabled:opacity-50"
      >
        {saving ? t("savingProfile") : t("saveProfile")}
      </button>
    </form>
  );
}

function PrivacyCard() {
  const t = useTranslations("Settings");
  const toErrorMessage = useErrorMessage();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: PRIVACY_KEY,
    queryFn: async () => (await getPrivacySettings()).data!,
  });
  const mutation = useMutation({
    mutationFn: ({ option, value }: { option: PrivacyOption; value: boolean }) =>
      updatePrivacySetting(option, value),
    onMutate: async ({ option, value }) => {
      await queryClient.cancelQueries({ queryKey: PRIVACY_KEY });
      const previous = queryClient.getQueryData<PrivacySettings>(PRIVACY_KEY);
      if (previous) queryClient.setQueryData(PRIVACY_KEY, { ...previous, [option]: value });
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(PRIVACY_KEY, context.previous);
      toast.error(toErrorMessage(error));
    },
  });

  if (query.isPending) {
    return <div className={cn(card, "h-[360px] animate-pulse")} aria-hidden="true" />;
  }
  if (query.isError) {
    return <LoadError onRetry={() => void query.refetch()} />;
  }

  const settings = query.data;
  return (
    <ul className={cn(card, "divide-y divide-[#2a2a37]")}>
      {(Object.keys(PRIVACY_LABELS) as PrivacyOption[]).map((option) => {
        const [titleKey, hintKey] = PRIVACY_LABELS[option];
        const checked = settings[option] ?? true;
        const id = `privacy-${option}`;
        return (
          <li key={option} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p id={id} className="font-bold text-white">
                {t(titleKey)}
              </p>
              <p className="text-sm text-[#9c9cb0]">{t(hintKey)}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={checked}
              aria-labelledby={id}
              onClick={() => mutation.mutate({ option, value: !checked })}
              className={cn(
                "relative h-8 w-[52px] shrink-0 rounded-full border-2 transition-colors",
                checked ? "border-[#ffc83d] bg-[#ffc83d]" : "border-[#6b6b7e] bg-[#1e1e29]",
              )}
            >
              <span
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 rounded-full transition-all",
                  checked ? "left-[22px] size-6 bg-[#1a1205]" : "left-1 size-4 bg-[#6b6b7e]",
                )}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Mirrors the app's Account Settings screen. */
export function MobileAccountSettings() {
  const t = useTranslations("Settings");
  const common = useTranslations("Common");
  const { accessToken, logout } = useAuth();
  const currentUser = useCurrentUser();
  const { user, isPending } = currentUser;
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <div className="pb-8">
      <MobileSubpageHeader title={t("title")} />
      {!accessToken ? (
        <div className="space-y-6">
          <MobileMessage
            icon={UserCog}
            title={t("manageAccountTitle")}
            message={t("manageAccountMessage")}
            signIn
          />
          <LanguageSection />
        </div>
      ) : (
        <div className="space-y-6">
          {user ? (
            <ProfileForm key={user.id} user={user} />
          ) : isPending ? (
            <div className={cn(card, "h-64 animate-pulse")} aria-hidden="true" />
          ) : (
            <LoadError onRetry={() => void currentUser.refetch()} />
          )}
          <LanguageSection />
          <section className="space-y-2.5">
            <h2 className="pl-1 text-sm font-bold text-[#9c9cb0]">{t("privacy")}</h2>
            <PrivacyCard />
          </section>
          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[#2a2a37] text-base font-bold text-[#ff5d73]"
          >
            <LogOut className="size-5" aria-hidden="true" />
            {common("signOut")}
          </button>
        </div>
      )}
      <ConfirmSheet
        open={confirmSignOut}
        title={t("signOutTitle")}
        description={t("signOutMessage")}
        confirmLabel={common("signOut")}
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={() => {
          setConfirmSignOut(false);
          void logout();
        }}
      />
    </div>
  );
}

type HelpKey = keyof Messages["Help"];

/** Message keys (question, answer) in the `Help` namespace. */
export const HELP_FAQS: readonly [HelpKey, HelpKey][] = [
  ["earnXpQuestion", "earnXpAnswer"],
  ["progressQuestion", "progressAnswer"],
  ["missionsQuestion", "missionsAnswer"],
  ["gameLoadQuestion", "gameLoadAnswer"],
  ["signOutQuestion", "signOutAnswer"],
];

/** Mirrors the app's Help & Support screen. */
export function MobileHelp() {
  const t = useTranslations("Help");
  return (
    <div className="pb-8">
      <MobileSubpageHeader title={t("title")} />
      <div className="space-y-2.5">
        {HELP_FAQS.map(([question, answer]) => (
          <details key={question} className={cn(card, "group overflow-hidden")}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 font-bold text-white [&::-webkit-details-marker]:hidden">
              <span className="flex-1">{t(question)}</span>
              <ChevronDown
                className="size-5 shrink-0 text-[#9c9cb0] transition-transform group-open:rotate-180 group-open:text-[#ffc83d]"
                aria-hidden="true"
              />
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed text-[#9c9cb0]">{t(answer)}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review, onDelete }: { review: MyReview; onDelete: () => void }) {
  const slug = review.game?.slug ?? "";
  const title = review.game?.title ?? "";
  const thumb = review.game?.thumbnailUrl ?? "";
  const rating = Math.max(0, Math.min(5, Math.round(review.rating)));
  const { timeAgo } = useFormats();
  const t = useTranslations("Reviews");

  return (
    <article className="relative rounded-[18px] bg-[#17171f] py-3 pl-3 pr-1">
      {slug ? (
        <Link
          href={`/game/${encodeURIComponent(slug)}`}
          aria-label={t("open", { title })}
          className="absolute inset-0 rounded-[18px]"
        />
      ) : null}
      <div className="flex items-center gap-3">
        <div className="relative h-[54px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-[#1e1e29]">
          {thumb ? (
            <Image src={thumb} alt="" fill sizes="72px" className="object-cover" />
          ) : (
            <Gamepad2 className="absolute inset-0 m-auto size-6 text-[#6b6b7e]" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-extrabold text-white">{title}</h3>
          <div className="mt-1 flex gap-0.5" role="img" aria-label={t("rated", { rating })}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={cn("size-4 text-[#ffc83d]", index < rating && "fill-[#ffc83d]")}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label={t("deleteLabel")}
          onClick={onDelete}
          className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-[#9c9cb0]"
        >
          <Trash2 className="size-5" aria-hidden="true" />
        </button>
      </div>
      {review.content ? (
        <p className="mt-2.5 whitespace-pre-wrap pr-2 text-sm text-[#9c9cb0]">{review.content}</p>
      ) : null}
      <div className="mt-2 flex gap-2 text-xs">
        <span className="text-[#6b6b7e]">{timeAgo(review.updatedAt || review.createdAt)}</span>
        {review.status === "hidden" ? (
          <span className="font-bold text-[#ff5d73]">{t("hidden")}</span>
        ) : null}
      </div>
    </article>
  );
}

/** Mirrors the app's My Reviews screen. */
export function MobileMyReviews() {
  const t = useTranslations("Reviews");
  const common = useTranslations("Common");
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<MyReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const query = useQuery({
    queryKey: MY_REVIEWS_KEY,
    queryFn: async () => (await getMyReviews()).data ?? [],
    enabled: Boolean(accessToken),
  });
  const items = query.data ?? [];

  async function confirmDelete() {
    const review = toDelete;
    setConfirmOpen(false);
    if (!review) return;
    try {
      await deleteReview(review.id);
      await queryClient.invalidateQueries({ queryKey: MY_REVIEWS_KEY });
      toast.success(t("deleted"));
    } catch (error) {
      toast.error(errorMessage(error, common("errorGeneric")));
    }
  }

  return (
    <div className="pb-8">
      <MobileSubpageHeader title={t("title")} />
      {!accessToken ? (
        <MobileMessage
          icon={MessageSquareText}
          title={t("signInTitle")}
          message={t("signInMessage")}
          signIn
        />
      ) : query.isPending ? (
        <div className="space-y-2.5" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-[120px] animate-pulse rounded-[18px] bg-[#17171f]" />
          ))}
        </div>
      ) : query.isError ? (
        <LoadError onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <MobileMessage
          icon={MessageSquareText}
          title={t("emptyTitle")}
          message={t("emptyMessage")}
          action={{ href: "/search", label: t("findGame") }}
        />
      ) : (
        <ul className="space-y-2.5">
          {items.map((review) => (
            <li key={review.id}>
              <ReviewCard
                review={review}
                onDelete={() => {
                  setToDelete(review);
                  setConfirmOpen(true);
                }}
              />
            </li>
          ))}
        </ul>
      )}
      <ConfirmSheet
        open={confirmOpen}
        title={t("deleteTitle")}
        description={t("deleteMessage", { game: toDelete?.game?.title || t("thisGame") })}
        confirmLabel={common("delete")}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
