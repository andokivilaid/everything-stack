@AGENTS.md

## Claude Code specifics

- `/everything [product description]` runs the full setup via the `everything-stack` skill.
- Project MCP servers are in `.mcp.json`. `convex`, `next-devtools` and `playwright` are enabled by
  default; the hosted ones (`clerk`, `stripe`, `polar-sandbox`, `posthog`, `vercel`,
  `cloudflare-docs`) authenticate in the browser on first use — enable them with `/mcp` when a
  skill needs them.
- Use AskUserQuestion for the interview (two calls of up to four questions).
