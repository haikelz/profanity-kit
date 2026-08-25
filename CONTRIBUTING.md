# Contributing to Profanity Kit

## Prerequisites

- Node.js 22.13.0 or newer
- pnpm 11.23.0 through Corepack

## Local setup

```sh
corepack enable
pnpm install
pnpm check
```

`pnpm check` verifies formatting, linting, types, and tests. Lefthook installs
the same checks for commits and pushes during `pnpm install`.

## Commits and changesets

Use Conventional Commit messages, such as `feat: add a detector option` or
`fix(core): preserve original offsets`.

Run `pnpm changeset` for user-visible package changes. Documentation-only and
internal maintenance changes may omit a changeset.

## Pull requests

- Keep each pull request focused and explain the behavior it changes.
- Add tests for observable behavior.
- Run `pnpm check` before requesting review.
- Document relevant architectural tradeoffs and flag conflicts with an ADR.

By contributing, you agree that your contributions are licensed under the MIT
License.
