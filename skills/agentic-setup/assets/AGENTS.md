# AGENTS.md — {{PROJECT_NAME}}

For agents that read `AGENTS.md` (Codex and others). **Every rule lives in [`CLAUDE.md`](CLAUDE.md).** Read it and follow all of it; it applies to every agent, not only Claude Code. Do not copy rules here, or there will be two copies to keep in step. Change rules in `CLAUDE.md` only.

## Read before you start

1. [`CLAUDE.md`](CLAUDE.md): non-negotiable rules, stack, conventions, Definition of Done, workflow.
{{READ_ORDER_EXTRA}}

## Skills

Skills live in `.agents/skills/` (the same copies as `.claude/skills/`, pinned in `skills-lock.json`). Pick them from the "Skills" table in `CLAUDE.md` and read that skill's `SKILL.md` **before** opening the first file. `CLAUDE.md` wins over a skill.

Claude Code has a hook (`.claude/hooks/skill-reminder.mjs`) that repeats this rule on every prompt. Other harnesses do not, so do it yourself.
