# semver-cli requirements

Testable requirements derived from the chapters in
[`../specifications/`](../specifications/README.md), one per file under a topic
folder. Each cites the section it refines in `spec_ref`, and the tests that
verify it cite it with `req:{id}`.

## Topics

- [Version sources](version-sources/001-file-authority.requirement.md) covers
  source selection, file initialization, tag lookup, increments, and setting a
  version. The requirements are verified by `src/util/config.test.ts` and
  `src/util/source.test.ts`.
