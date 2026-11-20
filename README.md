# agent-skills
[![skills.sh](https://skills.sh/b/kittipongkraseatho/agent-skills)](https://skills.sh/kittipongkraseatho/agent-skills)

**English** · [ไทย](README.th.md)

Skills for AI coding agents (Claude Code and Codex). There is one so far: **`agentic-setup`**.

## What agentic-setup does

You ask once, and the AI sets up your repo so every agent works the same way:

1. **It reads the rules from one file**, `CLAUDE.md`.
2. **It loads the skill that fits the task before touching code**, because a hook reminds it on every prompt.
3. **It follows the same steps** from request to pull request, with a human approving at the key points.

## How to use it

**1. Install the skill** (needs Node.js):

```bash
npx skills add kittipongkraseatho/agent-skills --skill agentic-setup -g
```

`-g` installs it for your whole machine, so it works in every repo.

**2. Open Claude Code in the repo and type:**

```text
Set up the agentic setup for this repo
```

**3. Answer a few short questions** the AI cannot read from the code, such as your non-negotiable rules and which branch PRs target. Then confirm the list of skills to install.

**4. Review and merge the PR** the AI opens.

## What you get in the repo

| File | What it is for |
|---|---|
| `CLAUDE.md` | All the repo's rules, plus a table of which skill fits which task |
| `AGENTS.md` | Points Codex and other agents at `CLAUDE.md` (no duplicated rules) |
| `.claude/hooks/skill-reminder.mjs` | A hook that reads the skill table from `CLAUDE.md` and reminds the AI on every prompt |
| `.claude/skills/` and `.agents/skills/` | The same skills for Claude Code and Codex |
| `skills-lock.json` | Pins each skill's version so the whole team gets the same copy |
| `docs/agents/` | The rules for each step of the delivery loop (optional) |

## How the AI works afterwards

```text
you give a task
  → the hook reminds the AI of the skill table
  → the AI reads the rules in CLAUDE.md and loads the matching skill
  → talk it through → write a spec → split into tickets   (you approve)
  → write code test-first
  → run lint + tests until green → the AI reviews its own code
  → open a PR                                             (you review and merge)
  → /retro feeds lessons back into the rules
```

Small tasks can skip the spec and tickets steps.

## Which stacks it works with

Any stack. The workflow does not depend on the language. For stack-specific skills there is a vetted list covering NestJS, Nuxt, Vue, Redis and Go. For anything else, the AI searches and lets you choose before it installs.

Tested on a NestJS + Nuxt monorepo and on a Go service.

## Check that the setup is complete

```bash
node ~/.claude/skills/agentic-setup/scripts/verify.mjs .
```

It passes when the last line reports every check passed.

## License

[MIT](LICENSE)
