export function decodeHtmlText(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const withBreaks = value.replace(/<\s*br\s*\/?\s*>/gi, "\n");
  const withoutTags = withBreaks.replace(/<[^>]+>/g, "");

  if (typeof document !== "undefined") {
    const el = document.createElement("textarea");
    el.innerHTML = withoutTags;
    return el.value.trim();
  }

  return withoutTags
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
