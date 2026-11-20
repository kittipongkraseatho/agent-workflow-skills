# Domain docs

How the engineering skills read and write this repo's domain documentation.

## Read before exploring

- `GLOSSARY.md` at the repo root.
- {{MODULE_DOCS_LINE}}
- ADRs in `{{ADR_DIR}}/` that touch the area.

A missing file means it has not been needed yet: proceed silently. `/domain-modeling` creates `GLOSSARY.md` when the first term is resolved.

## Glossary

Name each term the way the business and the UI say it, with the name the code uses beside it. Use glossary terms in specs, tickets, test names and PR bodies.

## ADRs

- File name `{{ADR_DIR}}/ADR-<NNN>-<slug>.md`, the next number after the highest in the folder.
- Layout: `# ADR-NNN — <title>`, then a `**Status:** · **Date:** · **Requirement:**` line, then `## Context`, `## Decision`, `## Alternatives considered`, `## Consequences`.
- A new ADR starts as `Proposed`; the owner accepts it.
- Offer an ADR only for a decision that is hard to reverse (framework, core schema, auth, infra).

## Conflicts

When your output contradicts an ADR or `CLAUDE.md`, say so explicitly and stop for the human.
