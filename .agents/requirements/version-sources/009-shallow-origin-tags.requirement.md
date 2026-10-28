---
id: version-sources-009
title: Shallow clones stop deepening at the nearest version tag
spec_ref: ".agents/specifications/version-sources.spec.md#tag-lookup"
---

# Shallow clones stop deepening at the nearest version tag

## Requirement

Preconditions:

- A shallow checkout has an `origin` remote and a parseable tag beyond its
  shallow boundary.
- An older reachable tag has a higher version number.
- Another branch has an unrelated, higher version tag.

Expected behavior:

- Tag based resolution MUST deepen only the current checkout's commit history,
  with a tree and blob filter, until the nearest parseable tag is found.
- It MUST stop deepening once that tag is found and fetch only that tag object.
- It MUST report the nearest tag's version even when an older reachable tag has
  a higher version number.
- If the remote has no parseable version tags, it MUST use `0.1.0` without
  deepening the checkout.

Postconditions:

- The selected tag is available locally and the repository remains shallow when
  older history exists beyond it.
- The older and unrelated tags, their commits, and historical tree and blob
  objects are absent locally.
- Tests: `src/util/source.test.ts` (`req:version-sources-009`).
