import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import id from "../../messages/id.json";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? { ...acc, [path]: value } : { ...acc, ...flatten(value, path) };
  }, {});
}

/** Top-level ICU arguments such as `{name}` or `{count, plural, ...}`. */
function argumentsOf(message: string): string[] {
  const names = new Set<string>();
  let depth = 0;
  for (let i = 0; i < message.length; i += 1) {
    if (message[i] === "{") {
      if (depth === 0) {
        const match = /^\{\s*(\w+)/.exec(message.slice(i));
        if (match) names.add(match[1]);
      }
      depth += 1;
    } else if (message[i] === "}") {
      depth -= 1;
    }
  }
  return [...names].sort();
}

const english = flatten(en as Tree);
const indonesian = flatten(id as Tree);

describe("messages", () => {
  it("Indonesian translates exactly the English keys", () => {
    expect(Object.keys(indonesian).sort()).toEqual(Object.keys(english).sort());
  });

  it.each(Object.keys(english))("%s keeps its arguments and is not empty", (key) => {
    expect(indonesian[key]?.trim()).toBeTruthy();
    expect(argumentsOf(indonesian[key] ?? "")).toEqual(argumentsOf(english[key]));
  });
});
