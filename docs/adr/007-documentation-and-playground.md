# ADR-007 — Documentation and playground architecture

**Status:** Provisional

## Context

Documentation, runnable examples, and agent-readable material are part of the
package's DX. They must not introduce dependencies into the runtime package or
drift into multiple manually maintained versions.

## Decision

Build the documentation with Cloudflare Nimbus, pinned to an exact version and
validated in CI. Generate API Markdown from TypeScript/JSDoc. Provide Markdown
page equivalents, `llms.txt`, and `llms-full.txt` from the same content sources.

Implement the interactive playground as an isolated Svelte 5 Astro island using
the official Astro integration and `client:visible`. Use kebab-case component
filenames with PascalCase import identifiers. The playground exposes language
selection, custom block/allow lists, replacement configuration, all primary API
outputs, and copyable code matching its state.

## Alternatives considered

Starlight is mature but does not match the selected product direction. React
would be familiar but the playground is intentionally isolated so Svelte can be
learned without affecting package consumers. A fully client-rendered docs site
would ship unnecessary JavaScript.

## Consequences

Nimbus's pre-1.0 API is a manageable docs-only risk, not a runtime-package risk.
The docs workspace is private. Public API examples must compile in CI, and agent
documents must state unsupported behavior to reduce hallucinated APIs.

## Reconsider when

Nimbus stability or maintenance blocks upgrades/builds, or the Svelte island
cannot meet playground accessibility and bundle requirements.
