#!/usr/bin/env node
// Validates the committed Everything Stack skills: frontmatter, naming, links and size.
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = ".claude/skills";
const ours = readdirSync(ROOT).filter((d) => d === "everything-stack" || d.startsWith("es-"));
let errors = 0;
const err = (m) => {
  console.error(`✗ ${m}`);
  errors++;
};

for (const dir of ours) {
  const file = join(ROOT, dir, "SKILL.md");
  if (!existsSync(file)) {
    err(`${dir}: missing SKILL.md`);
    continue;
  }
  const text = readFileSync(file, "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) {
    err(`${dir}: missing frontmatter`);
    continue;
  }
  const name = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1].trim();
  if (name !== dir) err(`${dir}: frontmatter name "${name}" must equal folder name`);
  if (!desc || desc.length < 40) err(`${dir}: description missing or too short`);
  if (desc && desc.length > 1024) err(`${dir}: description over 1024 chars`);
  const lines = text.split("\n").length;
  if (lines > 300) err(`${dir}: SKILL.md is ${lines} lines (keep under 300; move detail to references/)`);

  // Relative links must resolve.
  for (const [, target] of text.matchAll(/\]\((?!https?:|#|mailto:)([^)\s]+)\)/g)) {
    if (!existsSync(resolve(dirname(file), target))) err(`${dir}: broken link ${target}`);
  }
  // Skills referenced with es-* must exist.
  for (const [, ref] of text.matchAll(/`(es-[a-z-]+)`/g)) {
    if (!existsSync(join(ROOT, ref, "SKILL.md"))) err(`${dir}: references unknown skill ${ref}`);
  }

  // Mirror for Codex/Cursor.
  const mirror = join(".agents/skills", dir);
  if (!existsSync(mirror)) err(`${dir}: missing .agents/skills mirror`);
  else if (lstatSync(mirror).isSymbolicLink() && readlinkSync(mirror) !== `../../.claude/skills/${dir}`) {
    err(`${dir}: .agents/skills symlink points to ${readlinkSync(mirror)}`);
  }
}

if (errors) {
  console.error(`\n${errors} skill problem(s).`);
  process.exit(1);
}
console.log(`✓ ${ours.length} skills valid`);
