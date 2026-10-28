---
id: version-sources-004
title: Git increment updates hooks without writing the source of truth
spec_ref: ".agents/specifications/version-sources.spec.md#git-source"
---

# Git increment updates hooks without writing the source of truth

## Requirement

Preconditions:

- The configuration sets `source: git` and defines a post hook.

Expected behavior:

- `inc patch` MUST report the same proposed version as `git-latest patch`.
- Every `inc` variant MUST apply configured post hooks with its proposed
  version.
- It MUST NOT create `VERSION` or a tag.

Postconditions:

- Local tags are unchanged, and the hook target reflects the proposed version.
- Tests: `src/util/source.test.ts` (`req:version-sources-004`).
