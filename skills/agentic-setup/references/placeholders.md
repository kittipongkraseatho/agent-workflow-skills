# Placeholders in `assets/`

Fill every `{{NAME}}`. When the repo has no answer, use the "If none" column; never leave a placeholder, and never invent a fact.

| Placeholder | Meaning | Example | If none |
|---|---|---|---|
| `PROJECT_NAME` | the system's name | `Vendor Hub` | the repo name |
| `READ_ORDER_EXTRA` | numbered lines continuing from `2.`: docs to read after `CLAUDE.md` | `2. docs/architecture.md — …` | delete the line |
| `INTEGRATION_BRANCH` | the branch PRs target | `develop` | the default branch |
| `SPEC_DIR` | folder for specs | `docs/specs` | `docs/specs` |
| `ID_PATTERN` | traceability ID as written in titles and folders | `REQ-NNN` | see "No traceability ID" |
| `ID_SLUG` | the same, lower case, for branch names | `req-NNN` | see below |
| `ID_EXAMPLE` | one concrete ID | `REQ-047` | see below |
| `COMMIT_CONVENTION` | how this repo writes commit and PR titles | `conventional commit plus the requirement ID, e.g. feat(scope): title (REQ-047)` | describe what `git log` shows, e.g. `plain imperative subject` |
| `TEST_SEAMS` | test layers, highest first, with paths | `e2e (apps/e2e), API integration (test/integration), unit` | the layers that exist |
| `SLICE_SHAPE` | the layers one vertical slice crosses | `contracts → API module → page` | `handler → service → storage`, or whatever the code shows |
| `CHECK_COMMAND` | the command that must be green | `make check` | the lint + test commands joined with `&&` |
| `EXTRA_CHECK` | starts with `, plus` — a second check for some changes | `, plus make test-int when it touched API or DB code` | empty |
| `HUMAN_ONLY_COMMANDS` | commands that write shared resources | `make migrate-dev, make seed-dev` | delete the bullet |
| `GIT_POLICY` | when an agent may commit, push, open a PR and merge, copied from the repo's rules | `Commit locally. Push and open a PR only when the human says so. Never merge.` | `Agents may commit and push work branches and open PRs. A human merges.` |
| `DRAFT_PR_LINE` | whether a draft PR opens at the start of implementation | `Open the draft PR with gh pr create --draft --base develop.` | if the repo forbids pushing before the human asks: `Do not push or open a PR yet; commits stay local until the human asks for the PR.` |
| `PR_READY_LINE` | how the PR becomes ready | `` `gh pr ready`. `` | if pushing waits for the human: `stop and wait for the human to ask for the PR.` |
| `TEST_CONCURRENCY` | starts with a space — a limit on running tests in parallel | `` Run the test suite one implementer at a time, because the integration tests share one database.`` | empty |
| `HUMAN_BOARD_LINE` | one sentence on the human tracker | `Jira ABC stays the human board: one card per requirement.` | delete the sentence |
| `MODULE_DOCS_LINE` | where per-module docs live | `The docs/wiki/ page of each module you touch (the code wins over it).` | `The README.` |
| `ADR_DIR` | ADR folder | `docs/adr` | `docs/adr` (created with the first ADR) |

## No traceability ID

The templates assume an ID. Without one:

- spec folders are `{{SPEC_DIR}}/<slug>/`, branches `feat/<slug>`, commits `docs: spec <title>` and `docs: tickets <title>`;
- remove the ID from the Traceability block in `loop.md` and keep its other lines;
- in `issue-tracker.md`, replace Publish step 1 with "Pick a short slug for the work."
