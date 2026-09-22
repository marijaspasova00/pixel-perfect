# Semos CRM — roadmap

## Done
- Lovable Cloud enabled; CRM schema + demo data migrations applied
- Design system in src/styles.css (light + dark tokens, component classes)
- Auth: email/password + Google; /auth page; _authenticated shell gate
- App shell: sidebar nav, top bar, global search (⌘K), quick create, dark mode toggle
- Dashboard at /
- Shared helpers: Bits.tsx, Avatar.tsx, queries.ts, format.ts, useAuth, useTheme
- CONVENTIONS.md for consistent page building

## In progress (parallel)
- Clients: /companies, /companies/$id, /contacts
- Sales: /opportunities, /opportunities/$id, /pipeline, /client-health
- Delivery: /projects, /projects/$id, /contracts
- People & admin: /workspace, /recruitment, /skills, /management, /admin

## Remaining
- Verify every route renders signed-in (Playwright) and fix typecheck errors
- Per-route head metadata check
