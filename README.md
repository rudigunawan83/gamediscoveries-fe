# GameDiscoveries Frontend

**GameDiscoveries — Discover Your Next Game**

Frontend foundation for [GameDiscoveries.com](https://gamediscoveries.com), a global game discovery platform.

## Project Overview

This repository implements **Prompt 01**: foundation, design system, and application architecture.

Out of scope for this phase:

- Developer / Advertiser / Admin portals
- Full authentication flows
- Recommendation engine UI
- GameMonetize player
- Advanced AI features

## Architecture

```text
Next.js 16 App Router
  ├── Server Components (default)
  ├── Client Components (interactive only)
  ├── Feature-oriented modules
  ├── TanStack Query (server state)
  ├── Zustand (UI/client state)
  └── API client → GameDiscoveries API
```

## Technology Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| Validation | Zod |
| Forms | React Hook Form |
| Icons | Lucide React |
| Unit tests | Vitest + Testing Library |
| E2E | Playwright |
| Package manager | pnpm |

## Project Structure

```text
src/
├── app/                 # App Router routes
├── components/          # UI, layout, navigation, game, discovery, search
├── features/            # Feature modules (games, discovery, search, ...)
├── lib/                 # API, SEO, analytics, utils
├── providers/           # Query + app providers
├── stores/              # Zustand stores
├── types/               # Shared domain types
└── config/              # Environment validation
```

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5080
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional:

```bash
NEXT_PUBLIC_USE_MOCK=true
```

Mock data is used by default until the API catalog is fully connected.

## Scripts

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm start
```

## Testing

- Unit: `tests/unit` (Vitest)
- E2E: `tests/e2e` (Playwright)

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

## Docker

```bash
docker build -t gamediscoveries-fe .
docker run -p 3000:3000 gamediscoveries-fe
```

The image uses Next.js `output: "standalone"`.

## Design System

Dark-first gaming tokens live in `src/app/globals.css`:

- `--background`, `--foreground`
- `--card`, `--primary`, `--secondary`
- `--muted`, `--accent`, `--border`, `--destructive`

Reusable primitives are under `src/components/ui` (shadcn/ui).

## API Integration

Central client: `src/lib/api/client.ts`

Feature access path:

```text
Component → Feature Hook → API Function → API Client → GameDiscoveries API
```

Response contract:

```ts
ApiResponse<T> = {
  success: boolean
  data: T
  error: ApiError | null
  meta: ApiMeta | null
}
```

## Localization (en, id)

- [next-intl](https://next-intl.dev) without i18n routing: URLs have no locale prefix, so existing and indexed URLs stay unchanged.
- Messages live in `messages/en.json` (source) and `messages/id.json`; keys are typed through `src/global.d.ts`.
- `src/i18n/request.ts` resolves the locale per request: cookie `gd-locale` (`SYSTEM` | `en` | `id`) wins when explicit, otherwise `Accept-Language`, falling back to English. `<html lang>` follows the resolved locale.
- Account Settings has the language selector (`src/features/language`). Signed-in choices are saved with `PUT /api/v1/users/me/preferences`; a choice made while signed out (or a failed upload) is uploaded on the next sign-in, otherwise the account language is applied.
- Not translated: game titles, descriptions, tags and category names from the API, server-provided recommendation shelf titles, release notes, usernames, user-generated content, brand names, game content inside the player iframe, and admin pages (`/admin/**`, marked `lang="en"`).
- `tests/unit/messages.test.ts` checks that both files have the same keys and ICU arguments.

## PWA + Performance Budgets

GameDiscoveries ships as an installable PWA (`manifest.webmanifest` + `/sw.js`) on top of the existing Next.js Server Components architecture.

Practical budgets (mobile mid-tier, 4G):

| Metric | Target |
| --- | --- |
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| Initial JS (critical route) | keep lean; prefer Server Components |
| Hero / LCP image | responsive, prioritized only above the fold |
| Fonts | Montserrat subset via `next/font` |
| Third-party scripts | deferred / non-blocking |

Cache strategy (service worker `gd-v1`):

- Static (`/_next/static`, icons): Cache First
- Same-origin images: Stale While Revalidate
- Navigations: Network First → `/offline` fallback
- Authenticated / private routes: never intercepted for shared caching

## Deployment

1. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL`
2. Serve over HTTPS (required for service worker / installability)
3. Run `pnpm build`
4. Serve with `pnpm start` or the standalone Docker image

Recommended branch model:

```text
main
develop
feature/*
fix/*
refactor/*
```

Commit style: Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).

## Git Workflow Notes

This foundation is ready for:

```text
feat: initialize GameDiscoveries frontend
feat: add gaming design system
feat: add homepage foundation
feat: add API client
```
