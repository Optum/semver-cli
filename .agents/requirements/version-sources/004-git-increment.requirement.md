---
id: version-sources-004
title: Git increment reports a proposal without changing state
spec_ref: ".agents/specifications/version-sources.spec.md#git-source"
---

# Git increment reports a proposal without changing state

## Requirement

Preconditions:

- The configuration sets `source: git` and defines a post hook.

Expected behavior:

- `inc patch` MUST report the same proposed version as `git-latest patch`.
- It MUST NOT create `VERSION` or a tag, and MUST NOT run the post hook.

Postconditions:

- Local tags and the hook target retain their original content.
- Tests: `src/util/source.test.ts` (`req:version-sources-004`).
