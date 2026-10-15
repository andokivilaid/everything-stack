#!/usr/bin/env node
/**
 * Installs the official vendor agent skills that match everything.config.json
 * into .claude/skills (Claude Code) and .agents/skills (Codex, Cursor, others).
 *
 *   npm run skills            # install/refresh for the configured stack
 *   npm run skills -- --all   # install every supported provider's skills
 *
 * Vendor skills are not committed (their licenses vary); skills-lock.json
 * records exactly what was installed, with content hashes.
 */
import { existsSync, readFileSync } from "node:fs";
import { c, ok, run, step, warn } from "./lib/run.mjs";

const ALL = process.argv.includes("--all");
const config = existsSync("everything.config.json")
  ? JSON.parse(readFileSync("everything.config.json", "utf8"))
  : {};

/** provider → [repo, skills[]]. Only skills verified to exist upstream. */
const CATALOG = {
  core: [
    ["stripe/ai", ["stripe-projects"]],
    ["anthropics/skills", ["frontend-design", "webapp-testing"]],
    [
      "vercel-labs/agent-skills",
      ["vercel-react-best-practices", "web-design-guidelines", "vercel-composition-patterns"],
    ],
  ],
  nextjs: [],
  convex: [
    [
      "get-convex/agent-skills",
      ["convex", "convex-quickstart", "convex-env", "convex-reviewer", "convex-launch-readiness"],
    ],
  ],
  clerk: [
    [
      "clerk/skills",
      ["clerk-setup", "clerk-nextjs-patterns", "clerk-cli", "clerk-testing", "clerk-webhooks", "clerk-orgs"],
    ],
  ],
  stripe: [["stripe/ai", ["stripe-best-practices"]]],
  polar: [["polarsource/skills", ["setup-polar", "polar-integration", "polar-testing"]]],
  // PostHog's Next.js skill is nested and not discoverable by the skills CLI;
  // the es-analytics skill and the PostHog MCP server (.mcp.json) cover it.
  posthog: [],
  vercel: [["vercel-labs/agent-skills", ["deploy-to-vercel", "vercel-cli-with-tokens"]]],
  cloudflare: [["cloudflare/skills", ["nextjs-on-cloudflare", "wrangler", "workers-best-practices"]]],
};

function selected() {
  if (ALL) return Object.keys(CATALOG);
  const keys = new Set(["core"]);
  keys.add(config.framework?.provider ?? "nextjs");
  keys.add(config.database?.provider ?? "convex");
  keys.add(config.auth?.provider ?? "clerk");
  const billing = config.billing?.provider ?? "stripe";
  keys.add(billing);
  // Keep the other billing provider's skills too, so switching later is one prompt away.
  keys.add(billing === "polar" ? "stripe" : "polar");
  for (const a of config.analytics?.providers ?? ["first-party", "posthog"]) keys.add(a);
  keys.add(config.hosting?.provider ?? "vercel");
  return [...keys].filter((k) => CATALOG[k]);
}

function main() {
  step("Installing official agent skills");
  const byRepo = new Map();
  for (const key of selected()) {
    for (const [repo, skills] of CATALOG[key]) {
      const set = byRepo.get(repo) ?? new Set();
      for (const s of skills) set.add(s);
      byRepo.set(repo, set);
    }
  }
  let failed = 0;
  for (const [repo, skills] of byRepo) {
    const list = [...skills];
    const res = run(
      "npx",
      ["-y", "skills@latest", "add", repo, "-s", ...list, "-a", "claude-code", "codex", "-y", "--copy"],
      { capture: true, allowFail: true, timeout: 240_000 },
    );
    if (res.status === 0) ok(`${repo}: ${list.join(", ")}`);
    else {
      failed++;
      warn(`${repo}: install failed — run \`npx skills add ${repo}\` manually`);
    }
  }
  console.log(
    failed
      ? c.yellow(`\n${failed} repo(s) failed. Everything Stack's own skills still work without them.`)
      : c.green("\nOfficial skills installed to .claude/skills and .agents/skills."),
  );
}

main();
