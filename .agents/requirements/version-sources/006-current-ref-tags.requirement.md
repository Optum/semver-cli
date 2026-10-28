---
id: version-sources-006
title: Tag lookup excludes tags outside the current ref
spec_ref: ".agents/specifications/version-sources.spec.md#tag-lookup"
---

# Tag lookup excludes tags outside the current ref

## Requirement

Preconditions:

- A higher version tag exists only on an unrelated branch.
- A lower version tag is reachable from the current ref.

Expected behavior:

- Tag based resolution MUST choose the reachable tag even though the unrelated
  tag has a higher version.
- It MUST work without a configured remote.

Postconditions:

- Neither the branch nor its tags are changed by lookup.
- Tests: `src/util/source.test.ts` (`req:version-sources-006`).
