# Contributing

Thanks for helping. Everything Stack has two halves — the app and the agent layer — and both
must keep working with **zero accounts**.

## Setup

```bash
npm ci
npm run setup
npm run verify && npm run test:e2e
```

## Principles

1. **Zero-signup default.** A fresh clone must reach a passing `npm run verify` with no accounts
   and no keys. New providers start in a demo or accountless mode, or behind a choice.
2. **Credentials come from CLIs**, never from a human pasting keys. If no CLI can write it, use
   `npm run env:set` and document why.
3. **Verify, don't claim.** Changes to auth, database or billing need a check in
   `scripts/verify.mjs` or `e2e/`.
4. **Skills are code.** Keep `SKILL.md` under ~250 lines, put detail in `references/`, and run
   `node scripts/check-skills.mjs`. Don't commit third-party skills — add them to
   `scripts/install-skills.mjs` (only names you've confirmed exist upstream).

## Adding a provider

1. Confirm its zero-signup path (accountless mode, local emulator, or Stripe Projects).
2. Add it to `everything.config.schema.json`, `scripts/apply-config.mjs` labels, the interview
   (`references/questions.md`), the provider matrix and the relevant `es-*` skill.
3. Add its official skills to `scripts/install-skills.mjs` and MCP server to `.mcp.json`.
4. Extend verify/e2e. Update `docs/PROVIDERS.md` and `CHANGELOG.md`.

## Pull requests

Small and focused. Fill in the PR checklist. CI runs the full zero-signup setup, verify and e2e.
