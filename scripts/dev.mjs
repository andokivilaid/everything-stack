#!/usr/bin/env node
// Runs Convex and Next.js together. Convex gets TZ unset (its local backend requires UTC).
import { existsSync } from "node:fs";
import { readEnv } from "./lib/env-file.mjs";
import { c, convexEnv, fail, startBackground } from "./lib/run.mjs";

const env = readEnv(".env.local");
if (!existsSync(".env.local") || !env.NEXT_PUBLIC_CONVEX_URL || !env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  fail("Not set up yet. Run `npm run setup` first.");
  process.exit(1);
}

const children = [
  startBackground("convex", "npx", ["convex", "dev"], { env: convexEnv(), color: c.cyan }),
  startBackground("next", "npx", ["next", "dev"], { color: c.green }),
];

if (process.argv.includes("--stripe") && env.BILLING_MODE === "stripe") {
  children.push(
    startBackground("stripe", "stripe", ["listen", "--forward-to", "localhost:3000/api/webhooks/stripe"], {
      color: c.yellow,
    }),
  );
}

const stop = () => {
  for (const child of children) child.kill("SIGINT");
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
for (const child of children) child.on("exit", (code) => code && code !== 0 && stop());
