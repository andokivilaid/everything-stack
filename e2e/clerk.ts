import { readFileSync } from "node:fs";

/** Reads .env.local without extra dependencies. */
export function localEnv(): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(".env.local", "utf8")
        .split(/\r?\n/)
        .map((l) => l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/))
        .filter((m): m is RegExpMatchArray => Boolean(m))
        .map((m) => [m[1], m[2].replace(/^(['"])(.*)\1$/, "$2")]),
    );
  } catch {
    return {};
  }
}

const env = { ...localEnv(), ...process.env } as Record<string, string>;

async function bapi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const body = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new Error(`Clerk ${path} → ${res.status} ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

export async function createTestUser() {
  const stamp = Date.now();
  const email = `e2e+clerk_test_${stamp}@example.com`;
  const user = await bapi<{ id: string }>("/users", {
    method: "POST",
    body: JSON.stringify({
      email_address: [email],
      password: `E2e-${stamp}-Pw!`,
      first_name: "Avery",
      last_name: "Tester",
      skip_password_checks: true,
    }),
  });
  return { id: user.id, email };
}

/** A one-time sign-in ticket; visiting /sign-in?__clerk_ticket=… signs the user in. */
export async function signInTicket(userId: string) {
  const { token } = await bapi<{ token: string }>("/sign_in_tokens", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, expires_in_seconds: 600 }),
  });
  return token;
}

export async function deleteUser(userId: string) {
  await bapi(`/users/${userId}`, { method: "DELETE" }).catch(() => {});
}
