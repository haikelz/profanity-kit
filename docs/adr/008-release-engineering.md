# ADR-008 — Release engineering and repository workflow

**Status:** Provisional

## Context

Releases need intentional semantic versioning, understandable changelogs,
reproducible validation, and no long-lived npm credential. Dependency updates
must not flood a small project with unrelated pull requests.

## Decision

Use Changesets to record user-visible version intent in each relevant PR and to
maintain the release PR and changelog. Use Conventional Commits for PR titles
and squash merge so each merged PR becomes one readable commit. Changesets—not
commit parsing—are the source of version bumps. Docs-only and internal changes
may omit changesets.

Publish through GitHub Actions and npm Trusted Publishing with provenance. Only
the release workflow receives `id-token: write`; no npm token is stored. Pin
Actions to commit SHAs, use least privilege, serialize releases, and require
quality/package/docs checks as applicable.

Use Renovate weekly with related toolchains grouped, major upgrades separated,
a dependency dashboard, and no automerge during MVP. It covers root tooling,
the private docs app, and GitHub Actions without changing the library's
zero-runtime-dependency claim.

## Technical reasoning

Conventional Commits describe engineering history; Changesets describe consumer
impact. Keeping those concerns separate avoids inaccurate automated versioning.
Trusted Publishing removes a reusable secret. Renovate offers the grouping and
policy control needed for exact pins across a monorepo.

## Consequences

Contributors learn one additional small Markdown artifact for user-visible
changes. The first release must include a dry-run and a complete PR-to-publish
simulation. Prereleases use the `next` channel; `1.0.0` waits for stable API,
corpus, bundle evidence, documentation, and Qalbwise integration feedback.

## Reconsider when

Repository hosting changes, npm Trusted Publishing becomes unavailable, or the
maintenance cost of Changesets exceeds its demonstrated release value.
