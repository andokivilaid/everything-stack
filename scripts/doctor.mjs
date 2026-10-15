#!/usr/bin/env node
// Read-only health check of the local toolchain and configuration. Never prints secret values.
import { existsSync } from "node:fs";
import { clerkIssuerFromPublishableKey, readEnv } from "./lib/env-file.mjs";
import { c, fail, has, ok, run, step, warn } from "./lib/run.mjs";

const env = readEnv(".env.local");
let problems = 0;

/** level "error" counts as a problem; "warn" is advisory. */
function check(condition, good, badMessage, level = "error") {
  if (condition) return ok(good);
  if (level === "warn") return warn(badMessage);
  fail(badMessage);
  problems++;
}

step("Toolchain");
const [major, minor] = process.versions.node.split(".").map(Number);
check(
  major > 20 || (major === 20 && minor >= 9),
  `Node ${process.versions.node}`,
  `Node ${process.versions.node} (need 20.9+)`,
);
check(existsSync("node_modules"), "Dependencies installed", "Run `npm install`");
const stripe = has("stripe");
check(
  stripe,
  "Stripe CLI installed",
  "Stripe CLI missing — needed for Stripe Projects and real Stripe billing (brew install stripe/stripe-cli/stripe)",
  "warn",
);
if (stripe) {
  const plugins = run("stripe", ["plugin", "list"], { capture: true, allowFail: true }).stdout ?? "";
  check(
    plugins.includes("projects"),
    "Stripe Projects plugin installed",
    "Run `stripe plugin install projects`",
    "warn",
  );
}
if (process.env.TZ) {
  warn(`TZ=${process.env.TZ} is set — fine: scripts unset it for Convex's local backend, which requires UTC`);
} else {
  ok("TZ unset");
}

step("Configuration (.env.local)");
const required = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "Clerk publishable key",
  CLERK_SECRET_KEY: "Clerk secret key",
  NEXT_PUBLIC_CONVEX_URL: "Convex URL",
  CONVEX_SERVER_SECRET: "Server secret",
};
for (const [key, label] of Object.entries(required)) {
  check(Boolean(env[key]), label, `${label} missing (${key}) — run \`npm run setup\``);
}
const issuer = clerkIssuerFromPublishableKey(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
if (issuer) ok(`Clerk issuer ${c.dim(issuer)}`);
const extras = [
  env.STRIPE_SECRET_KEY && "Stripe key present",
  env.POLAR_ACCESS_TOKEN && "Polar token present",
]
  .filter(Boolean)
  .join(" · ");
console.log(c.dim(`  billing mode: ${env.BILLING_MODE ?? "demo"}${extras ? ` · ${extras}` : ""}`));
if (existsSync(".clerk/keyless.json")) {
  warn("Clerk app is unclaimed (accountless) — claim it with `npx clerk auth login` before production");
}
check(
  existsSync(".projects/state.json"),
  "Stripe Projects initialised",
  "Stripe Projects not initialised — the everything-stack skill does this when provisioning hosting/analytics",
  "warn",
);

step("Agent tooling");
check(
  existsSync(".claude/skills/everything-stack/SKILL.md"),
  "Everything Stack skills present",
  "Missing .claude/skills/everything-stack",
);
check(
  existsSync(".claude/skills/stripe-projects/SKILL.md"),
  "Official vendor skills installed",
  "Vendor skills not installed — run `npm run skills`",
  "warn",
);
check(existsSync(".mcp.json"), ".mcp.json present", "Missing .mcp.json");

console.log(problems ? c.red(`\n${problems} problem(s).`) : c.green("\nAll good."));
process.exit(problems ? 1 : 0);
