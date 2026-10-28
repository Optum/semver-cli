---
id: version-sources-003
title: Git source derives the current version from tags
spec_ref: ".agents/specifications/version-sources.spec.md#git-source"
---

# Git source derives the current version from tags

## Requirement

Preconditions:

- The configuration sets `source: git`.

Expected behavior:

- `get` and `parse` without a value MUST report the version from the nearest
  parseable local tag reachable from the current ref, or `0.1.0` if none exists.
- If several version tags point to that commit, any one of them MAY be selected
  without comparing version numbers.
- Resolving the current version MUST remove an existing `VERSION` file.

Postconditions:

- The resolved version is independent of the former file content.
- Tests: `src/util/config.test.ts` and `src/util/source.test.ts`
  (`req:version-sources-003`).
