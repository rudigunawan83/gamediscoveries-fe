import { act, cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { LanguageProvider } from "@/features/language/LanguageProvider";
import { LanguageSection } from "@/features/language/LanguageSection";
import type { LanguageMode, Locale } from "@/i18n/config";
import { renderWithIntl } from "./helpers/intl";

const refresh = vi.fn();
const updatePreferredLanguage = vi.fn();
const router = { refresh, replace: vi.fn(), push: vi.fn(), back: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/features/language/api/preferencesApi", () => ({
  updatePreferredLanguage: (mode: LanguageMode) => updatePreferredLanguage(mode),
}));

const user = (preferredLanguage?: LanguageMode | null): AuthUser => ({
  id: "u1",
  email: "rudi@example.com",
  displayName: "Rudi",
  roles: [],
  preferredLanguage,
});

function renderSettings(mode: LanguageMode = "SYSTEM", locale: Locale = "en") {
  return renderWithIntl(
    <LanguageProvider mode={mode}>
      <LanguageSection />
    </LanguageProvider>,
    locale,
  );
}

function clearCookie() {
  document.cookie = "gd-locale=; path=/; max-age=0";
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    refresh.mockReset();
    updatePreferredLanguage.mockReset();
    updatePreferredLanguage.mockImplementation(async (mode: LanguageMode) => user(mode));
    window.localStorage.clear();
    clearCookie();
    useAuthStore.setState({ accessToken: null, user: null });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows native names and the detected language in system mode", () => {
    renderSettings("SYSTEM", "id");

    expect(screen.getByText("Bahasa")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Default sistem/ })).toBeChecked();
    expect(screen.getByText("Saat ini Bahasa Indonesia")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "English" })).toBeInTheDocument();
  });

  it("guests switch locally and the choice waits for sign-in", async () => {
    renderSettings();

    await userEvent.click(screen.getByRole("radio", { name: "Bahasa Indonesia" }));

    expect(document.cookie).toContain("gd-locale=id");
    expect(refresh).toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Bahasa Indonesia" })).toBeChecked();
    expect(updatePreferredLanguage).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("gd-locale-needs-sync")).toBe("1");
  });

  it("a choice made while signed out is uploaded on sign-in", async () => {
    renderSettings();
    await userEvent.click(screen.getByRole("radio", { name: "Bahasa Indonesia" }));

    act(() => useAuthStore.setState({ accessToken: "token", user: user("en") }));

    await waitFor(() => expect(updatePreferredLanguage).toHaveBeenCalledWith("id"));
    await waitFor(() => expect(useAuthStore.getState().user?.preferredLanguage).toBe("id"));
    expect(window.localStorage.getItem("gd-locale-needs-sync")).toBeNull();
    expect(document.cookie).toContain("gd-locale=id");
  });

  it("applies the account language when nothing is pending", async () => {
    useAuthStore.setState({ accessToken: "token", user: user("id") });
    renderSettings();

    await waitFor(() => expect(document.cookie).toContain("gd-locale=id"));
    expect(refresh).toHaveBeenCalled();
    expect(updatePreferredLanguage).not.toHaveBeenCalled();
  });

  it("uploads changes made while signed in and retries after a failure", async () => {
    useAuthStore.setState({ accessToken: "token", user: user("SYSTEM") });
    updatePreferredLanguage.mockRejectedValueOnce(new Error("offline"));
    renderSettings();

    await userEvent.click(screen.getByRole("radio", { name: "English" }));
    await waitFor(() => expect(updatePreferredLanguage).toHaveBeenCalledWith("en"));
    expect(window.localStorage.getItem("gd-locale-needs-sync")).toBe("1");

    act(() => useAuthStore.setState({ user: { ...user("SYSTEM"), id: "u1-refreshed" } }));

    await waitFor(() => expect(updatePreferredLanguage).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(window.localStorage.getItem("gd-locale-needs-sync")).toBeNull());
  });

  it("an older API without the field keeps the local language", () => {
    document.cookie = "gd-locale=en; path=/";
    useAuthStore.setState({ accessToken: "token", user: user(undefined) });
    renderSettings("en");

    expect(refresh).not.toHaveBeenCalled();
    expect(updatePreferredLanguage).not.toHaveBeenCalled();
  });
});
