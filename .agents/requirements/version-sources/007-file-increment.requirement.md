---
id: version-sources-007
title: File increment persists the proposed version and runs hooks
spec_ref: ".agents/specifications/version-sources.spec.md#file-source"
---

# File increment persists the proposed version and runs hooks

## Requirement

Preconditions:

- The source is `file`, `VERSION` contains `1.2.3`, and a post hook targets a
  project file containing `1.2.3`.

Expected behavior:

- `inc patch` MUST persist `1.2.4` in `VERSION` and apply the configured hook
  with that version.

Postconditions:

- Both `VERSION` and the hook target reflect `1.2.4`.
- Tests: `src/util/source.test.ts` (`req:version-sources-007`).
