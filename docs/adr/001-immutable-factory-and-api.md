# ADR-001 — Immutable factory and public API

**Status:** Accepted

## Context

The detector needs predictable behavior, strong type inference, callback-safe
methods, and no global mutable dictionary. A public class would expose
constructor and inheritance behavior as compatibility commitments even though
the detector has no mutable lifecycle.

## Decision

Expose `createDetector()` and return an immutable `ProfanityDetector` interface.
Use closures rather than a public or internal class. Snapshot configuration and
custom language-pack data during creation. Public methods are `check`,
`isClean`, `findAll`, and `filter`, and remain safe when passed as callbacks.

## Alternatives considered

- `new ProfanityDetector()` is familiar but makes subclassing, constructor
  behavior, and `this` binding part of the API.
- `createProfanity()` is shorter but semantically sounds like it creates
  profanity rather than a detector.
- A mutable singleton is convenient initially but creates cross-request state,
  dual-module hazards, and unpredictable tests.

## Technical reasoning

Factory generics can infer active language codes from literal pack input while
the implementation remains replaceable. Closure-backed methods avoid lost
`this` errors in integrations such as Zod `.refine(detector.isClean)`.
Immutability also permits matcher compilation once per detector and removes the
need for invalidation logic.

## Consequences

There is no supported `instanceof`, subclassing, `addWords`, or `removeWords`.
Changing configuration means creating another detector. Future capabilities
must be added through options or additive factories rather than mutation.

## Reconsider when

A validated use case requires long-lived mutable dictionaries and the measured
cost of creating replacement detectors is unacceptable.
