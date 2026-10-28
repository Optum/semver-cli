---
id: version-sources-009
title: Shallow clones fetch reachable tags from origin
spec_ref: ".agents/specifications/version-sources.spec.md#tag-lookup"
---

# Shallow clones fetch reachable tags from origin

## Requirement

Preconditions:

- A shallow checkout has an `origin` remote and a parseable tag on an earlier
  commit reachable through that remote.
- The tag is absent from the shallow checkout before version resolution.

Expected behavior:

- Tag based resolution MUST fetch tags from `origin` and complete the shallow
  history before selecting the current version.
- It MUST return the reachable tag's version instead of the fallback.

Postconditions:

- The tag is available locally and the repository is no longer shallow.
- Tests: `src/util/source.test.ts` (`req:version-sources-009`).
