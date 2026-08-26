# Profanity Kit — Public API Design

> Proposed public API contract for `profanity-kit`.

**Status:** Draft 0.3 — API and architecture decisions consolidated
**Package:** `profanity-kit`
**Primary language:** TypeScript
**Default dictionary:** English (`en`)

## 1. Purpose

`profanity-kit` is a modular, strongly typed profanity detector for JavaScript and TypeScript applications. It is designed for user-generated content across browser, server, mobile, and edge runtimes.

The initial release prioritizes:

- predictable whole-word detection;
- first-class English and Indonesian support;
- small, explicitly selected language packs;
- structured match information;
- clear TypeScript types and editor documentation;
- runtime-agnostic, synchronous APIs;
- controlled false positives over aggressive evasion detection.

It is not intended to provide contextual moderation, toxicity classification, or machine-learning-based judgment.

## 2. Design principles

### 2.1 Predictable by default

The same input and configuration must always produce the same output. Detection is dictionary-based and synchronous.

### 2.2 Whole words only

Dictionary entries match complete words, not arbitrary substrings.

- `ass` does not match `classic`.
- `ass` does not automatically match `asshole`.
- Detecting `asshole` requires `asshole` to exist in an active dictionary.

Word boundaries must be Unicode-aware and must not rely exclusively on JavaScript's ASCII-oriented `\b` behavior.

### 2.3 Modular language packs

Applications should not ship unused dictionaries. Importing Indonesian only must not include the English dictionary in the resulting application bundle.

### 2.4 Transparent results

Boolean validation is convenient, but callers must also be able to inspect every match, including repeated occurrences, its original position, and its source language.

### 2.5 Immutable detector configuration

A detector's active languages, allowlist, blocklist, and replacement options are fixed when it is created. Creating a new detector is preferred over mutating shared state.

This enables safe matcher caching and avoids global-state bugs.

## 3. Package entry points

The root entry is the zero-configuration English convenience entry:

```ts
import { createDetector } from "profanity-kit";

const detector = createDetector();
```

The dictionary-free core and dedicated language entry points provide explicit bundle control:

```ts
import { createDetector } from "profanity-kit/core";
import { indonesian } from "profanity-kit/languages/id";
```

Planned package exports:

```json
{
  ".": "./dist/index.js",
  "./core": "./dist/core/index.js",
  "./languages/en": "./dist/languages/en.js",
  "./languages/id": "./dist/languages/id.js"
}
```

Language packs are not re-exported from the root. This prevents an Indonesian-only application from accidentally including English.

All public entry points provide one synchronous ESM implementation and TypeScript declarations. On supported modern Node.js versions, `require()` resolves to the same ESM files; no duplicate `.cjs` build is published. Top-level `await` is prohibited throughout the public module graph.

## 4. Quick start

English is the convenience default:

```ts
import { createDetector } from "profanity-kit";

const profanity = createDetector();

profanity.check("This contains a bad word.");
profanity.isClean("This text is safe.");
profanity.findAll("This contains a bad word.");
profanity.filter("This contains a bad word.");
```

Indonesian only:

```ts
import { createDetector } from "profanity-kit/core";
import { indonesian } from "profanity-kit/languages/id";

const profanity = createDetector({
  languages: [indonesian],
});
```

Multiple languages:

```ts
import { createDetector } from "profanity-kit/core";
import { english } from "profanity-kit/languages/en";
import { indonesian } from "profanity-kit/languages/id";

const profanity = createDetector({
  languages: [english, indonesian],
});
```

## 5. Detector factories

### `createDetector(options?)`

Creates an immutable, reusable detector instance. The root and `/core` entry points deliberately expose different configuration contracts.

Root entry, fixed to English:

```ts
declare function createDetector(
  options?: DetectorOptions
): ProfanityDetector<"en">;
```

Dictionary-free `/core` entry, requiring explicit languages:

```ts
declare function createDetector<
  const TLanguages extends readonly LanguagePack[],
>(
  options: LanguageDetectorOptions<TLanguages>
): ProfanityDetector<LanguageCodeOf<TLanguages[number]>>;
```

Example:

```ts
const profanity = createDetector({
  languages: [indonesian],
  allowList: ["safe-word"],
  blockList: ["project-specific-word"],
  replacement: "*",
});
```

## 6. Configuration

```ts
interface DetectorOptions {
  /** Additional whole-word entries blocked for this detector. */
  blockList?: readonly string[];

  /** Entries that must remain allowed, including built-in dictionary entries. */
  allowList?: readonly string[];

  /** Single Unicode code point used by filter(). Defaults to "*". */
  replacement?: string;
}

interface LanguageDetectorOptions<
  TLanguages extends readonly LanguagePack[],
> extends DetectorOptions {
  /** Explicit active language dictionaries. Must not be empty. */
  languages: TLanguages;
}
```

The root factory does not accept `languages`; it always uses English. Explicit single- or multi-language configuration uses `/core`. This avoids an API that appears tree-shakeable while silently retaining the root English dictionary.

### 6.1 Dictionary precedence

When entries overlap, the precedence is:

```text
allowList > blockList > built-in language dictionaries
```

An allowlisted entry must never be returned by `check()`, `findAll()`, or `filter()`.

### 6.2 Configuration validation

The factory must reject:

- empty language arrays;
- empty strings;
- whitespace-only entries;
- non-string dictionary entries at runtime;
- replacement strings that do not contain exactly one Unicode code point.

Duplicate entries are normalized and deduplicated. Input arrays must never be mutated.

## 7. Detector API

```ts
interface ProfanityDetector<TLanguage extends string = string> {
  /** Returns true as soon as the first match is found. */
  check(input: string): boolean;

  /** Returns true when the input contains no matches. */
  isClean(input: string): boolean;

  /** Returns every occurrence in source order, including duplicates. */
  findAll(input: string): ProfanityMatch<TLanguage>[];

  /** Replaces every detected word while preserving the remaining input. */
  filter(input: string, options?: FilterOptions): string;
}
```

### 7.1 `check(input)`

Returns `true` when at least one active dictionary entry is found.

```ts
profanity.check("dasar goblok"); // true
profanity.check("kalimat aman"); // false
```

Implementation should stop after the first confirmed match.

### 7.2 `isClean(input)`

The semantic inverse of `check()`.

```ts
profanity.isClean("kalimat aman"); // true
```

This method is intended to work naturally as a validation predicate.

```ts
const isClean = profanity.isClean;
```

Public methods must not require manual `this` binding. Implementations may use closures or bound methods.

### 7.3 `findAll(input)`

Returns all matches in their original order. Repeated matches are returned repeatedly.

```ts
const matches = profanity.findAll("goblok, jangan goblok");

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

### 7.4 `filter(input, options?)`

Returns a copy of the input with every match replaced.

```ts
profanity.filter("dasar goblok");
// "dasar ******"
```

Per-call replacement override:

```ts
profanity.filter("dasar goblok", { replacement: "#" });
// "dasar ######"
```

`filter()` must preserve whitespace, punctuation, casing outside matched spans, and the original string when no match is found.

## 8. Match result

```ts
interface ProfanityMatch<TLanguage extends string = string> {
  /** Exact substring found in the original input. */
  value: string;

  /** Normalized form used for dictionary lookup. */
  normalized: string;

  /** UTF-16 code-unit offset where the match starts. */
  start: number;

  /** Exclusive UTF-16 code-unit offset where the match ends. */
  end: number;

  /** Active dictionaries containing the normalized entry. */
  languages: readonly TLanguage[];

  /** Whether the entry came from a language dictionary or custom blockList. */
  source: "dictionary" | "custom";
}
```

### 8.1 Why `languages` is an array

The same normalized entry may exist in multiple active dictionaries. Returning all matching language codes avoids arbitrary attribution and still returns only one occurrence for the same source span.

For custom entries, `languages` is an empty array and `source` is `"custom"`.

### 8.2 Offset semantics

`start` and `end` follow JavaScript string indexing and `String.prototype.slice()` semantics:

```ts
input.slice(match.start, match.end) === match.value;
```

This contract must be documented because Unicode code points and JavaScript UTF-16 offsets are not always equivalent.

## 9. Language packs

```ts
interface LanguagePack<TCode extends string = string> {
  readonly code: TCode;
  readonly name: string;
  readonly version: string;
  readonly words: readonly string[];
  readonly normalization?: {
    readonly caseLocale?: string;
  };
}
```

Built-in packs:

```ts
declare const english: LanguagePack<"en">;
declare const indonesian: LanguagePack<"id">;
```

Custom language packs are supported without registering them globally:

```ts
const communityPack = {
  code: "xx",
  name: "Example language",
  version: "1.0.0",
  words: ["example"],
} as const satisfies LanguagePack<"xx">;

const profanity = createDetector({
  languages: [communityPack],
});
```

`words` remains publicly inspectable and readonly. Built-in packs freeze their public data. A detector snapshots custom pack data during initialization, so later external mutation cannot change an existing detector.

Language packs must be treated as data. They must not contain runtime-specific behavior. Locale-specific casing is declarative. Internally, normalization is a staged pipeline so a future optional pack-level diacritic policy can be added to `LanguagePack` without changing the detector methods or existing pack objects.

Each built-in dictionary has its own version. Full provenance is separately tree-shakeable:

```ts
import { indonesian, indonesianMetadata } from "profanity-kit/languages/id";
```

```ts
interface LanguagePackMetadata {
  readonly code: string;
  readonly version: string;
  readonly updatedAt: string;
  readonly license: string;
  readonly sources: readonly {
    readonly name: string;
    readonly url: string;
  }[];
}
```

Importing only `indonesian` must allow bundlers to remove `indonesianMetadata`. Detailed curation methodology and dictionary changelogs live in the documentation rather than the production data object.

## 10. Normalization and matching contract

MVP normalization:

1. preserve the original input for offsets and output;
2. compare case-insensitively using `toLowerCase()` by default;
3. recognize Unicode-aware word boundaries;
4. match complete dictionary entries only;
5. do not match phrases;
6. do not collapse or remove characters to discover hidden words.

A language pack may declaratively supply `caseLocale` when its casing rules require locale-aware normalization. English and Indonesian use the default. Diacritics are preserved in MVP. The normalization pipeline must nevertheless keep diacritic handling as a distinct internal stage so a future optional pack-level `"fold"` policy can be added without changing `createDetector()`, `check()`, `findAll()`, or `filter()`.

Normalization is applied to each token while offsets continue to reference the original input.

An MVP word consists of one or more Unicode letters, combining marks, or numbers. These characters are word boundaries rather than word characters:

- straight and curly apostrophes (`'`, `’`);
- hyphens (`-`);
- underscores (`_`);
- whitespace and other punctuation.

Consequently, `ass-hole` tokenizes as `ass` and `hole`, while `classic` remains one token and never matches `ass`.

Explicitly unsupported in MVP:

- substring matching;
- multi-word phrase matching;
- leetspeak substitution;
- homoglyph conversion;
- separated-letter detection;
- repeated-character collapsing;
- contextual severity or intent classification;
- fuzzy matching;
- machine-learning moderation.

Diacritic folding must not be enabled for a pack without dedicated false-positive tests for that language.

## 11. Filtering options

```ts
interface FilterOptions {
  /** Overrides the detector-level replacement Unicode code point. */
  replacement?: string;
}
```

For MVP, `replacement` must contain exactly one Unicode code point and repeats to match the detected substring's Unicode code-point length:

```ts
"goblok" -> "******"
```

Empty strings and multi-code-point replacements are rejected. Validation must use code-point iteration rather than JavaScript's UTF-16 `.length`.

Alternative strategies—fixed token, preserve first character, preserve last character, or callback replacer—are deferred until real use cases justify the additional API surface. Internally, filtering must keep replacement as a distinct pipeline stage so future strategies can be added through new options without changing the meaning of the MVP `replacement` property.

## 12. Error behavior

Invalid configuration throws synchronously during `createDetector()`.

```ts
class ProfanityKitError extends Error {
  readonly code:
    | "INVALID_LANGUAGE_PACK"
    | "EMPTY_LANGUAGE_LIST"
    | "INVALID_DICTIONARY_ENTRY"
    | "INVALID_REPLACEMENT";
}
```

Runtime methods require a string. JavaScript callers that pass a non-string value receive a descriptive `TypeError`; values are not coerced implicitly.

```ts
profanity.check(null); // TypeError
profanity.check(123); // TypeError
```

## 13. Zod integration

Zod is not a core dependency. The initial documentation provides an integration recipe using `isClean()`:

```ts
import { z } from "zod";
import { createDetector } from "profanity-kit/core";
import { indonesian } from "profanity-kit/languages/id";

const profanity = createDetector({
  languages: [indonesian],
});

const commentSchema = z.string().refine(profanity.isClean, {
  message: "Contains inappropriate language",
});
```

A dedicated `profanity-kit/zod` adapter is deferred until repeated integration pain is observed. If introduced, Zod must remain an optional peer dependency and must not enter the core bundle.

## 14. Documentation contract

Every public export must include TSDoc/JSDoc with:

- a concise purpose;
- parameter and return behavior not already obvious from its type;
- relevant default values;
- at least one example for primary APIs;
- edge cases or thrown errors where applicable.

The documentation website should contain:

- introduction and positioning;
- quick start;
- English, Indonesian-only, and multilingual guides;
- custom blocklist and allowlist guides;
- API reference generated from source comments;
- runtime compatibility guide;
- Zod integration recipe;
- interactive playground;
- bundle-size guidance;
- explicit unsupported-feature documentation.

Machine-readable documentation should expose:

```text
/llms.txt
/llms-full.txt
```

Both files must be generated from the same documentation source as the website to prevent drift. They must state exact imports, return types, defaults, supported behavior, and unsupported behavior.

## 15. Runtime compatibility

Core detection must not depend on:

- Node.js built-ins;
- DOM APIs;
- network access;
- filesystem access;
- environment variables;
- runtime initialization side effects.

The package publishes modern ESM without polyfills or a legacy browser build.

Official Node.js support starts at `22.13.0`. Both native ESM import and synchronous `require(ESM)` must be tested against every public entry point. Older Node.js versions are not part of the support contract.

Browser runtimes must natively support ESM, every syntax and built-in used by the published build target, and Unicode property escapes. The initial policy is **Baseline Widely Available browsers**, without promising exact minimum browser versions before the final build output is available.

The architecture plan must select an explicit JavaScript build target. Exact browser versions become an official compatibility matrix only after the published artifacts—not merely individual language features—pass integration tests in those versions.

Internet Explorer, Edge Legacy, and runtimes that require polyfills or Unicode-regex transpilation are unsupported.

Edge runtimes, Bun, Deno, React Native, and Hermes may be described as architecture-compatible, but each receives an "officially supported" label only after a real integration test is added to CI. React Native compatibility specifically requires a JavaScript engine with native Unicode property escapes.

## 16. Performance and bundle requirements

The implementation must support these architectural properties:

- matcher compilation occurs once per detector configuration;
- `check()` exits on the first match;
- `findAll()` performs a complete scan;
- `filter()` assembles output from source segments instead of repeatedly slicing the growing output string;
- equivalent normalized dictionary entries are deduplicated;
- unused language packs are tree-shakeable;
- importing `profanity-kit/languages/id` does not import English;
- no runtime dependencies unless a concrete need is demonstrated.

Benchmark coverage should include:

- short UGC input;
- long text;
- no-match input;
- early match and late match;
- repeated matches;
- one language and multiple languages;
- custom dictionaries;
- bundle-size verification per entry point.

## 17. API stability rules

Before `1.0.0`, breaking changes are allowed but must be documented in release notes.

After `1.0.0`:

- removing or renaming a public export is breaking;
- changing match offset semantics is breaking;
- changing dictionary precedence is breaking;
- changing default language is breaking;
- changing default matching behavior is breaking;
- adding dictionary entries is a data change and may alter detection results without changing API types;
- language-pack data versions should be visible in release notes.

## 18. Decisions locked by this draft

- Package name is `profanity-kit`.
- The primary immutable factory is `createDetector()`; no public or internal class is required.
- TypeScript-first with documented public exports.
- The root is the English convenience entry; `/core` is dictionary-free.
- Built-in language packs are imported only from `profanity-kit/languages/*` subpaths.
- One ESM output serves native imports and modern Node.js `require()`; no `.cjs` duplicate and no top-level `await`.
- Node.js support starts at `22.13.0`; the initial browser policy is Baseline Widely Available with native ESM and Unicode property escapes. Exact browser versions remain test-gated.
- Indonesian can be used independently and multiple explicit language packs can be combined.
- Whole-word matching only.
- Default case normalization uses `toLowerCase()`; packs may declaratively request locale-aware casing.
- Diacritics are preserved in MVP, with a pack-level normalization extension point reserved for future folding.
- Unicode letters, combining marks, and numbers form words; apostrophes, hyphens, and underscores are boundaries.
- Rich `findAll()` output includes every occurrence.
- Match attribution supports overlapping dictionaries.
- Custom blocklist and allowlist are instance-scoped.
- Configuration is immutable after creation.
- `replacement` is exactly one Unicode code point in MVP; future replacement strategies must be additive.
- `LanguagePack.words` is public and readonly; detectors snapshot pack data at initialization.
- Each built-in dictionary exposes a lightweight version, while full provenance is a separately tree-shakeable export and documentation resource.
- APIs are synchronous and runtime-agnostic.
- Zod integration starts as documentation, not a core dependency.
- Web docs, playground, `llms.txt`, and `llms-full.txt` are part of the DX direction.

## 19. Implementation gate

The initial public design decisions are resolved. Before this contract is marked stable, the proof of concept must validate:

1. root English and dictionary-free `/core` bundle isolation;
2. ESM import and modern Node.js `require()` for every public subpath;
3. Unicode tokenization and original UTF-16 offset correctness;
4. callback-safe detector methods without `this` binding;
5. immutable snapshots of custom pack data;
6. tree-shaking of unused dictionaries and provenance metadata;
7. single-code-point replacement behavior;
8. type inference of active language codes;
9. browser and runtime compatibility claims;
10. performance and bundle-size budgets defined by the architecture plan.

## 20. Engineering direction

The implementation is planned as a lightweight pnpm monorepo containing one
publishable package and one private documentation application. It does not use
a task orchestrator in the MVP.

The selected development stack is:

- tsdown for ESM builds and declaration generation;
- Vitest for runtime tests and TSTyche for public type contracts;
- Oxlint with type-aware linting, Oxfmt, and `tsc --noEmit` as the authoritative
  type check;
- Nimbus for the Astro-based documentation site and a Svelte 5 island for the
  playground;
- Changesets for version intent and changelog generation;
- GitHub Actions with npm Trusted Publishing for releases;
- Renovate for grouped dependency and GitHub Actions updates;
- Lefthook and commitlint for local Git checks.

The npm artifact contains only compiled package output, declarations, package
metadata, README, and license material. Documentation dependencies and build
tooling must never appear as runtime dependencies of `profanity-kit`.

Detailed technical reasoning is maintained in `docs/decisions/`. Operational
commands are intentionally treated as adjustable implementation details rather
than permanent architectural contracts.

## 21. Distribution scope

The MVP is published to npm only. Runtime-agnostic implementation remains a
design constraint, but JSR publishing and official Deno support are not part of
the initial release contract. Additional runtimes may be adopted later after
artifact-level integration tests, without changing the detector API.
