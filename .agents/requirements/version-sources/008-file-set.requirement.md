---
id: version-sources-008
title: File set persists the specified version and runs hooks
spec_ref: ".agents/specifications/version-sources.spec.md#file-source"
---

# File set persists the specified version and runs hooks

## Requirement

Preconditions:

- The source is `file` and a post hook targets a project file.

Expected behavior:

- `set` MUST write the specified version, including prerelease metadata, to
  `VERSION` and apply the configured post hook with that version.

Postconditions:

- Both `VERSION` and the hook target reflect the specified version.
- Tests: `src/util/source.test.ts` (`req:version-sources-008`).
