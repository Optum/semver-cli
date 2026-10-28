---
id: version-sources-002
title: Missing VERSION is initialized from a tag or the default
spec_ref: ".agents/specifications/version-sources.spec.md#file-source"
---

# Missing VERSION is initialized from a tag or the default

## Requirement

Preconditions:

- The source is `file` and `VERSION` is absent.

Expected behavior:

- The CLI MUST create `VERSION` containing the highest parseable local tag
  reachable from the current ref, or `0.1.0` when no such tag exists.
- Initialization MUST work outside a Git repository by using `0.1.0`.

Postconditions:

- The file contains the selected version followed by a newline.
- Tests: `src/util/source.test.ts` (`req:version-sources-002`).
