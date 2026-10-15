Add this feature to my Everything Stack app: <describe the feature and who uses it>.

How to work:
1. Read `AGENTS.md`, then the relevant skills: `es-database` (data model), `es-framework` (Next.js 16
   rules), `es-design` (tokens and copy), and the official `convex` and `clerk-nextjs-patterns` skills.
2. Replace or extend the demo `items` model with the real domain model. Every Convex function starts with
   `requireUser`/`requireAdmin` and checks ownership. Index every query.
3. Signed-in UI goes under `src/app/dashboard/`, admin-only views under `src/app/admin/`. Reuse
   `PageHeader`, `Button` and the tokens in `globals.css`. Sentence-case copy that says what happens.
4. If the feature should be paid, gate it on the subscription like `items.create` does.
5. Add a Playwright test in `e2e/` for the main flow and extend `scripts/verify.mjs` if it touches billing or auth.
6. Run `npm run verify` and `npm run test:e2e`; both must pass. Run the `convex-reviewer` skill on the diff.
7. Summarize what changed and how to try it.
