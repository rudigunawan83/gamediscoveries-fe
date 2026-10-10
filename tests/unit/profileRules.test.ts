import { describe, expect, it } from "vitest";
import { profileFieldErrors, profileUnchanged } from "@/features/settings/profileRules";

const current = { displayName: "Rudi", username: "rudi_gamer" };

describe("profileRules", () => {
  it("treats casing and surrounding spaces as unchanged", () => {
    expect(profileUnchanged({ displayName: " Rudi ", username: "RUDI_GAMER" }, current)).toBe(true);
    expect(profileFieldErrors({ displayName: " Rudi ", username: "RUDI_GAMER" }, current)).toEqual([]);
  });

  it("rejects a new display name or username that breaks the rules", () => {
    expect(
      profileFieldErrors({ displayName: "A", username: "Rudi Gamer" }, current),
    ).toEqual(["displayName", "username"]);
  });

  it("accepts a valid change and keeps a legacy username when only the name changes", () => {
    expect(profileFieldErrors({ displayName: "Rudi Baru", username: "rudi_gamer" }, current)).toEqual([]);
    expect(profileFieldErrors({ displayName: "Rudi", username: "rudi-baru" }, current)).toEqual([]);
  });
});
