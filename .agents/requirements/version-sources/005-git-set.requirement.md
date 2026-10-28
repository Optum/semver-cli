---
id: version-sources-005
title: Git set applies hooks without persisting the specified version
spec_ref: ".agents/specifications/version-sources.spec.md#git-source"
---

# Git set applies hooks without persisting the specified version

## Requirement

Preconditions:

- The configuration sets `source: git` and defines a post hook.

Expected behavior:

- `set` MUST apply its specified version, including prerelease metadata, to the
  configured post hook.
- It MUST NOT create `VERSION` or a Git tag.

Postconditions:

- The hook target reflects the specified version; the tag set is unchanged.
- Tests: `src/util/source.test.ts` (`req:version-sources-005`).
