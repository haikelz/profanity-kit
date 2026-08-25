# ADR-005 — Monorepo, build, and code-quality tooling

**Status:** Provisional

## Context

The repository contains a publishable library and a private documentation app.
It needs workspace isolation without introducing orchestration overhead or
runtime dependencies.

## Decision

Use a pnpm workspace with one published package and one private docs app. Do not
adopt Turborepo or another task orchestrator in the MVP. Use exact tool versions.

Use tsdown for ESM and declaration builds with a neutral platform target, no
minification, and source maps. Maintain explicit package export maps manually.
Use Oxlint plus its type-aware path, Oxfmt, and `tsc --noEmit` as the
authoritative type check. Use Lefthook for local hooks and commitlint for
Conventional Commit messages.

## Technical reasoning

pnpm already supplies workspace linking, filtering, and deterministic lockfiles;
the small graph does not need remote caching or task scheduling. Unminified
library output produces better debugging and lets consumers' bundlers optimize
for their own targets. Oxc tools reduce feedback latency while TypeScript retains
final authority over semantic type correctness.

## Consequences

Build tooling belongs in root `devDependencies`. Nimbus, Astro, and Svelte are
dependencies of a private docs workspace. The published `profanity-kit` package
has no runtime dependencies. Root scripts provide a common interface for people,
hooks, CI, and agents, but exact script names may evolve during implementation.

## Reconsider when

Workspace task duration or graph complexity produces measured CI bottlenecks
that pnpm filtering and GitHub Actions caching cannot address.
