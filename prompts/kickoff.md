Set up this Everything Stack template as my product.

Load and follow the `everything-stack` skill (`.claude/skills/everything-stack/SKILL.md` or
`.agents/skills/everything-stack/SKILL.md`) exactly:

1. Interview me in one round with the defaults shown (I may answer "defaults").
2. Write `everything.config.json`, run `npm run config:apply`, write real copy for my product in
   `src/config/site.ts`.
3. Run `npm run setup`, then the component skills for anything non-default.
4. Run `npm run verify` and `npm run test:e2e` until both pass.
5. Finish with the report from `references/report.md`.

Rules: don't ask me to copy keys or edit env files; never print secret values; only stop for
browser approvals a CLI asks for, and tell me exactly what to click.

About my product (optional): <describe it here, or leave blank>
