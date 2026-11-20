#!/usr/bin/env node
// Checks an agentic setup in a repo. Run from anywhere:
//   node <skill>/scripts/verify.mjs [repo-dir]
// Exits 1 when any check fails. Works the same in PowerShell, cmd and Git Bash.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const repo = resolve(process.argv[2] || process.cwd());
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok, detail });
const read = (path) => readFileSync(join(repo, path), "utf8");

// 1. Required files.
for (const path of ["CLAUDE.md", "AGENTS.md", ".claude/settings.json", ".claude/hooks/skill-reminder.mjs", "skills-lock.json"]) {
  check(`exists: ${path}`, existsSync(join(repo, path)));
}

// 2. No unfilled {{PLACEHOLDER}} left in the files this skill writes.
const docFiles = ["CLAUDE.md", "AGENTS.md"];
const agentsDir = join(repo, "docs", "agents");
if (existsSync(agentsDir)) {
  for (const file of readdirSync(agentsDir)) if (file.endsWith(".md")) docFiles.push(`docs/agents/${file}`);
}
for (const path of docFiles) {
  if (!existsSync(join(repo, path))) continue;
  const hits = read(path).split(/\r?\n/).map((line, i) => [i + 1, line]).filter(([, line]) => /\{\{[A-Z_]+\}\}/.test(line));
  check(`no placeholders: ${path}`, hits.length === 0, hits.map(([n, line]) => `${n}: ${line.trim()}`).join("\n"));
}

// 3. settings.json parses and registers the hook.
try {
  const settings = JSON.parse(read(".claude/settings.json"));
  const commands = (settings.hooks?.UserPromptSubmit ?? []).flatMap((entry) => entry.hooks ?? []).map((hook) => hook.command ?? "");
  check("settings.json registers skill-reminder on UserPromptSubmit", commands.some((c) => c.includes("skill-reminder.mjs")));
} catch (error) {
  check("settings.json parses", false, String(error.message));
}

// 4. The Skills table, read the same way the hook reads it.
function skillRows(markdown) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+Skills\b/i.test(line));
  if (start === -1) return null;
  const rows = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line)) break;
    const cells = line.trim().match(/^\|(.+)\|$/)?.[1].split("|").map((cell) => cell.trim());
    if (!cells || cells.length < 2) continue;
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    rows.push(cells);
  }
  return rows.slice(1);
}
const rows = existsSync(join(repo, "CLAUDE.md")) ? skillRows(read("CLAUDE.md")) : null;
check("CLAUDE.md has a '## Skills' table", Array.isArray(rows) && rows.length > 0);

// 5. The hook runs and prints one pair per row.
if (existsSync(join(repo, ".claude/hooks/skill-reminder.mjs"))) {
  const run = spawnSync(process.execPath, [join(repo, ".claude/hooks/skill-reminder.mjs")], {
    env: { ...process.env, CLAUDE_PROJECT_DIR: repo },
    encoding: "utf8",
  });
  const pairs = (run.stdout.match(/ -> /g) ?? []).length;
  check(
    `hook prints ${rows?.length ?? 0} task -> skill pairs`,
    run.status === 0 && pairs === (rows?.length ?? -1),
    run.status === 0 ? `printed ${pairs}` : run.stderr.trim(),
  );
}

// 6. Every skill named in the table is installed for both harnesses and pinned.
let lock = {};
try {
  lock = JSON.parse(read("skills-lock.json")).skills ?? {};
} catch {
  // reported by the exists check above
}
const named = new Set();
for (const [, skillCell] of rows ?? []) {
  const ticked = [...skillCell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  const names = ticked.length > 0 ? ticked : skillCell.split(/[+,/]/);
  for (const name of names.map((n) => n.trim()).filter(Boolean)) named.add(name);
}
for (const name of named) {
  const missing = [
    existsSync(join(repo, ".claude/skills", name, "SKILL.md")) ? null : ".claude/skills",
    existsSync(join(repo, ".agents/skills", name, "SKILL.md")) ? null : ".agents/skills",
    lock[name] ? null : "skills-lock.json",
  ].filter(Boolean);
  check(`skill installed: ${name}`, missing.length === 0, missing.length ? `missing from ${missing.join(", ")}` : "");
}

// Report.
let failed = 0;
for (const { name, ok, detail } of results) {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${!ok && detail ? `\n       ${detail.replace(/\n/g, "\n       ")}` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
