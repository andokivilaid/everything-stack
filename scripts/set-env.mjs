#!/usr/bin/env node
/**
 * Securely store a secret in .env.local without it appearing in chat or shell history.
 *
 *   npm run env:set -- POLAR_ACCESS_TOKEN
 *
 * Input is hidden. Use this for the rare credential no CLI can write for you.
 */
import { createInterface } from "node:readline";
import { upsertEnv } from "./lib/env-file.mjs";

const name = process.argv[2];
if (!name || !/^[A-Z][A-Z0-9_]*$/.test(name)) {
  console.error("Usage: npm run env:set -- NAME");
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
const write = rl._writeToOutput?.bind(rl);
rl._writeToOutput = (s) => (s.includes(`${name}:`) ? write?.(s) : write?.("*"));
rl.question(`${name}: `, (value) => {
  rl.close();
  process.stdout.write("\n");
  if (!value.trim()) {
    console.error("Nothing entered; unchanged.");
    process.exit(1);
  }
  upsertEnv({ [name]: value.trim() }, { path: ".env.local", overwrite: true });
  console.log(`Saved ${name} to .env.local`);
});
