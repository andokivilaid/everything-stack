# Skills, MCP servers and agents

## Everything Stack skills (committed)

| Skill | Job |
|---|---|
| `everything-stack` | Orchestrator: interview → config → setup → component skills → verify → report |
| `es-provision` | Stripe Projects: init, add services, sync credentials |
| `es-database` | Convex local/cloud, data model, porting to SQL databases |
| `es-auth` | Clerk accountless, claiming, B2B orgs, production, porting |
| `es-billing` | Demo, Stripe test mode, Polar sandbox, webhooks, going live |
| `es-analytics` | First-party analytics, PostHog, Mixpanel/Amplitude, custom events |
| `es-deploy` | Production on Vercel or Cloudflare |
| `es-framework` | Next.js 16 rules, porting to TanStack Start / React Router / Vite |
| `es-design` | Re-theme tokens and copy, contrast, screenshots |
| `es-verify` | Verification commands and a failure → fix table |

They live in `.claude/skills/` and are symlinked into `.agents/skills/` for Codex, Cursor and
others. (On Windows without symlink support, copy the folders instead.)

## Official vendor skills (installed, pinned)

`npm run skills` (also run by `npm run setup`) installs official skills from Stripe, Clerk,
Convex, Polar, Vercel, Cloudflare and Anthropic for the stack in `everything.config.json`.
`skills-lock.json` records sources and content hashes. They aren't committed because their
licenses vary. Refresh with `npm run skills`; install every provider's with `npm run skills -- --all`.

## MCP servers (`.mcp.json`)

| Server | Auth | Used for |
|---|---|---|
| `convex` | none (local) | Inspect tables, run functions, read logs |
| `next-devtools` | none | Next.js 16 docs, runtime errors, route info |
| `playwright` | none | Drive a browser for visual checks |
| `clerk` | browser OAuth | Users, orgs, instance config |
| `stripe` | browser OAuth | Products, customers, payments |
| `polar-sandbox` | browser OAuth | Polar org, products |
| `posthog` | browser OAuth | Dashboards, insights |
| `vercel` | browser OAuth | Projects, deployments, logs |
| `cloudflare-docs` | none | Workers / OpenNext docs |

Claude Code enables the three local servers by default (`.claude/settings.json`); enable hosted
ones with `/mcp` when a skill needs them.

## Using other agents

- **Codex** reads `AGENTS.md` and `.agents/skills/`. Add MCP servers from `.mcp.json` to
  `~/.codex/config.toml` if you want them.
- **Cursor** reads `AGENTS.md`; copy `.mcp.json` entries to `.cursor/mcp.json`.
- Any agent: paste [`prompts/kickoff.md`](../prompts/kickoff.md).
