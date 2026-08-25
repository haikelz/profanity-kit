# ADR-003 — Unicode matching algorithm

**Status:** Provisional

## Context

JavaScript `\b` is ASCII-oriented and cannot express the project's Unicode
whole-word contract. A giant regular expression is hard to escape, attribute,
and maintain. Trie or Aho–Corasick structures add complexity before corpus and
benchmark data justify them.

## Decision

Tokenize input in one Unicode-aware pass, then look up each normalized complete
word in a compiled `Map`. Unicode letters, combining marks, and numbers form a
word. Apostrophes, hyphens, underscores, punctuation, and whitespace are
boundaries in the MVP.

Compile normalized dictionary entries once per detector. `check()` exits on the
first match; `findAll()` scans fully; `filter()` reconstructs output from source
segments. Preserve original UTF-16 offsets while replacement length is based on
Unicode code points.

Default normalization is NFC followed by `toLowerCase()`. Language packs may
declaratively select locale-aware casing later. Diacritics remain significant
in the MVP, while the pipeline retains a future pack-level folding stage.

## Complexity

For dictionary size `D` and input length `N`, detector compilation is `O(D)` and
detection is expected `O(N)` plus map lookups. Memory is `O(D)` per detector.
No global cache is used initially because cache identity, mutation, and lifetime
would add correctness risks before measurements show a need.

## Alternatives considered

- Substring matching creates false positives such as `ass` in `classic`.
- One giant regex creates escaping, backtracking, attribution, and bundle costs.
- Trie/Aho–Corasick may help phrase or substring search, which is outside MVP.

## Consequences

`ass` and `asshole` require separate entries. Phrase matching, aggressive
leetspeak handling, and contextual moderation remain unsupported. Boundary and
offset behavior becomes a public compatibility contract and needs corpus tests.

## Reconsider when

Benchmarks with the real dictionaries show the map index misses agreed budgets,
or the product adopts phrases/substrings that materially change the problem.
