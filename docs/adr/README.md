# Profanity Kit — Architecture Decision Records

This directory records why important technical decisions were made. ADRs are
learning material and a guard against repeating the same design discussion.
They describe the chosen direction, rejected alternatives, consequences, and
conditions that justify reconsideration.

## Status vocabulary

- **Accepted:** current direction.
- **Provisional:** accepted for the MVP but must be validated by implementation.
- **Superseded:** replaced by a later ADR.

## Index

1. [ADR-001 — Immutable factory and public API](./001-immutable-factory-and-api.md)
2. [ADR-002 — Package exports, ESM, and runtime contract](./002-package-exports-and-runtime.md)
3. [ADR-003 — Unicode matching algorithm](./003-unicode-matching-algorithm.md)
4. [ADR-004 — Dictionary architecture and provenance](./004-dictionary-architecture.md)
5. [ADR-005 — Monorepo, build, and code-quality tooling](./005-tooling-and-monorepo.md)
6. [ADR-006 — Testing, performance, and bundle validation](./006-testing-performance-and-bundles.md)
7. [ADR-007 — Documentation and playground architecture](./007-documentation-and-playground.md)
8. [ADR-008 — Release engineering and repository workflow](./008-release-engineering.md)
9. [ADR-009 — Licensing and AI-assisted dictionary curation](./009-licensing-and-ai-curation.md)

## Maintenance rule

An ADR records a consequential decision, not every script or configuration
value. Commands, exact tool versions, and performance budgets may evolve during
implementation without a new ADR unless they change the architectural tradeoff.
