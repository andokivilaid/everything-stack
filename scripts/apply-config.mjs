#!/usr/bin/env node
/**
 * Applies everything.config.json to the app source:
 *   - src/config/stack.ts   (the strata on the landing page)
 *   - product name, tagline and description in src/config/site.ts
 *   - plan currency in src/config/site.ts
 *
 *   node scripts/apply-config.mjs [--check]
 *
 * Deterministic and idempotent, so the agent never hand-edits these values.
 * --check exits 1 if the source is out of date with the config (used in CI).
 */
import { readFileSync, writeFileSync } from "node:fs";

const CHECK = process.argv.includes("--check");
const cfg = JSON.parse(readFileSync("everything.config.json", "utf8"));

const LABELS = {
  hosting: {
    vercel: "Vercel",
    cloudflare: "Cloudflare",
    netlify: "Netlify",
    railway: "Railway",
    render: "Render",
    none: "Local only",
  },
  framework: {
    nextjs: "Next.js",
    "tanstack-start": "TanStack Start",
    "react-router": "React Router",
    "vite-spa": "Vite + React",
  },
  database: {
    convex: "Convex",
    supabase: "Supabase",
    neon: "Neon",
    turso: "Turso",
    prisma: "Prisma Postgres",
  },
  auth: { clerk: "Clerk", workos: "WorkOS", auth0: "Auth0", supabase: "Supabase Auth" },
  billing: { stripe: "Stripe", polar: "Polar", demo: "Demo billing", none: "None" },
  analytics: {
    "first-party": "First-party",
    posthog: "PostHog",
    mixpanel: "Mixpanel",
    amplitude: "Amplitude",
  },
};

const label = (kind, key) => LABELS[kind]?.[key] ?? key;
const analytics = (cfg.analytics?.providers ?? ["first-party"]).map((p) => label("analytics", p)).join(" + ");

const layers = [
  ["Hosting", label("hosting", cfg.hosting?.provider ?? "vercel")],
  ["Framework", label("framework", cfg.framework?.provider ?? "nextjs")],
  ["Database", label("database", cfg.database?.provider ?? "convex")],
  ["Auth", label("auth", cfg.auth?.provider ?? "clerk")],
  ["Billing", label("billing", cfg.billing?.provider ?? "stripe")],
  ["Analytics", analytics],
];

const stackTs = `/**
 * The stack this app was generated with. Written by scripts/apply-config.mjs
 * from everything.config.json — bottom layer first. Do not edit by hand.
 */
export const stack = [
${layers.map(([l, p]) => `  { layer: ${JSON.stringify(l)}, provider: ${JSON.stringify(p)} },`).join("\n")}
] as const;
`;

let site = readFileSync("src/config/site.ts", "utf8");
const setField = (field, value) => {
  if (value === undefined) return;
  const re = new RegExp(`(\\n  ${field}:\\s*\\n?\\s*)("(?:[^"\\\\]|\\\\.)*")`);
  if (!re.test(site)) throw new Error(`site.ts: could not find field "${field}"`);
  site = site.replace(re, `$1${JSON.stringify(value)}`);
};
setField("name", cfg.product?.name);
setField("tagline", cfg.product?.tagline);
setField("description", cfg.product?.description);
if (cfg.billing?.currency)
  site = site.replace(/currency: "(usd|eur)"/g, `currency: "${cfg.billing.currency}"`);

const current = {
  stack: readFileSync("src/config/stack.ts", "utf8"),
  site: readFileSync("src/config/site.ts", "utf8"),
};
const outdated = current.stack !== stackTs || current.site !== site;

if (CHECK) {
  if (outdated) {
    console.error(
      "src/config is out of date with everything.config.json — run `node scripts/apply-config.mjs`.",
    );
    process.exit(1);
  }
  console.log("src/config matches everything.config.json");
} else {
  writeFileSync("src/config/stack.ts", stackTs);
  writeFileSync("src/config/site.ts", site);
  console.log(outdated ? "Applied everything.config.json to src/config." : "src/config already up to date.");
}
