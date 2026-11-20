# Delivery loop

{{PROJECT_NAME}} rules for each step of the loop. They win over the vendored skill text; `CLAUDE.md` wins over both. A human starts every step.

| Step | Command | Ends with |
|---|---|---|
| 1 | `/grill-with-docs` | shared understanding confirmed by the human; terms in `GLOSSARY.md`; an ADR only when it qualifies |
| 2 | `/to-spec` | `{{SPEC_DIR}}/{{ID_PATTERN}}-<slug>/spec.md`, committed on the work branch |
| 3 | `/to-tickets` | `tickets/NN-*.md` approved by the human, committed on the same branch |
| 4 | `/implement-spec` | every ticket `done` on the integration branch, review fixed, PR to `{{INTEGRATION_BRANCH}}` ready |
| 5 | `/pr` | the PR body |
| 6 | `/retro` | ranked environment improvements; the human picks which to apply |

Tracker conventions: `docs/agents/issue-tracker.md`. Glossary and ADRs: `docs/agents/domain.md`.

## /grill-with-docs

Ask in the language the human writes in. Facts about the code come from a subagent reading the code, never from the human.

## /to-spec

- Create the work branch `feat/{{ID_SLUG}}-<slug>` from `origin/{{INTEGRATION_BRANCH}}`, in its own worktree so other sessions keep the main checkout. Commit the spec as `docs: {{ID_PATTERN}} spec <title>`.
- Test seams, highest first: {{TEST_SEAMS}}.
- Implementation Decisions name everything `CLAUDE.md` governs (permissions, schema and its migration, env vars, queues, docs to update). Quote UI strings exactly.
- Every endpoint in the spec lists its success, unauthorised and invalid-input cases.

## /to-tickets

- A ticket is a vertical slice through every layer it needs ({{SLICE_SHAPE}}), with its tests and doc lines. A migration rides in the first slice that needs it.
- Acceptance criteria carry the Definition of Done from `CLAUDE.md`.
- Commit the approved tickets on the work branch as `docs: {{ID_PATTERN}} tickets`.

## /implement-spec

- The integration branch is the work branch. Merge `origin/{{INTEGRATION_BRANCH}}` into it first when it is behind.
- Open the draft PR with `gh pr create --draft --base {{INTEGRATION_BRANCH}}`.
- Implementers run in worktrees (`Agent` with `isolation: "worktree"`), one branch per ticket. Each brief holds three pointers: the ticket, the spec, this file. Run at most three implementers at once.
- Each implementer loads the `CLAUDE.md` skill-table rows for the code it touches, then `tdd`. It reports done only after `{{CHECK_COMMAND}}` is green{{EXTRA_CHECK}}.
- Commands that touch shared resources ({{HUMAN_ONLY_COMMANDS}}) need the human; record the need under the ticket's `## Comments`.
- The merger merges into the integration branch, reruns `{{CHECK_COMMAND}}`, then closes the ticket.
- Run `code-review` with fixed point `origin/{{INTEGRATION_BRANCH}}` and the spec as its spec source, fix what it finds, write the body with `/pr`, then `gh pr ready`. The human reviews and merges.

## /pr

- Title: {{COMMIT_CONVENTION}}. Base `{{INTEGRATION_BRANCH}}`.
- Domain language comes from `GLOSSARY.md`, else from the docs of the module.
- Evidence: a screenshot for UI changes; for API changes, the tests with their success/unauthorised/invalid cases and the check output.
- After **Merge Danger**, add:

  ```md
  ## Traceability

  - **Requirement:** {{ID_EXAMPLE}} · **Tracker:** <link> · **Spec:** {{SPEC_DIR}}/<folder>/spec.md
  - **Tickets:** 01 … NN done
  - **Docs:** pages updated · ADR (if any)
  - **Checks:** {{CHECK_COMMAND}}{{EXTRA_CHECK}}
  ```

## /retro

- Claude Code session logs: `~/.claude/projects/<repo path, separators as dashes>/*.jsonl`.
- Route each fix to its home:
  - a mechanical rule becomes a lint rule, a test, or a CI job;
  - a review-time judgement call goes in `CODING_STANDARDS.md` at the repo root (create it lazily; `code-review` reads it);
  - a navigation gap becomes a docs line, or one pointer line in `CLAUDE.md`;
  - a vendored skill's behaviour changes here, in this file; vendored skills stay as pinned in `skills-lock.json`.
- Apply only the candidates the human picks, on a `chore/` branch, PR to `{{INTEGRATION_BRANCH}}`.

## code-review

This project skill replaces Claude Code's built-in `/code-review`. Standards sources: `CLAUDE.md`, `CODING_STANDARDS.md` when present, and the docs of the touched modules. A breach of a `CLAUDE.md` rule or of its Definition of Done is a hard violation.
