import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient, normalizeApiError } from "@/lib/api/client";

describe("apiClient request bodies", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubFetch() {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: {}, error: null, meta: null }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("sends FormData as-is so the browser sets the multipart boundary", async () => {
    const fetchMock = stubFetch();
    const body = new FormData();
    body.append("file", new Blob(["x"], { type: "image/png" }), "a.png");

    await apiClient.post("/api/v1/users/me/avatar", body);

    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(init.body).toBe(body);
    expect(new Headers(init.headers).has("Content-Type")).toBe(false);
  });

  it("serializes plain objects as JSON", async () => {
    const fetchMock = stubFetch();

    await apiClient.post("/api/v1/users/me/favorites", { gameId: "g1" });

    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(init.body).toBe(JSON.stringify({ gameId: "g1" }));
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });
});

describe("normalizeApiError", () => {
  it("normalizes wrapped API error payloads", () => {
    const error = normalizeApiError(404, {
      success: false,
      data: null,
      error: {
        title: "Game Not Found",
        detail: "Missing game",
        status: 404,
      },
      meta: null,
    });

    expect(error.status).toBe(404);
    expect(error.message).toBe("Missing game");
    expect(error.payload?.title).toBe("Game Not Found");
  });

  it("normalizes RFC problem details", () => {
    const error = normalizeApiError(500, {
      title: "Internal Server Error",
      detail: "Boom",
      status: 500,
    });

    expect(error.message).toBe("Boom");
    expect(error.status).toBe(500);
  });
});
