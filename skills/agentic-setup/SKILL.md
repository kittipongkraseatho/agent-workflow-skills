---
name: agentic-setup
description: Install an agentic coding setup into a repository — one CLAUDE.md of rules with a Skills table, an AGENTS.md that points at it, a UserPromptSubmit hook that repeats the Skills table on every prompt, vetted skills pinned in skills-lock.json for both Claude Code and Codex, and (optionally) the delivery loop docs (grill → spec → tickets → implement → PR → retro). Use this whenever someone wants to set up, bootstrap or standardise how AI agents work in a repo, make a repo "agent-ready", add CLAUDE.md/AGENTS.md/skills/hooks to a project, reuse one repo's agent setup in another system, or says things like "ตั้งค่า agentic", "ติดตั้ง skill ให้ repo นี้", "set up Claude Code for this repo" — even if they don't name this skill. Also use it to audit or upgrade a repo whose agent setup is partial or drifted.
---

# Agentic setup

Turn a repository into one where any agent (Claude Code, Codex, …) works the same way: reads one file of rules, loads the right skill before touching code, and follows a fixed path from request to PR.

The setup was extracted from a production monorepo where it has been used daily. Its parts and why each exists:

| Part | Why |
|---|---|
| `CLAUDE.md` | One home for rules. Two copies of rules always drift. |
| `AGENTS.md` | Codex and other harnesses read this name. It only points at `CLAUDE.md`. |
| `.claude/hooks/skill-reminder.mjs` + `.claude/settings.json` | Agents skip skills unless reminded at the moment they start work. The hook prints the `CLAUDE.md` Skills table on every prompt. It reads the table at run time, so editing `CLAUDE.md` is enough. |
| `.claude/skills/` + `.agents/skills/` + `skills-lock.json` | The same vetted skills for both harnesses, pinned by hash so nobody's copy changes silently. |
| `docs/agents/{loop,issue-tracker,domain}.md` | Project rules for each delivery-loop step. They win over the vendored skill text, so skills never need editing. |

The end state: every rule the team cares about is in `CLAUDE.md`, every agent is reminded of the Skills table on every prompt, and every skill is pinned.

## 1. Inspect the repo (read-only)

Gather facts before asking anything, so the human only answers what the code cannot tell you.

- Existing agent files: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`, `skills-lock.json`, `.cursor/rules`, `.github/copilot-instructions.md`. If any exist, you are **upgrading**, not installing: keep every rule they already state.
- Stack: `package.json` (and workspace manifests), `pyproject.toml`, `go.mod`, `*.csproj`, `Dockerfile`, `docker-compose*`, CI workflows.
- Commands: lint, typecheck, unit test, integration test, build, dev run — exactly as scripts, `Makefile` or CI run them.
- Branches: default branch, whether `develop` exists (`git branch -r`), what recent PRs target (`gh pr list --state merged --limit 10 --json baseRefName`). A repo with no remote answers neither; read `git branch` and ask the human in step 2.
- Docs: README, architecture docs, ADR folder, wiki, existing rules in CONTRIBUTING.
- Language the docs and commit messages are written in.
- Commit messages: is there a requirement/ticket ID pattern (`REQ-123`, `ABC-45`)?

For a large repo, hand this sweep to an `Explore` subagent and keep only its conclusions.

## 2. Ask the human what the code cannot say

One batch of questions. Pre-fill each with what you found, so most answers are "yes". Typical gaps:

1. **Non-negotiable rules** (security, data, boundaries). Never invent these; propose candidates you saw in the code and docs.
2. **Branch flow**: which branch PRs target; which branches are never pushed to directly.
3. **Traceability ID**: the ID every commit and PR carries (e.g. `REQ-NNN`, a Jira key), or none.
4. **Shared resources**: commands that write a shared database or environment and need the human first.
5. **Delivery loop**: adopt it (installs the loop skills and `docs/agents/*`) or only the core set.
6. **Doc language** for `CLAUDE.md`, `AGENTS.md` and `docs/agents/*`.

## 3. Propose the change and get a go-ahead

Show, in one message:

- the files you will create or change (and for an upgrade, what you will add to existing files);
- the skills you will install, by source, from `references/skill-catalog.md` (core set, plus the loop set if adopted, plus stack rows matched from the manifests). For a stack not in the catalog, search with `npx skills find` and read the candidate's `SKILL.md` before proposing it.

Wait for the human's yes. Installing a skill downloads third-party instructions that agents will follow, so the human chooses the list.

## 4. Write the files

Work on a branch from the integration branch (`chore/agentic-setup`), in a worktree if other sessions use the main checkout. If that branch does not exist locally, branch from the current HEAD and say so.

The files in `assets/` are English templates. Translate their prose into the doc language the human chose; keep commands, paths and identifiers as they are.

1. **`CLAUDE.md`** — follow `references/claude-md-guide.md`. When one exists, merge into it: keep its rules and wording, add the missing sections, and put the Skills table under a heading that starts with `## Skills`.
2. **`AGENTS.md`** — from `assets/AGENTS.md`. If an `AGENTS.md` already holds rules, move those rules into `CLAUDE.md` (with the human's OK) and leave only the pointer.
3. **Hook** — copy `assets/skill-reminder.mjs` to `.claude/hooks/skill-reminder.mjs` unchanged.
4. **`.claude/settings.json`** — from `assets/settings.json`. If the file exists, add the `UserPromptSubmit` entry to its `hooks` and keep everything else. Do not touch `.claude/settings.local.json`; it is personal.
5. **Delivery loop docs** (if adopted) — copy `assets/docs-agents/*.md` to `docs/agents/` and fill every `{{PLACEHOLDER}}` using `references/placeholders.md`, which says what each one means and what to write when the repo has no answer (no traceability ID, no ADR folder, no tracker).
6. **Git hygiene** — add `.claude/settings.local.json` to `.gitignore` if it is not there. If the repo has no line-ending policy, add these to `.gitattributes` so Windows checkouts do not change the pinned skill files:

   ```gitattributes
   .claude/skills/** text eol=lf
   .agents/skills/** text eol=lf
   ```

## 5. Install the skills

```bash
npx skills add <source> --skill <name> [--skill <name> …] -a claude-code -a codex --copy -y
```

One call per source; `-y` keeps it from prompting. The output is noisy, so judge by the exit code and the files. Never edit a vendored skill; a project-specific change to a skill's behaviour goes in `docs/agents/loop.md` or `CLAUDE.md`.

The skill files are committed, so a fresh clone already has them and needs no restore step.

## 6. Verify

```bash
node <this skill's folder>/scripts/verify.mjs <repo>
```

It works the same in PowerShell, cmd and Git Bash. It checks that the files exist, that no `{{PLACEHOLDER}}` is left, that `settings.json` registers the hook, that the hook prints one `task -> skill` pair per row of the Skills table, and that every skill in the table is installed for both harnesses and pinned. Show its output. If the hook prints no pairs, the heading or table shape is wrong (see the guide, section 9).

Then run the repo's own lint and test commands if you touched anything they cover.

## 7. Hand off

Commit with the repo's convention and traceability ID (e.g. `chore(agents): agentic setup (REQ-NNN)`), push, and open the PR against the branch the human named. Ask before pushing if the human has not said to. A human reviews and merges.

In the PR body, list the skills installed with their sources, and tell the team that a new Claude Code session picks up the hook (a running session may need a restart).

## Keeping it healthy

- Add a skill: install it with the command above, then add its row to the `CLAUDE.md` Skills table. The hook needs no change.
- Upgrade skills: `npx skills update`, review the diff of each `SKILL.md`, commit with the lock file.
- `/retro` (if the loop is adopted) routes lessons into `CLAUDE.md`, `docs/agents/loop.md`, lint rules or CI — never into vendored skills.
