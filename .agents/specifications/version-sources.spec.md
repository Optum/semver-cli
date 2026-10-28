# Version sources

This chapter defines how semver-cli derives the current version and how commands
apply a proposed version. The source is selected by the top level `source`
setting in the version configuration.

## Source selection

The supported sources are `file` and `git`. When `source` is absent, the source
is `file`.

## File source

An existing `VERSION` file in the working directory is authoritative. When it is
absent, the CLI initializes it from the nearest parseable local Git tag
reachable from the current ref. If no such tag exists, it initializes the file
to `0.1.0`.

`get` reports a version derived from the current file without changing its
content. `inc` persists the proposed version to the file and applies configured
post hooks. `set` writes the specified version to the file and applies the
configured post hooks.

## Git source

The nearest parseable local Git tag reachable from the current ref is
authoritative. If no such tag exists, the current version is `0.1.0`. Commands
that resolve the current version remove an existing `VERSION` file.

`get` and `parse` without an explicit value derive their result from that
current version. `inc` calculates and reports a proposed version using the same
version calculation as `git-latest` and applies configured post hooks. It does
not write a `VERSION` file or create a tag. `set` applies the specified version
to configured post hooks without creating a `VERSION` file or a tag.

## Tag lookup

The nearest tag is the first parseable version tag reachable while walking
commits from the current ref, using only the commit history currently available
locally. When several version tags name the same commit, the highest version
among them is used. Tags on unrelated branches are excluded.

In a shallow repository with an `origin` remote, resolution first checks whether
the remote advertises any tags at all. If so, it deepens the current checkout's
commit history incrementally, filtering out file trees and blobs, and re-checks
the local tags after each fetch until it finds a reachable tag or the full
history has been fetched. This may also fetch tags unrelated to the current ref,
but never their tree or blob contents. A complete repository, a shallow
repository without `origin`, or a remote with no tags at all uses `0.1.0`
without deepening further.
