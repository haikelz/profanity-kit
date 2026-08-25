# Profanity Kit

A lightweight, multilingual profanity detector for JavaScript and TypeScript.

Profanity Kit is designed for applications that need predictable, synchronous
word filtering without shipping a moderation service or an opaque machine
learning model. It prioritizes Unicode-aware whole-word matching, explicit
language selection, useful match metadata, and controlled false positives.

> [!IMPORTANT]
> Profanity Kit is in early development and is not yet published to npm. The
> examples below describe the accepted API contract that is being implemented.
> Follow the [implementation plan](./IMPLEMENTATION_PLAN.md) for current progress.

## Why Profanity Kit?

- **Predictable matching** — dictionary-based detection produces deterministic
  results and never depends on a network request.
- **Unicode-aware boundaries** — words are tokenized using Unicode properties,
  avoiding the ASCII limitations of JavaScript's `\b` boundary.
- **Language-pack isolation** — applications can import English, Indonesian, or
  both without silently bundling an unused dictionary.
- **Transparent results** — inspect every occurrence, its original source
  offsets, its language dictionaries, and whether it came from a custom list.
- **Immutable configuration** — reusable detector instances have no shared
  mutable dictionary or callback-unsafe `this` behavior.
- **Runtime agnostic** — the core is synchronous and avoids Node, DOM,
  filesystem, network, and environment APIs.
- **Zero runtime dependencies** — the published library is designed to remain
  self-contained.

## Planned API

### English by default

The root entry point is the zero-configuration English convenience API:

```ts
import { createDetector } from "profanity-kit";

const detector = createDetector();

detector.check("This contains a blocked word."); // true
detector.isClean("This sentence is safe."); // true
detector.findAll("A blocked word appears twice: word, word.");
detector.filter("Replace the blocked word.");
```

### Select languages explicitly

The dictionary-free core keeps language choice structural and bundle-friendly:

```ts
import { createDetector } from "profanity-kit/core";
import { indonesian } from "profanity-kit/languages/id";

const detector = createDetector({
  languages: [indonesian],
});
```

Use multiple packs when an application accepts content in more than one
language:

```ts
import { createDetector } from "profanity-kit/core";
import { english } from "profanity-kit/languages/en";
import { indonesian } from "profanity-kit/languages/id";

const detector = createDetector({
  languages: [english, indonesian],
});
```

Language packs are deliberately not re-exported from the package root. An
Indonesian-only application should not pay the bundle cost of English data.

### Customize a detector

Configuration is captured when a detector is created:

```ts
const detector = createDetector({
  languages: [indonesian],
  allowList: ["allowed-project-term"],
  blockList: ["blocked-project-term"],
  replacement: "*",
});
```

Dictionary precedence is:

```text
allowList > blockList > built-in language dictionaries
```

Changing configuration means creating another detector. Profanity Kit does not
expose global `addWords()` or `removeWords()` mutation.

### Inspect matches

`findAll()` returns every occurrence in source order, including repeats:

```ts
const matches = detector.findAll("goblok, jangan goblok");

// [
//   {
//     value: "goblok",
//     normalized: "goblok",
//     start: 0,
//     end: 6,
//     languages: ["id"],
//     source: "dictionary",
//   },
//   {
//     value: "goblok",
//     normalized: "goblok",
//     start: 15,
//     end: 21,
//     languages: ["id"],
//     source: "dictionary",
//   },
// ]
```

Offsets refer to UTF-16 code units in the original input, matching JavaScript's
string indexing and slicing behavior.

## Matching semantics

Profanity Kit matches complete words rather than arbitrary substrings. A short
dictionary entry therefore does not match when it only appears inside a longer
word. Related terms must be listed independently.

The MVP tokenizer treats Unicode letters, combining marks, and numbers as word
characters. Apostrophes, hyphens, underscores, punctuation, and whitespace are
boundaries. Input is normalized to NFC and lowercased for lookup while original
text and offsets are preserved in results.

The initial release intentionally does not attempt:

- contextual moderation or toxicity classification;
- phrase or substring matching;
- aggressive leetspeak or evasion detection;
- automatic diacritic folding;
- mutable global dictionaries.

These boundaries keep behavior explainable and reduce surprising false
positives.

## Runtime and package targets

The planned package exports are:

```text
profanity-kit
profanity-kit/core
profanity-kit/languages/en
profanity-kit/languages/id
```

Profanity Kit targets modern browsers and Node.js 22.13.0 or newer. It publishes
one synchronous ESM implementation with TypeScript declarations. Modern Node
`require()` support will resolve to that same ESM graph instead of a duplicate
CommonJS build.

## Development

### Prerequisites

- Node.js 22.13.0 or newer
- pnpm 11.23.0 through Corepack

### Set up the workspace

```sh
corepack enable
pnpm install
pnpm check
```

The root validation command runs formatting checks, type-aware linting,
TypeScript checks for every workspace, and tests.

Useful commands:

```sh
pnpm format          # Format the workspace with Oxfmt
pnpm lint            # Run type-aware Oxlint
pnpm typecheck       # Type-check all workspaces
pnpm test            # Run Vitest once
pnpm test:watch      # Run Vitest in watch mode
pnpm build           # Build the publishable package
pnpm changeset       # Describe a user-visible package change
```

Lefthook installs local formatting, linting, commit-message, and pre-push
checks. Commits follow the Conventional Commits format.

## Repository layout

```text
.
├── apps/docs/                    Documentation application
├── packages/profanity-kit/       Publishable library
├── docs/adr/                     Architectural decision records
├── API_DESIGN.md                 Detailed public API contract
├── CONTEXT.md                    Shared domain vocabulary
└── IMPLEMENTATION_PLAN.md        Phased delivery plan and gates
```

The project uses a pnpm workspace without a separate task orchestrator. Root
tooling validates the private docs application and publishable package together,
while `profanity-kit` keeps an empty runtime dependency set.

## Roadmap

The project is being delivered through evidence-based phases:

1. Repository foundation
2. Matcher proof of concept
3. Package boundaries and artifact validation
4. Deterministic dictionary pipeline
5. Performance and bundle evidence
6. Documentation MVP
7. Release rehearsal and real-project integration

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for each phase's scope and
completion gate. Detailed API decisions live in
[API_DESIGN.md](./API_DESIGN.md), with architectural rationale under
[docs/adr](./docs/adr/).

## Contributing

Contributions are welcome once they align with the documented API and
architectural decisions. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening
a pull request. Bug reports and design discussions belong in
[GitHub Issues](https://github.com/up2dul/profanity-kit/issues).

Dictionary contributions require special care: every distributed entry must be
human-reviewed and backed by compatible licensing or project-owned curation.
Public availability alone is not permission to copy a word list.

## License

Profanity Kit source code is available under the [MIT License](./LICENSE).
