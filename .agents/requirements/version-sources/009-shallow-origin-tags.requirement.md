---
id: version-sources-009
title: Shallow clones fetch current history and reachable tags only
spec_ref: ".agents/specifications/version-sources.spec.md#tag-lookup"
---

# Shallow clones fetch current history and reachable tags only

## Requirement

Preconditions:

- A shallow checkout has an `origin` remote and a parseable tag on an earlier
  commit reachable through that remote.
- The tag is absent from the shallow checkout before version resolution.
- A lower version tag is closer to the current ref than the highest version tag.
- Another branch has an unrelated, higher version tag.

Expected behavior:

- Tag based resolution MUST fetch the current checkout's missing commit history
  from `origin` with a tree and blob filter.
- It MUST fetch only the highest parseable tag on that history without fetching
  other tags or unrelated branch histories.
- It MUST return the reachable tag's version instead of the fallback.

Postconditions:

- The reachable tag is available locally and the repository is no longer
  shallow.
- The lower and unrelated tags, the unrelated commit, and historical tree and
  blob objects are absent locally.
- Tests: `src/util/source.test.ts` (`req:version-sources-009`).
