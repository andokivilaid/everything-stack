import { connection, NextResponse } from "next/server";
import { integrations } from "@/lib/env";

/** Reports which integrations are configured (never values). Used by `npm run verify`. */
export async function GET() {
  await connection(); // evaluate at request time, not at build
  return NextResponse.json({ ok: true, integrations: integrations() });
}
