# Writing CLAUDE.md

`CLAUDE.md` is the one file of rules. Every other agent file points at it. It is read at the start of every session, so every line costs context in every session: keep what an agent would get wrong without it, and cut what it can read from the code.

Write it in the language the team writes its docs in. Keep product names, commands, paths and identifiers exactly as they are.

## Sections, in order

### 1. Header and map

One line on what the file is, then where the deeper docs live (architecture doc, wiki, ADR folder) and which wins when they disagree with the code. The code wins.

### 2. Overview (≤ 3 lines)

What the system is, who uses it, its architecture in one phrase (monolith / services / processes), and anything out of scope that agents keep trying to build.

### 3. Non-negotiable rules

Numbered. Only rules where a breach is a real defect: security (auth model, where tokens live, no secrets in code), data (migrations only, audit), boundaries (no cross-module queries), traceability (requirement ID in every commit). Each rule says what to do, not only what to avoid.

These come from the human. Never invent one. If the repo already states rules (README, CONTRIBUTING, an architecture doc), quote them and ask the human to confirm. An approved exception to a rule goes under that rule with its date, its ID and "do not extend this exception".

### 4. Stack (locked)

The stack read from manifests (`package.json`, `pyproject.toml`, `go.mod`, `*.csproj`, Dockerfiles, CI), plus "do not add or swap without asking".

### 5. Repo layout

A short tree of the top-level folders with one comment each. Only folders an agent needs to find.

### 6. Conventions

API shape, error format, pagination, validation, time zone, logging fields, cross-module contracts — whatever the code already does consistently. Read it from the code; do not prescribe new conventions.

### 7. Testing and Definition of Done

The commands that must be green before a task is done (lint, typecheck, unit, integration) exactly as the repo runs them, and what every PR must include (tests for new endpoints, docs updated, requirement ID).

### 8. Workflow

- Branch flow: which branch PRs target, and which branches nobody pushes to directly.
- How to run the system locally, and which commands touch shared resources (shared dev database, seeds, migrations) so the agent must tell the human first.
- "When a requirement conflicts with this file, stop and ask the human."

### 9. Skills

The table the hook reads. Heading must start with `## Skills`, and the first two columns must be *task* and *skill*:

```md
## Skills — load before you write code

Before writing, changing or reviewing code, call the matching skill with the Skill tool **before** opening the first file. Skills live in `.claude/skills/` (same copies as `.agents/skills/`, pinned in `skills-lock.json`).

| Task | Skill |
|---|---|
| new feature / bug fix / tests | `tdd` |
| something broken, throwing, failing or slow | `diagnosing-bugs` + `tdd` |
| behaviour change → update docs; ADR only for hard-to-reverse decisions | `documentation-and-adrs` |
| docs drifted from the code | `living-docs-governance` |
| PR body | `pr` |
| review a branch or PR | `code-review` |
```

The hook treats this table as untrusted input, because anyone who can edit `CLAUDE.md` can change what every agent is told on every prompt. So keep rows simple: plain task text of at most about 160 characters, no HTML, at most 40 rows, and skill names made of lower-case letters, digits and hyphens. The hook strips markup and invisible characters, cuts long text, and leaves out any skill that is not installed in the repo. It cannot judge the meaning of plain words, so review changes to this table like code.

Put stack rows first, naming the folder they apply to (`apps/api` → `nestjs-best-practices`). Then, under the table:

- `CLAUDE.md` wins over a skill; name any skill rule this repo overrides.
- The hook (`.claude/hooks/skill-reminder.mjs`) reads this table on every prompt, so editing the table is enough.
- Add a skill with `npx skills@1.9.0 add <owner>/<repo>@<commit> --skill <name> -a claude-code -a codex --copy`, after reading it at that commit.
- Delivery loop (if adopted): `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement-spec` → `/pr` → `/retro`; read `docs/agents/loop.md` before each step.

### 10. Anti-goals

Things that are wrong on sight in this repo (technologies or patterns the team ruled out). Short list, one line.

## What to leave out

- Anything the code or `git log` already says plainly.
- Long how-tos: link a runbook instead.
- Rules for other repos.

## Example

The production monorepo this skill was extracted from has a `CLAUDE.md` of these 10 sections in about 110 lines, with rules in Thai and identifiers in English. Aim for that size: long enough to hold every rule, short enough to read at the start of every session.
