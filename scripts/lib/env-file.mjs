// Minimal, dependency-free .env file helpers that preserve comments and order.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export function readEnv(path = ".env.local") {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let value = m[2];
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, "");
    out[m[1]] = value;
  }
  return out;
}

/** Upsert keys into an env file. Existing values are kept unless `overwrite`. */
export function upsertEnv(values, { path = ".env.local", overwrite = false, comment } = {}) {
  const lines = existsSync(path) ? readFileSync(path, "utf8").split(/\r?\n/) : [];
  const seen = new Set();
  const changed = [];
  const next = lines.map((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!m || !(m[1] in values)) return line;
    seen.add(m[1]);
    if (!overwrite) return line;
    changed.push(m[1]);
    return `${m[1]}=${values[m[1]]}`;
  });
  const missing = Object.entries(values).filter(([k, v]) => !seen.has(k) && v !== undefined && v !== "");
  if (missing.length) {
    while (next.length && next.at(-1) === "") next.pop();
    if (next.length) next.push("");
    if (comment) next.push(`# ${comment}`);
    for (const [k, v] of missing) {
      next.push(`${k}=${v}`);
      changed.push(k);
    }
  }
  writeFileSync(path, next.join("\n").replace(/\n*$/, "\n"));
  return changed;
}

/** Clerk publishable keys encode the Frontend API host: pk_test_<base64("host$")>. */
export function clerkIssuerFromPublishableKey(pk) {
  if (!pk) return null;
  const m = pk.match(/^pk_(test|live)_(.+)$/);
  if (!m) return null;
  const host = Buffer.from(m[2], "base64").toString("utf8").replace(/\$$/, "");
  return host ? `https://${host}` : null;
}
