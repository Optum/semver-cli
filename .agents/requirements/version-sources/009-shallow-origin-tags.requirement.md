---
id: version-sources-009
title: Shallow clones deepen minimally to find the nearest version tag
spec_ref: ".agents/specifications/version-sources.spec.md#tag-lookup"
---

# Shallow clones deepen minimally to find the nearest version tag

## Requirement

Preconditions:

- A shallow checkout has an `origin` remote and a parseable tag beyond its
  shallow boundary.
- An older reachable tag has a higher version number.
- Another branch has an unrelated, higher version tag.

Expected behavior:

- Tag based resolution MUST deepen only the current checkout's commit history,
  filtering out file trees and blobs, re-checking local tags after each fetch,
  until a reachable tag is found or the full history has been fetched.
- It MUST report the nearest tag's version even when an older reachable tag has
  a higher version number, and even when deepening also pulls in unrelated tags.
- If the remote advertises no tags at all, it MUST use `0.1.0` without deepening
  the checkout.

Postconditions:

- Historical tree and blob objects beyond the resolved tag are absent locally.
- Tests: `src/util/source.test.ts` (`req:version-sources-009`).
