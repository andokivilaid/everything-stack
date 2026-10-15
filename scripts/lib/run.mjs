import { spawn, spawnSync } from "node:child_process";

export const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

export const step = (msg) => console.log(`\n${c.cyan("▸")} ${c.bold(msg)}`);
export const ok = (msg) => console.log(`  ${c.green("✓")} ${msg}`);
export const warn = (msg) => console.log(`  ${c.yellow("!")} ${msg}`);
export const fail = (msg) => console.log(`  ${c.red("✗")} ${msg}`);

/** Convex's local backend refuses to start unless it runs in UTC. */
export function convexEnv(extra = {}) {
  const env = { ...process.env, ...extra };
  delete env.TZ;
  return env;
}

export function run(cmd, args, { env, capture = false, allowFail = false, timeout } = {}) {
  const res = spawnSync(cmd, args, {
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: env ?? process.env,
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout,
  });
  if (res.status !== 0 && !allowFail) {
    const out = capture ? `\n${res.stdout ?? ""}${res.stderr ?? ""}` : "";
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}${out}`);
  }
  return res;
}

export function has(cmd) {
  const res = spawnSync(process.platform === "win32" ? "where" : "which", [cmd], { stdio: "ignore" });
  return res.status === 0;
}

export function startBackground(name, cmd, args, { env, color = c.dim } = {}) {
  const child = spawn(cmd, args, {
    env: env ?? process.env,
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  const prefix = color(`[${name}]`);
  const pipe = (stream) =>
    stream.on("data", (buf) => {
      for (const line of buf.toString().split(/\r?\n/)) if (line.trim()) console.log(`${prefix} ${line}`);
    });
  pipe(child.stdout);
  pipe(child.stderr);
  return child;
}

export async function waitFor(url, { timeoutMs = 120_000, expect = (r) => r.status < 500 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (expect(res)) return res;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}
