// UserPromptSubmit hook: whatever this prints is added to the agent's context on every prompt.
// It reads the "## Skills" table straight out of CLAUDE.md, so the table has one home and the
// reminder can never drift from it. Installed by the agentic-setup skill.
//
// CLAUDE.md is editable by anyone with repo access, and this output reaches the agent on every
// prompt, so the table is treated as untrusted input: text is stripped to plain words and capped,
// and a skill is only named when it is actually installed in this repo.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const MAX_ROWS = 40;
const MAX_TASK_CHARS = 160;
const SKILL_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;

function readSkillRows(markdown) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+Skills\b/i.test(line));
  if (start === -1) return [];
  const rows = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line)) break;
    const cells = line.trim().match(/^\|(.+)\|$/)?.[1].split("|").map((cell) => cell.trim());
    if (!cells || cells.length < 2) continue;
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue; // separator row
    rows.push(cells);
  }
  return rows.slice(1); // drop the header row
}

// Plain words only: no tags, no control or invisible characters, no markdown, bounded length.
function cleanTask(text) {
  const plain = text
    .replace(/<[^>]*>/g, " ")
    .replace(/[<>]/g, " ")
    .replace(/[\p{Cc}\p{Cf}]/gu, " ")
    .replace(/[`*_~#[\]{}\\]/g, "")
    .replace(/->/g, "→")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > MAX_TASK_CHARS ? plain.slice(0, MAX_TASK_CHARS - 1).trimEnd() + "…" : plain;
}

// Skill names as written in the cell: `a` + `b`, or a + b.
function skillNames(cell) {
  const ticked = [...cell.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  const names = ticked.length > 0 ? ticked : cell.split(/[+,/]/);
  return names.map((name) => name.trim()).filter((name) => SKILL_NAME.test(name));
}

function installedSkills() {
  let pinned = {};
  try {
    pinned = JSON.parse(readFileSync(join(root, "skills-lock.json"), "utf8")).skills ?? {};
  } catch {
    // no lock file: fall back to what is on disk
  }
  return (name) => Object.hasOwn(pinned, name) || existsSync(join(root, ".claude", "skills", name, "SKILL.md"));
}

function reminderPairs(markdown, isInstalled) {
  const pairs = [];
  for (const [taskCell, skillCell] of readSkillRows(markdown).slice(0, MAX_ROWS)) {
    const task = cleanTask(taskCell);
    const skills = skillNames(skillCell).filter(isInstalled);
    if (task && skills.length > 0) pairs.push(`${task} -> ${skills.join(" + ")}`);
  }
  return pairs;
}

function main() {
  let pairs = [];
  try {
    pairs = reminderPairs(readFileSync(join(root, "CLAUDE.md"), "utf8"), installedSkills());
  } catch {
    // No CLAUDE.md yet: fall through to the generic reminder.
  }
  const parts = [
    'Reminder (CLAUDE.md "Skills"): if this prompt involves writing, changing or reviewing code,',
    "call the matching skill via the Skill tool BEFORE opening the first file.",
  ];
  if (pairs.length > 0) parts.push(pairs.join(" | ") + ".");
  if (existsSync(join(root, "docs", "agents", "loop.md"))) {
    parts.push("Delivery loop steps: read docs/agents/loop.md first.");
  }
  parts.push("CLAUDE.md wins over any skill rule that conflicts with it. Skip this for questions that need no code.");
  process.stdout.write(parts.join(" ") + "\n");
}

main();
