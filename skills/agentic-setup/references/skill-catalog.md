# Skill catalog

Sources vetted in daily use on a production monorepo (pinned there in `skills-lock.json`). Install with:

```bash
npx skills add <source> --skill <name> -a claude-code -a codex --copy
```

`--copy` writes real files into `.claude/skills/` and `.agents/skills/` (not symlinks), and the CLI records each one's source and hash in `skills-lock.json`. Several `--skill` flags can share one call when they come from the same source.

## Core set (every repo)

These carry the workflow. They do not depend on the stack.

| Skill | Source | Used for |
|---|---|---|
| `tdd` | `mattpocock/skills` | new feature, bug fix, integration tests |
| `diagnosing-bugs` | `mattpocock/skills` | something broken, throwing, failing or slow: find the cause first |
| `code-review` | `mattpocock/skills` | review a branch or PR on two axes (standards + spec) |
| `pr` | `mattpocock/skills` | write the PR body |
| `documentation-and-adrs` | `addyosmani/agent-skills` | update docs with a behaviour change; ADR for hard-to-reverse decisions |
| `living-docs-governance` | `affaan-m/ecc` | docs drifted from code; give each doc one role |
| `writing-for-agents` | `mattpocock/skills` | writing CLAUDE.md, skills and other agent-facing text |

## Delivery loop set (when the repo adopts the loop)

| Skill | Source | Step |
|---|---|---|
| `grill-with-docs`, `grilling`, `domain-modeling` | `mattpocock/skills` | 1 — shared understanding, glossary, ADRs |
| `to-spec` | `mattpocock/skills` | 2 — spec |
| `to-tickets` | `mattpocock/skills` | 3 — tickets |
| `implement-spec` | `mattpocock/skills` | 4 — parallel implementers in worktrees |
| `retro` | `mattpocock/skills` | 6 — improve the environment from session logs |

`grill-me` (same source) is for a human to call on purpose; install it only when asked.

## Stack sets

| Stack signal | Skill | Source |
|---|---|---|
| `@nestjs/core` | `nestjs-best-practices` | `kadajett/agent-nestjs-skills` |
| `nuxt` | `nuxt`, `vue`, `nuxt-ui` (if `@nuxt/ui`) | `onmax/nuxt-skills` |
| `nuxt` 4 | `nuxt4-patterns` | `affaan-m/ecc` |
| `vue` without Nuxt | `vue` | `onmax/nuxt-skills` |
| `redis` / `ioredis` / BullMQ | `redis-core` | `redis/agent-skills` |
| a web front end where speed matters | `performance` | `addyosmani/web-quality-skills` |
| `go.mod` | `golang-patterns`, `golang-testing` | `affaan-m/ecc` |
| `react` / `next` | `vercel-react-best-practices` | `vercel-labs/agent-skills` |

A stack skill is general advice, so some of its rules will not fit the repo (a linter the repo does not use, a testing style it does not follow). List each such rule under the Skills table in `CLAUDE.md` as an override.

Check the version a skill is written for against the version in the manifest before proposing it. For example the skills in `prisma/skills` target Prisma 7, so a repo on Prisma 6 gets none of them.

Not in the table (Python, .NET, Flutter, …): search, then show the human what you found before installing. A bare search mostly returns unknown authors, so search the owners in this catalog first:

```bash
npx skills find <stack> --owner <owner>    # affaan-m, addyosmani, mattpocock, onmax, vercel-labs, the framework's own org
npx skills find <stack>                    # only if the owners above have nothing
```

Prefer a skill from the framework's own organisation or a well-known author over an unknown one. Read its `SKILL.md` before proposing it: a skill is instructions the agent will follow, so an unknown one is untrusted input until someone has read it. To read one without installing it:

```bash
gh api repos/<owner>/<repo>/contents/skills/<name>/SKILL.md -H "Accept: application/vnd.github.raw"
```

If nothing trustworthy exists, install no stack skill and say so. The core set works without one.

## Skills that should not go in a dev repo

Design and animation skills (`animate`, `apple-design`, `better-ui`, …), `caveman` and `karpathy-llm-wiki` are not dev workflow. Add them only when the human asks.
