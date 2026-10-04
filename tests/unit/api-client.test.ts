import { describe, expect, it } from "vitest";
import { normalizeApiError } from "@/lib/api/client";

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
