import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(path.join(root, "node_modules/.pnpm/node_modules/sharp/package.json"));
const sharp = require("sharp");

const src = path.join(root, "public", "favicon.png");
const iconsDir = path.join(root, "public", "icons");
const appIcon = path.join(root, "src", "app", "icon.png");

await fs.mkdir(iconsDir, { recursive: true });
await fs.copyFile(src, appIcon);

for (const size of [16, 32, 48, 96, 192, 512]) {
  await sharp(src)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(path.join(iconsDir, `icon-${size}.png`));
}

await sharp(src)
  .resize(180, 180, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png()
  .toFile(path.join(iconsDir, "apple-touch-icon.png"));

console.log("favicon icons generated");
