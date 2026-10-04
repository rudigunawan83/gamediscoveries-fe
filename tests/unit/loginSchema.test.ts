import { describe, expect, it } from "vitest";
import { loginSchema } from "@/features/auth/schemas/loginSchema";

describe("loginSchema", () => {
  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "player@gamediscoveries.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid credentials format", () => {
    const result = loginSchema.safeParse({
      email: "player@gamediscoveries.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });
});
