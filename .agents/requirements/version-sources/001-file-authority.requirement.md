---
id: version-sources-001
title: File source uses VERSION as its authority
spec_ref: ".agents/specifications/version-sources.spec.md#source-selection; .agents/specifications/version-sources.spec.md#file-source"
---

# File source uses VERSION as its authority

## Requirement

Preconditions:

- The configuration omits `source` or sets it to `file`.
- `VERSION` contains a valid version, which may differ from the latest tag.

Expected behavior:

- `get` MUST report the version in `VERSION`.
- `get` MUST NOT change the existing file.

Postconditions:

- `VERSION` retains its original content.
- Tests: `src/util/config.test.ts` and `src/util/source.test.ts`
  (`req:version-sources-001`).
