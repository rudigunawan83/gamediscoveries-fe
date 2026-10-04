import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
} from "@/features/auth/api/authApi";

describe("auth API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("maps login response tokens", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          success: true,
          data: {
            accessToken: "token-123",
            user: {
              id: "u1",
              email: "player@example.com",
              displayName: "Player One",
            },
          },
          error: null,
          meta: null,
        }),
      }),
    );

    const result = await loginRequest({
      email: "player@example.com",
      password: "password123",
    });

    expect(result.accessToken).toBe("token-123");
    expect(result.user?.email).toBe("player@example.com");
  });

  it("maps current user response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          success: true,
          data: {
            id: "u1",
            email: "player@example.com",
            roles: ["Player"],
          },
          error: null,
          meta: null,
        }),
      }),
    );

    const user = await getCurrentUserRequest();
    expect(user.id).toBe("u1");
    expect(user.roles).toEqual(["Player"]);
  });

  it("treats logout 401 as success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          title: "Unauthorized",
          detail: "Expired",
          status: 401,
        }),
      }),
    );

    await expect(logoutRequest()).resolves.toBeUndefined();
  });
});
