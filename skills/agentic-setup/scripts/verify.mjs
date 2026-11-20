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

// 4b. The hook treats the table as untrusted input. Flag rows it would cut or drop, so a
// reviewer sees them here instead of wondering why a reminder is missing.
const MAX_ROWS = 40;
const MAX_TASK_CHARS = 160;
const SKILL_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;
const namesIn = (cell) => {
  const ticked = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  return (ticked.length > 0 ? ticked : cell.split(/[+,/]/)).map((n) => n.trim()).filter(Boolean);
};
check(`Skills table has at most ${MAX_ROWS} rows`, (rows?.length ?? 0) <= MAX_ROWS, `has ${rows?.length}; the hook prints only the first ${MAX_ROWS}`);
const problems = [];
(rows ?? []).forEach(([task, skillCell], i) => {
  const n = i + 1;
  if (/<[^>]*>|[\p{Cc}\p{Cf}]/u.test(task)) problems.push(`row ${n}: task has HTML tags or invisible characters (the hook strips them)`);
  if (task.length > MAX_TASK_CHARS + 40) problems.push(`row ${n}: task is ${task.length} characters (the hook cuts it near ${MAX_TASK_CHARS})`);
  const bad = namesIn(skillCell).filter((name) => !SKILL_NAME.test(name));
  if (bad.length > 0) problems.push(`row ${n}: not a skill name: ${bad.join(", ")}`);
  if (namesIn(skillCell).length === 0) problems.push(`row ${n}: names no skill`);
});
check("Skills table rows are plain task text and valid skill names", problems.length === 0, problems.join("\n"));

// 5. The hook runs and prints one pair per usable row.
let lock = {};
try {
  lock = JSON.parse(read("skills-lock.json")).skills ?? {};
} catch {
  // reported by the exists check above
}
const isInstalled = (name) => Object.hasOwn(lock, name) || existsSync(join(repo, ".claude/skills", name, "SKILL.md"));
const usable = (rows ?? []).slice(0, MAX_ROWS).filter(([, cell]) => namesIn(cell).some((name) => SKILL_NAME.test(name) && isInstalled(name))).length;
if (existsSync(join(repo, ".claude/hooks/skill-reminder.mjs"))) {
  const run = spawnSync(process.execPath, [join(repo, ".claude/hooks/skill-reminder.mjs")], {
    env: { ...process.env, CLAUDE_PROJECT_DIR: repo },
    encoding: "utf8",
  });
  const pairs = (run.stdout.match(/ -> /g) ?? []).length;
  check(
    `hook prints ${usable} task -> skill pairs`,
    run.status === 0 && pairs === usable,
    run.status === 0 ? `printed ${pairs}` : run.stderr.trim(),
  );
  check("hook output is one line with no markup", run.status === 0 && !/[<>`]/.test(run.stdout.replaceAll(" -> ", " ")) && run.stdout.trim().split("\n").length === 1);
}

// 6. Every skill named in the table is installed for both harnesses and pinned.
const named = new Set();
for (const [, skillCell] of rows ?? []) {
  for (const name of namesIn(skillCell).filter((n) => SKILL_NAME.test(n))) named.add(name);
}
for (const name of named) {
  const missing = [
    existsSync(join(repo, ".claude/skills", name, "SKILL.md")) ? null : ".claude/skills",
    existsSync(join(repo, ".agents/skills", name, "SKILL.md")) ? null : ".agents/skills",
    Object.hasOwn(lock, name) ? null : "skills-lock.json (not pinned)",
  ].filter(Boolean);
  check(`skill installed: ${name}`, missing.length === 0, missing.length ? `missing from ${missing.join(", ")}` : "");
}

// 7. Git-sourced skills record the commit they came from, so the files trace to the
// exact upstream content a human read.
const GIT_SOURCE_TYPES = new Set(["github", "gitlab", "git"]);
const noCommit = Object.entries(lock)
  .filter(([, entry]) => GIT_SOURCE_TYPES.has(entry.sourceType) && !/^[0-9a-f]{40}$/i.test(entry.commit ?? ""))
  .map(([name]) => name);
check(
  "skills-lock.json records a source commit for every git skill",
  noCommit.length === 0,
  `no commit: ${noCommit.join(", ")}\nreinstall each source with: npx skills@1.9.0 add <owner>/<repo>@<commit> --skill <name> ...`,
);

// Report.
let failed = 0;
for (const { name, ok, detail } of results) {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${!ok && detail ? `\n       ${detail.replace(/\n/g, "\n       ")}` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
