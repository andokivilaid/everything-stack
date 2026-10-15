#!/usr/bin/env node
/**
 * One-command, zero-signup local setup.
 *
 *   npm run setup                 # defaults from everything.config.json
 *   npm run setup -- --cloud      # use your logged-in Convex account instead of a local backend
 *   npm run setup -- --no-skills  # skip installing official vendor agent skills
 *
 * What it does (each step is skipped when already done — safe to re-run):
 *   1. Installs dependencies, applies everything.config.json, installs official vendor skills.
 *   2. Auth: creates an accountless Clerk dev app (`clerk init --accountless`).
 *   3. Billing: picks the Stripe test key from a logged-in Stripe CLI, else demo mode.
 *   4. Database: configures a Convex deployment (anonymous local backend by default).
 *   5. Wires Clerk → Convex (issuer + secret on Convex), a server secret for billing sync,
 *      then pushes the Convex functions with auth enabled.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { clerkIssuerFromPublishableKey, readEnv, upsertEnv } from "./lib/env-file.mjs";
import { c, convexEnv, fail, has, ok, run, step, warn } from "./lib/run.mjs";

const args = new Set(process.argv.slice(2));
const CLOUD = args.has("--cloud");
const ENV = ".env.local";

const config = existsSync("everything.config.json")
  ? JSON.parse(readFileSync("everything.config.json", "utf8"))
  : {};

function npx(pkgArgs, opts) {
  return run("npx", ["-y", ...pkgArgs], opts);
}

function convex(cmdArgs, opts = {}) {
  return run("npx", ["convex", ...cmdArgs], { ...opts, env: convexEnv(opts.env) });
}

async function main() {
  console.log(c.bold("\nEverything Stack — setup\n"));

  // 0. Node version
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 20 || (major === 20 && minor < 9)) {
    fail(`Node ${process.versions.node} is too old. Use Node 20.9+ (22 LTS recommended).`);
    process.exit(1);
  }

  // 1. Dependencies
  step("Dependencies");
  if (!existsSync("node_modules")) run("npm", ["install"]);
  ok("node_modules present");
  run("node", ["scripts/apply-config.mjs"]);

  // 1b. Official vendor agent skills (non-fatal: our own skills work without them)
  if (!args.has("--no-skills")) run("node", ["scripts/install-skills.mjs"], { allowFail: true });

  // 2. Auth (Clerk)
  step("Auth — Clerk");
  let env = readEnv(ENV);
  if (env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY) {
    ok("Clerk keys already in .env.local");
  } else {
    npx(
      [
        "clerk@latest",
        "init",
        "--accountless",
        "--no-skills",
        "-y",
        "--framework",
        "next",
        "--pm",
        "npm",
        "--template",
        config.auth?.clerkTemplate ?? "b2c-saas",
      ],
      { timeout: 180_000 },
    );
    env = readEnv(ENV);
    if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
      throw new Error("Clerk init did not write keys to .env.local");
    ok("Accountless Clerk app created — claim it later with `npx clerk auth login`");
  }

  // 3. Billing (decided before Convex so BILLING_MODE can be set on the deployment)
  step("Billing");
  const billingPref = config.billing?.provider ?? "stripe";
  let billingMode = "demo";
  env = readEnv(ENV);
  if (billingPref === "stripe") {
    if (env.STRIPE_SECRET_KEY) {
      billingMode = "stripe";
      ok("Stripe key already in .env.local");
    } else if (has("stripe")) {
      const res = run("stripe", ["config", "--list"], { capture: true, allowFail: true });
      const key = res.stdout?.match(/test_mode_api_key\s*=\s*['"]?((?:sk|rk)_test_[A-Za-z0-9]+)/)?.[1];
      if (key) {
        upsertEnv(
          { STRIPE_SECRET_KEY: key },
          { path: ENV, comment: "Stripe (test mode, from `stripe login`)" },
        );
        billingMode = "stripe";
        ok("Using the Stripe test-mode key from your Stripe CLI login");
      } else {
        warn(
          "Stripe CLI not logged in — billing runs in demo mode. Run `stripe login`, then `npm run setup` again.",
        );
      }
    } else {
      warn("Stripe CLI not installed — billing runs in demo mode (checkout is simulated).");
    }
  } else if (billingPref === "polar") {
    if (env.POLAR_ACCESS_TOKEN) {
      billingMode = "polar";
      ok("Polar token present");
    } else {
      warn("Polar needs a sandbox access token — run the es-billing skill. Using demo mode meanwhile.");
    }
  } else {
    ok("Demo billing selected");
  }

  // 4. Shared values
  const issuer = clerkIssuerFromPublishableKey(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if (!issuer) throw new Error("Could not derive the Clerk issuer from NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  const serverSecret = env.CONVEX_SERVER_SECRET || randomBytes(24).toString("hex");
  upsertEnv(
    { NEXT_PUBLIC_APP_URL: "http://localhost:3000", CONVEX_SERVER_SECRET: serverSecret },
    { path: ENV, comment: "Everything Stack" },
  );
  upsertEnv({ BILLING_MODE: billingMode }, { path: ENV, overwrite: true });

  // 5. Database (Convex)
  step("Database — Convex");
  env = readEnv(ENV);
  if (env.CONVEX_DEPLOYMENT && env.NEXT_PUBLIC_CONVEX_URL) {
    ok(`Using ${env.CONVEX_DEPLOYMENT}`);
  } else {
    // First run configures the deployment. The initial push is expected to fail
    // because auth.config.ts needs CLERK_JWT_ISSUER_DOMAIN, which we set next.
    const configure = CLOUD
      ? convex(["dev", "--once", "--configure", "new"], { timeout: 300_000, allowFail: true, capture: true })
      : convex(["dev", "--once"], {
          env: { CONVEX_AGENT_MODE: "anonymous" },
          timeout: 300_000,
          allowFail: true,
          capture: true,
        });
    env = readEnv(ENV);
    if (!env.CONVEX_DEPLOYMENT) {
      throw new Error(
        `Convex deployment was not configured:\n${configure.stdout ?? ""}${configure.stderr ?? ""}`,
      );
    }
    ok(
      CLOUD
        ? "Convex cloud dev deployment created"
        : "Anonymous local Convex backend configured (no account needed)",
    );
  }

  step("Wiring Clerk → Convex");
  const convexVars = {
    CLERK_JWT_ISSUER_DOMAIN: issuer,
    CLERK_SECRET_KEY: env.CLERK_SECRET_KEY,
    CONVEX_SERVER_SECRET: serverSecret,
    BILLING_MODE: billingMode,
    ...(config.adminEmails?.length ? { ADMIN_EMAILS: config.adminEmails.join(",") } : {}),
  };
  for (const [k, v] of Object.entries(convexVars)) convex(["env", "set", k, v], { capture: true });
  ok(`Convex env set: ${Object.keys(convexVars).join(", ")}`);
  const localUp = await fetch("http://127.0.0.1:3210/version")
    .then((r) => r.ok)
    .catch(() => false);
  if (localUp && readEnv(ENV).NEXT_PUBLIC_CONVEX_URL?.includes("127.0.0.1")) {
    ok("Local backend already running (`npm run dev`?) — its watcher will push the changes");
  } else {
    convex(["dev", "--once"], { timeout: 300_000, capture: true });
    ok("Convex functions pushed with Clerk auth enabled");
  }

  console.log(`
${c.green(c.bold("Setup complete."))}

  ${c.bold("npm run dev")}       start Next.js + Convex  → http://localhost:3000
  ${c.bold("npm run verify")}    typecheck, lint, build and an end-to-end auth/db/billing check

  Auth:      Clerk accountless app ${c.dim("(claim: npx clerk auth login)")}
  Database:  ${readEnv(ENV).CONVEX_DEPLOYMENT}
  Billing:   ${billingMode}${billingMode === "demo" ? c.dim(" (simulated checkout — connect Stripe or Polar any time)") : ""}
  Analytics: first-party (Convex)${readEnv(ENV).NEXT_PUBLIC_POSTHOG_KEY ? " + PostHog" : ""}
  Admin:     the first account you create becomes admin
`);
}

main().catch((err) => {
  fail(err.message);
  console.log(c.dim("\nSee docs/TROUBLESHOOTING.md"));
  process.exit(1);
});
