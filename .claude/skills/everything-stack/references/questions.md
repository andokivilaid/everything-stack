# The interview

One round. Show defaults. Accept "defaults" / "just go" for everything.

## Round A (AskUserQuestion call 1)

**1. Product** — free text (use "Other"):
"What are you building? One line: name and what it does for whom."
- Default: keep "Everything Stack" placeholder copy.
- Writes: `product.name`, `product.tagline`, `product.description`, `product.audience`.

**2. Hosting** — where it will be deployed later (local dev works regardless)
- **Vercel (Recommended)** — `stripe projects add vercel/project`
- Cloudflare — `stripe projects add cloudflare/worker` (Next.js via OpenNext; see es-deploy)
- Decide later — `hosting.provider: "none"`
- (Netlify, Railway, Render are also in Stripe Projects — accept via "Other")

**3. Framework**
- **Next.js (Recommended)** — the reference app; zero porting
- TanStack Start — port required (Clerk + Convex both support it)
- React Router — port required
- Vite SPA — port required; Clerk has no accountless mode for plain React → needs a Clerk account

**4. Database**
- **Convex — local, no account (Recommended)** — `database: {provider: "convex", mode: "local"}`
- Convex — cloud (needs `npx convex login`, one browser approval) — `mode: "cloud"`
- Supabase / Neon / Turso via Stripe Projects — port required (see es-database)

## Round B (AskUserQuestion call 2)

**5. Auth**
- **Clerk — accountless dev app (Recommended)** — B2C template
- Clerk — B2B (organizations, roles) — `clerkTemplate: "b2b-saas"` + es-auth orgs guide
- WorkOS / Auth0 via Stripe Projects — port required

**6. Billing**
- **Stripe (Recommended)** — test mode via your Stripe CLI login; demo mode until then
- Polar — sandbox; one browser OAuth via the Polar sandbox MCP
- Demo only — simulated checkout, no provider

**7. Analytics** (multi-select)
- **First-party (always on, in Convex)**
- **PostHog (Recommended)** — `stripe projects add posthog/analytics`
- Mixpanel / Amplitude — via Stripe Projects

**8. Admin emails** — free text, optional. Comma-separated emails that get the admin role
(the first account created is always admin). Writes `adminEmails`.

## Mapping rules

- Unanswered → default.
- "Decide later" for hosting → skip es-deploy entirely; mention it in the report.
- If the user picks a choice that requires porting, confirm once in plain words
  ("That swaps the database layer — I'll port the Convex functions to Supabase. Proceed?")
  because it is substantially more work and changes the zero-signup guarantee.
