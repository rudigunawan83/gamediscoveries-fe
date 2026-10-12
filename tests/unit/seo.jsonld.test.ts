import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/components/seo/JsonLd";

describe("serializeJsonLd", () => {
  it("cannot close the script tag from feed-supplied text", () => {
    const html = serializeJsonLd({ description: "</script><script>alert(1)</script>" });
    expect(html).not.toContain("</script>");
    expect(JSON.parse(html)).toEqual({ description: "</script><script>alert(1)</script>" });
  });
});
