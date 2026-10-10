const USERNAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ProfileField = "displayName" | "username";

export interface ProfileDraft {
  displayName: string;
  username: string;
}

export interface ProfileBaseline {
  displayName?: string | null;
  username?: string | null;
}

function normalized(draft: ProfileDraft) {
  return {
    displayName: draft.displayName.trim(),
    username: draft.username.trim().toLowerCase(),
  };
}

function baseline(current: ProfileBaseline) {
  return {
    displayName: current.displayName?.trim() ?? "",
    username: current.username?.trim().toLowerCase() ?? "",
  };
}

export function profileUnchanged(draft: ProfileDraft, current: ProfileBaseline) {
  const next = normalized(draft);
  const saved = baseline(current);
  return next.displayName === saved.displayName && next.username === saved.username;
}

/** Fields whose new value fails the same rules as `PUT /api/v1/users/me/profile`. */
export function profileFieldErrors(draft: ProfileDraft, current: ProfileBaseline): ProfileField[] {
  const next = normalized(draft);
  const saved = baseline(current);
  const errors: ProfileField[] = [];
  if (
    next.displayName !== saved.displayName &&
    (next.displayName.length < 2 ||
      next.displayName.length > 40 ||
      /[\u0000-\u001F\u007F]/.test(next.displayName))
  ) {
    errors.push("displayName");
  }
  if (
    next.username !== saved.username &&
    (next.username.length < 3 || next.username.length > 30 || !USERNAME_PATTERN.test(next.username))
  ) {
    errors.push("username");
  }
  return errors;
}
