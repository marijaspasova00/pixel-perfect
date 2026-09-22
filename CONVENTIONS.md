# Semos CRM — build conventions (read before writing pages)

Stack: TanStack Start v1 + Tailwind v4 + TanStack Query + Supabase (Lovable Cloud).
`exactOptionalPropertyTypes: true` is on — optional props must be typed `x?: T | undefined`.

## Where pages live

All app pages are files under `src/routes/_authenticated/`, e.g.
`src/routes/_authenticated/companies.index.tsx` -> `createFileRoute("/_authenticated/companies/")`
`src/routes/_authenticated/companies.$id.tsx` -> `createFileRoute("/_authenticated/companies/$id")`
Each route exports `Route` with `head()` (unique title/description/og:title/og:description/og:type/twitter:card) and `component`.
The shell (sidebar, top bar, padding, max-width) is already provided by `_authenticated/route.tsx` — pages render content fragments only, no `<main>`, no page shell.

## Data

Use TanStack Query hooks in components (NEVER route loaders — SSR has no session):
`import { useQuery } from "@tanstack/react-query"` with the query option factories in `src/lib/queries.ts`
(companiesQuery, companyQuery(id), contactsQuery(companyId?), opportunitiesQuery(companyId?), opportunityQuery(id),
projectsQuery(companyId?), projectQuery(id), consultantsQuery, skillsQuery, consultantSkillsQuery, candidatesQuery,
contractsQuery(companyId?), activitiesQuery(companyId?), tasksQuery, auditQuery, teamQuery, rolesQuery).
Add new factories to that file if needed. Mutations: `supabase.from(...)` from `@/integrations/supabase/client`,
then `queryClient.invalidateQueries`, and `toast` from `sonner` for feedback.
Company/owner names are plain text columns (not FKs to profiles). Join companies by `company_id` client-side.

## Helpers to reuse (do not re-invent)

- `src/components/app/Bits.tsx`: `PageHeader`, `StatCard`, `Card`, `Badge`, `StatusBadge`, `HealthBadge`, `Bar`, `EmptyState`, `TableSkeleton`, `Filters`, `FilterSelect`
- `src/components/app/Avatar.tsx`: `Avatar` (`size="xs" | "lg" | "xl"`)
- `src/lib/format.ts`: `money`, `compactMoney`, `num`, `initialsOf`, `relativeDate`, `shortDate`, `daysUntil`, `healthTone`, `statusTone`
- `src/hooks/useAuth.tsx`: `useAuth()` -> `{ session, user, profile, roles, loading, signOut }`
- Icons: `lucide-react`. Charts: `recharts` (use CSS vars like `var(--c1)` for series colors).

## Styling rules

NEVER hardcode colors (`text-white`, `bg-[#...]`). Use the design-system classes in `src/styles.css` plus
token utilities: `bg-background bg-surface bg-surface-2 bg-surface-3 text-ink text-ink-2 text-ink-3 text-ok text-warn
text-bad bg-ok-soft bg-warn-soft bg-bad-soft bg-accent-soft text-accent-ink border-border border-border-strong`.

Component classes: `.card` (+ `.ch` header / `.ct` title / `.cs` subtitle), `.btn` (+ `.sm .pri .gh .ico`),
`.bdg` (+ `.ok .warn .bad .acc .out`, `.dot`), `.tbl` (with `.r` right-align, `.nm` name cell),
`.av` (+ `.xs .lg .xl`, `.stack` wrapper), `.tab` (+ `.on`), `.bar > i`, `.sep`, `.vsep`, `.drop`, `.lift`, `.skel`,
`.field` (inputs/selects/textarea), `.lbl` (label text), `.kbd`, `.num`, `.mono`, `.kv`, `.display` (Sora headings).
Typical page: `<PageHeader …/>`, a stat row `grid gap-3 sm:grid-cols-2 xl:grid-cols-4`, a filter row,
tabs, then `.card` sections with `.tbl` tables. Font sizes are small and dense (12.5px body, 21-22px headings).

## Quality bar

Real data from the database only — no lorem, no fake hardcoded lists. Loading states via `TableSkeleton`,
empty states via `EmptyState`. Tables get row hover, avatars, badges. Client-side search/filter/tabs where useful.
Dark mode must work automatically (tokens only). Keep every file under ~350 lines.
