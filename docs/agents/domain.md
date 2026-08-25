# Domain Docs

How engineering skills should consume this repository’s domain documentation.

## Before exploring, read these

- `CONTEXT.md` at the repository root.
- `CONTEXT-MAP.md` if it exists; it points to context-specific documents.
- Relevant architectural decisions under `docs/adr/`.

If one of these files does not exist, proceed silently. Domain-modeling workflows create missing documentation when terms or decisions are resolved.

## File structure

This repository uses a single-context layout:

```text
/
├── CONTEXT.md
├── docs/
│   └── adr/
├── packages/
│   └── profanity-kit/
└── apps/
    └── docs/
```

## Use the glossary’s vocabulary

When output names a domain concept—in issue titles, refactor proposals, hypotheses, or test names—use the term defined in `CONTEXT.md`. Avoid synonyms that the glossary explicitly rejects.

If a needed concept is absent, reconsider whether it belongs to the project’s language or note the gap for domain modeling.

## Flag ADR conflicts

If proposed work contradicts an existing ADR, identify that conflict explicitly instead of silently overriding the decision.
