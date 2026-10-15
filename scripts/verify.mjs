#!/usr/bin/env node
/**
 * End-to-end verification. Exits non-zero on the first failure.
 *
 *   npm run verify               # static checks + build + live e2e
 *   npm run verify -- --quick    # static checks only (no servers)
 *
 * Live e2e (no browser needed):
 *   - boots Convex + `next start` on a production build
 *   - checks public pages, protected-route redirect and /api/health
 *   - creates a throwaway Clerk user via the Backend API, mints a real session
 *     token, and drives Convex with it: user upsert → admin role → items CRUD →
 *     free-plan limit → demo/real checkout → admin analytics → cleanup
 */
import { readEnv } from "./lib/env-file.mjs";
import { c, convexEnv, fail, ok, run, startBackground, step, waitFor } from "./lib/run.mjs";

const QUICK = process.argv.includes("--quick");
const PORT = process.env.VERIFY_PORT ?? "3100";
const BASE = `http://localhost:${PORT}`;
const env = readEnv(".env.local");
const children = [];
let failures = 0;

function check(name, cond, detail = "") {
  if (cond) ok(name);
  else {
    fail(`${name}${detail ? c.dim(` — ${detail}`) : ""}`);
    failures++;
  }
}

async function clerk(path, init = {}) {
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Clerk ${path} → ${res.status} ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

async function convexCall(kind, path, args, token) {
  const res = await fetch(`${env.NEXT_PUBLIC_CONVEX_URL}/api/${kind}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ path, args, format: "json" }),
  });
  const body = await res.json();
  if (body.status !== "success") {
    const err = new Error(body.errorMessage ?? JSON.stringify(body));
    err.convex = body;
    throw err;
  }
  return body.value;
}

async function staticChecks() {
  step("Static checks");
  run("npx", ["convex", "codegen"], { env: convexEnv(), capture: true });
  ok("Convex codegen");
  run("npx", ["next", "typegen"], { capture: true });
  run("npx", ["tsc", "--noEmit"]);
  ok("TypeScript");
  run("npm", ["run", "lint", "--silent"]);
  ok("ESLint");
}

async function build() {
  step("Production build");
  run("npx", ["next", "build"]);
  ok("next build");
}

async function e2e() {
  step("Booting Convex + Next.js");
  children.push(startBackground("convex", "npx", ["convex", "dev"], { env: convexEnv(), color: c.cyan }));
  await waitFor(`${env.NEXT_PUBLIC_CONVEX_URL}/version`, { expect: (r) => r.ok });
  ok("Convex is up");
  children.push(startBackground("next", "npx", ["next", "start", "-p", PORT], { color: c.green }));
  await waitFor(`${BASE}/api/health`, { expect: (r) => r.ok });
  ok(`Next.js is up on ${BASE}`);

  step("Pages and routes");
  for (const path of ["/", "/pricing", "/sign-in", "/sign-up"]) {
    const res = await fetch(BASE + path);
    check(`GET ${path} → ${res.status}`, res.status === 200);
  }
  const home = await (await fetch(BASE + "/")).text();
  check("Landing page renders the stack strata", home.includes("Chosen in six questions"));
  const dash = await fetch(`${BASE}/dashboard`, { redirect: "manual" });
  check(
    `GET /dashboard signed-out is protected → ${dash.status}`,
    [302, 303, 307, 308, 401, 404].includes(dash.status),
  );
  const health = await (await fetch(`${BASE}/api/health`)).json();
  check("/api/health: auth configured", health.integrations?.auth?.configured === true);
  check("/api/health: database configured", health.integrations?.database?.configured === true);
  check("/api/health: server secret configured", health.integrations?.serverSecret === true);
  console.log(c.dim(`  billing mode: ${health.integrations?.billing?.mode}`));
  const checkoutAnon = await fetch(`${BASE}/api/billing/checkout`, { method: "POST", body: "{}" });
  check("Checkout API rejects anonymous users", checkoutAnon.status === 401 || checkoutAnon.status === 404);

  step("Auth → database round trip (real Clerk session token)");
  const stamp = Date.now();
  const email = `verify+clerk_test_${stamp}@example.com`;
  const user = await clerk("/users", {
    method: "POST",
    body: JSON.stringify({
      email_address: [email],
      password: `Verify-${stamp}-Pw!`,
      first_name: "Verify",
      last_name: "Bot",
      skip_password_checks: true,
    }),
  });
  ok(`Created test user ${email}`);
  try {
    const session = await clerk("/sessions", { method: "POST", body: JSON.stringify({ user_id: user.id }) });
    const { jwt } = await clerk(`/sessions/${session.id}/tokens`, { method: "POST" });
    check("Minted a Clerk session token", typeof jwt === "string" && jwt.split(".").length === 3);

    const anon = await convexCall("query", "users:me", {});
    check("Anonymous users:me is null", anon === null);

    await convexCall("action", "users:sync", {}, jwt);
    const me = await convexCall("query", "users:me", {}, jwt);
    check("Convex accepted the Clerk token (users:me)", me?.externalId === user.id, JSON.stringify(me));
    check(
      "Verified profile synced from Clerk (email + name)",
      me?.email === email && me?.name === "Verify Bot",
      JSON.stringify(me),
    );
    console.log(c.dim(`  role: ${me?.role} (first user ever is admin)`));

    for (let i = 1; i <= 5; i++) await convexCall("mutation", "items:create", { title: `Item ${i}` }, jwt);
    const items = await convexCall("query", "items:list", {}, jwt);
    check("Items CRUD: created 5 items", items.length === 5);
    let blocked = false;
    try {
      await convexCall("mutation", "items:create", { title: "Item 6" }, jwt);
    } catch (e) {
      blocked = /Free plan/.test(e.message);
    }
    check("Free plan limit enforced at 5 items", blocked);

    await convexCall("mutation", "items:toggle", { id: items[0]._id }, jwt);
    await convexCall("mutation", "items:remove", { id: items[1]._id }, jwt);
    const after = await convexCall("query", "items:list", {}, jwt);
    check("Toggle + delete work", after.length === 4 && after.some((i) => i.done));

    if ((health.integrations?.billing?.mode ?? "demo") === "demo") {
      await convexCall(
        "mutation",
        "billing:demoCheckout",
        { plan: "pro", amountCents: 1900, currency: "usd" },
        jwt,
      );
      const paid = await convexCall("query", "users:me", {}, jwt);
      check(
        "Demo checkout activates Pro",
        paid.subscription?.status === "active" && paid.subscription?.plan === "pro",
      );
      await convexCall("mutation", "items:create", { title: "Paid item" }, jwt);
      ok("Paid plan lifts the item limit");
    } else {
      const res = await fetch(`${BASE}/api/billing/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ plan: "pro" }),
      });
      const data = await res.json();
      check(
        `Real checkout session created (${health.integrations.billing.mode})`,
        typeof data.url === "string",
        JSON.stringify(data),
      );
    }

    await convexCall(
      "mutation",
      "analytics:track",
      { name: "pageview", path: "/verify", anonymousId: "verify" },
      jwt,
    );
    if (me?.role === "admin") {
      const overview = await convexCall("query", "analytics:overview", { days: 7 }, jwt);
      check(
        "Admin analytics overview returns data",
        overview.totals.users >= 1 && overview.series.length === 7,
      );
    } else {
      let denied = false;
      try {
        await convexCall("query", "analytics:overview", {}, jwt);
      } catch {
        denied = true;
      }
      check("Non-admins are denied admin analytics", denied);
    }
  } finally {
    await clerk(`/users/${user.id}`, { method: "DELETE" }).catch(() => {});
    ok("Deleted test user from Clerk");
  }
}

async function main() {
  console.log(c.bold("\nEverything Stack — verify"));
  if (!env.NEXT_PUBLIC_CONVEX_URL || !env.CLERK_SECRET_KEY) {
    fail("Not set up. Run `npm run setup` first.");
    process.exit(1);
  }
  await staticChecks();
  if (!QUICK) {
    await build();
    await e2e();
  }
}

main()
  .catch((err) => {
    fail(err.message);
    failures++;
  })
  .finally(() => {
    for (const child of children) child.kill("SIGINT");
    console.log(failures ? c.red(`\n${failures} check(s) failed.`) : c.green(c.bold("\nAll checks passed.")));
    process.exit(failures ? 1 : 0);
  });
