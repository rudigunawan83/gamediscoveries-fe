import { spawnSync } from "node:child_process";

/**
 * Production builds must not pick up local `.env.local` values
 * (e.g. http://localhost:5080) for NEXT_PUBLIC_* URLs.
 */
const env = {
  ...process.env,
  NEXT_PUBLIC_API_URL: "https://api.gamediscoveries.com",
  NEXT_PUBLIC_APP_URL: "https://www.gamediscoveries.com",
  NEXT_PUBLIC_USE_MOCK: "false",
  NEXT_TELEMETRY_DISABLED: "1",
};

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  env,
  shell: true,
});

process.exit(result.status ?? 1);
