// UserPromptSubmit hook: whatever this prints is added to the agent's context on every prompt.
// It reads the "## Skills" table straight out of CLAUDE.md, so the table has one home and the
// reminder can never drift from it. Installed by the agentic-setup skill.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

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

let rows = [];
try {
  rows = readSkillRows(readFileSync(join(root, "CLAUDE.md"), "utf8"));
} catch {
  // No CLAUDE.md yet: fall through to the generic reminder.
}

const parts = [
  'Reminder (CLAUDE.md "Skills"): if this prompt involves writing, changing or reviewing code,',
  "call the matching skill via the Skill tool BEFORE opening the first file.",
];
if (rows.length > 0) {
  parts.push(rows.map(([task, skill]) => `${task} -> ${skill}`).join(" | ") + ".");
}
if (existsSync(join(root, "docs", "agents", "loop.md"))) {
  parts.push("Delivery loop steps: read docs/agents/loop.md first.");
}
parts.push("CLAUDE.md wins over any skill rule that conflicts with it. Skip this for questions that need no code.");

process.stdout.write(parts.join(" ").replace(/`/g, "") + "\n");
