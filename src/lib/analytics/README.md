# Web Analytics Client (Phase 01)

`analytics.track(...)` queues events and sends them to:

- `POST /api/v1/events` (critical/immediate)
- `POST /api/v1/events/batch` (batched)

Persistent identity:

- `anonymousId` → `localStorage` (`gd_anonymous_id`)
- `sessionId` → `sessionStorage` (`gd_analytics_session_id`)

Flutter should call the same API contract documented in:

`gamediscoveries-api/docs/ANALYTICS_EVENTS.md`
