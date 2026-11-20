# Issue tracker: specs and tickets in git

Specs and tickets are markdown files committed under `{{SPEC_DIR}}/`, so the chain requirement → spec → ticket → commit → PR lives in one repository. {{HUMAN_BOARD_LINE}}

## Layout

- One folder per requirement: `{{SPEC_DIR}}/{{ID_PATTERN}}-<slug>/`.
- The spec is `spec.md` and opens with:

  ```md
  # {{ID_PATTERN}} — <title>

  **Status:** ready-for-agent · **Tracker:** <link> | none · **Date:** YYYY-MM-DD
  ```

- Tickets are `tickets/<NN>-<slug>.md`, one ticket per file, numbered from `01` in dependency order. `Blocked by:` lists ticket numbers.
- `Status:` takes one of `ready-for-agent`, `ready-for-human`, `in-progress`, `done`.
- Comments append under a `## Comments` heading at the bottom of the file.

## Publish ("publish to the issue tracker")

1. Use the requirement ID the conversation named, or ask the human for one.
2. Write the files under the folder above, on the work branch (see `docs/agents/loop.md`, `/to-spec`).
3. When a tracker card exists for the work, link the spec path from it. Card creation and status changes stay with the human.

## Fetch ("fetch the ticket")

Read the file at the path. `#03` or `T03` means `tickets/03-*.md` in the current spec folder.

## Frontier and closing

- **Frontier:** tickets with `Status: ready-for-agent` whose every `Blocked by` ticket is `done`.
- **Close:** after the ticket's work merges into the integration branch, set `Status: done`, tick its acceptance boxes, append `Done in: <commit sha>`, and commit.
- The PR lists the tickets it closes.
